import { useState, useEffect, useRef, useCallback } from 'react';
import api from '@/lib/api';
import { toast } from 'sonner';

export type InterviewStatus = "connecting" | "idle" | "listening" | "processing" | "playing" | "failed" | "ending";

export function useInterviewSession(id: string) {
    const [status, setStatus] = useState<InterviewStatus>("connecting");
    const [timeLeft, setTimeLeft] = useState<string | null>(null);
    const [aiQuestion, setAiQuestion] = useState("");
    const [transcript, setTranscript] = useState("");
    const [finalTranscript, setFinalTranscript] = useState("");
    const [isRecording, setIsRecording] = useState(false);
    
    const [deepgramToken, setDeepgramToken] = useState<string | null>(null);
    const socketRef = useRef<WebSocket | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
    const isSubmittingRef = useRef(false);
    const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const endInterview = async () => {
        try {
            const { data } = await api.post(`/interviews/${id}/end`);
            if(data.success){
                toast.success("Interview ended successfully");
            }
        } catch (error) {
            console.error("Failed to end interview", error);
        }
    };

    const cleanupRecording = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }
        if (socketRef.current) {
            socketRef.current.close();
        }
        if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
        }
        setIsRecording(false);
    }, []);

    const playTTS = useCallback((text: string) => {
        return new Promise<void>((resolve) => {
            window.speechSynthesis.cancel();
            setStatus("processing");
            const utterance = new SpeechSynthesisUtterance(text);
            
            utterance.onstart = () => {
                setStatus("playing");
            };
            
            utterance.onend = () => {
                setStatus("idle");
                resolve();
            };
            
            utterance.onerror = (e) => {
                console.error("TTS Error", e);
                setStatus("idle");
                resolve();
            };
            
            window.speechSynthesis.speak(utterance);
        });
    }, []);

    // Initial setup
    useEffect(() => {
        let cancelled = false;

        const initWithRetry = async (attempt = 0): Promise<void> => {
            try {
                const startRes = await api.post(`/interviews/${id}/start`);
                if (cancelled) return;

                if (startRes.data.success && startRes.data.nextQuestion) {
                    setAiQuestion(startRes.data.nextQuestion);

                    if (startRes.data.endTime) {
                        const endTimeMs = new Date(startRes.data.endTime).getTime();
                        const timeRemainingMs = endTimeMs - Date.now();
                        const warningDelay = timeRemainingMs - 10000;
                        
                        if (warningDelay > 0) {
                            setTimeout(() => {
                                setStatus("ending");
                                const warningText = "That was great but the interview time is up and im afraid you will be disconnected, dont worry your answers are saved and you will get evaluation in a short time, thank you";
                                endInterview();
                                cleanupRecording();
                                setAiQuestion(warningText);
                                window.speechSynthesis.cancel();
                                playTTS(warningText);
                                setTimeout(() => {
                                    window.location.href = `/myinterviews`; 
                                }, 10000);
                            }, warningDelay);
                        }
                        
                        const updateTimer = () => {
                            if (cancelled) return;
                            const now = Date.now();
                            const remaining = Math.max(0, endTimeMs - now);
                            if (remaining > 0) {
                                const mins = Math.floor(remaining / 60000);
                                const secs = Math.floor((remaining % 60000) / 1000);
                                setTimeLeft(`${mins}:${secs.toString().padStart(2, '0')}`);
                            } else {
                                setTimeLeft("0:00");
                            }
                        };
                        updateTimer();
                        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
                        timerIntervalRef.current = setInterval(updateTimer, 1000);
                    }

                    const tokenRes = await api.post('/interviews/deepgram-token');
                    if (!cancelled && tokenRes.data.success) {
                        setDeepgramToken(tokenRes.data.token);
                    }

                    await playTTS(startRes.data.nextQuestion);
                }
            } catch (error: any) {
                if (cancelled) return;
                const statusCode = error?.response?.status;
                if (statusCode === 429 && attempt < 5) {
                    const delay = 1500 * (attempt + 1);
                    setTimeout(() => initWithRetry(attempt + 1), delay);
                    return;
                }
                console.error("Failed to initialize interview", error);
                setStatus("failed");
            }
        };

        initWithRetry();
        return () => {
            cancelled = true;
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
            cleanupRecording();
            window.speechSynthesis.cancel();
        };
    }, [id, cleanupRecording, playTTS]);

    const replayQuestion = useCallback(() => {
        if (aiQuestion && status !== "listening" && status !== "processing") {
            playTTS(aiQuestion);
        }
    }, [aiQuestion, status, playTTS]);

    const submitAnswer = useCallback(async (answerText: string) => {
        if (isSubmittingRef.current) return;
        isSubmittingRef.current = true;

        cleanupRecording();
        setStatus("processing");
        setTranscript("");
        setFinalTranscript("");
        
        try {
            const submitRes = await api.post(`/interviews/${id}/submit`, { answer: answerText });
            if (submitRes.data.success && submitRes.data.nextQuestion) {
                setAiQuestion(submitRes.data.nextQuestion);
                await playTTS(submitRes.data.nextQuestion);
            } else if (submitRes.data.isCompleted) {
                setAiQuestion("Interview Completed! Thank you.");
                setStatus("idle");
            }
        } catch (error) {
            console.error("Submit answer failed", error);
            setStatus("idle");
        } finally {
            isSubmittingRef.current = false;
        }
    }, [id, cleanupRecording, playTTS]);

    const handleSilence = useCallback(() => {
        setFinalTranscript(prev => {
            if (prev.trim().length > 0) {
                submitAnswer(prev);
            } else {
                cleanupRecording();
                setStatus("idle");
            }
            return prev;
        });
    }, [submitAnswer, cleanupRecording]);

    const resetSilenceTimer = useCallback(() => {
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = setTimeout(() => {
            handleSilence();
        }, 3500); 
    }, [handleSilence]);

    const startRecording = useCallback(async () => {
        if (!deepgramToken) return;
        setStatus("connecting");
        
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;

            const socket = new WebSocket('wss://api.deepgram.com/v1/listen?model=nova-2&punctuate=true&interim_results=true', ['token', deepgramToken]);
            socketRef.current = socket;

            socket.onopen = () => {
                setStatus("listening");
                setIsRecording(true);
                mediaRecorder.addEventListener('dataavailable', (event) => {
                    if (event.data.size > 0 && socket.readyState === 1) {
                        socket.send(event.data);
                    }
                });
                mediaRecorder.start(250);
                resetSilenceTimer();
            };

            socket.onmessage = (message) => {
                const received = JSON.parse(message.data);
                const transcriptPiece = received.channel?.alternatives?.[0]?.transcript;
                if (transcriptPiece) {
                    if (received.is_final) {
                        setFinalTranscript(prev => prev + " " + transcriptPiece);
                        setTranscript("");
                    } else {
                        setTranscript(transcriptPiece);
                    }
                    resetSilenceTimer();
                }
            };

            socket.onclose = () => {
                setIsRecording(false);
            };

        } catch (error) {
            console.error("Mic access denied or WebSocket failed", error);
            setStatus("failed");
        }
    }, [deepgramToken, resetSilenceTimer]);

    const toggleRecording = useCallback(() => {
        if (isRecording) {
            setFinalTranscript(prev => {
                const fullAnswer = prev + " " + transcript;
                if (fullAnswer.trim().length > 0) {
                    submitAnswer(fullAnswer);
                } else {
                    cleanupRecording();
                    setStatus("idle");
                }
                return fullAnswer;
            });
        } else {
            startRecording();
        }
    }, [isRecording, transcript, submitAnswer, cleanupRecording, startRecording]);

    return {
        status,
        timeLeft,
        aiQuestion,
        transcript,
        finalTranscript,
        isRecording,
        toggleRecording,
        replayQuestion
    };
}
