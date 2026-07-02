'use client'
import api from '@/lib/api';
import { Mic, MicOff } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner';

type Status = "ai-speaking" | "user-speaking" | "idle" | "processing" | "completed" | "error" | 'loading'

const sleep = () => new Promise(resolve => setTimeout(resolve, 1000));

function FakeInterviewLoop() {
    const [isRecording, setIsRecording] = useState<boolean>(false);
    const [interimTranscript, setInterimTranscript] = useState<string>("");
    const [finalTranscript, setFinalTranscript] = useState<string>("");
    const [status, setStatus] = useState<Status>("idle");
    const [currentQ,setCurrentQ] = useState<string>("");
    const speechRecognitionRef = useRef<SpeechRecognition | null>(null);
    const manuallyStopedRef = useRef(false);
    const finalTranscriptRef = useRef<string>("");
    const silenceDetectRef = useRef<NodeJS.Timeout | null>(null)



    const handleSpeak = () => {
        if (!speechRecognitionRef.current) return;
        if (isRecording) return

        speechRecognitionRef.current.start();
        manuallyStopedRef.current = false;
    }
    const handleStop = () => {
        if (speechRecognitionRef.current) {
            speechRecognitionRef.current.stop()
            manuallyStopedRef.current = true;
        }
    }

    const playAudio = (audioBuffer: Blob) => {
        return new Promise((resolve, reject) => {

            const audioUrl = URL.createObjectURL(audioBuffer);
            const audio = new Audio(audioUrl);

            audio.onended = () => {
                resolve("audio completed")
                URL.revokeObjectURL(audioUrl)
            }

            audio.onerror = () => {
                URL.revokeObjectURL(audioUrl);
                reject(new Error("Failed to play audio"))
            };

            audio.play().catch(reject);
        })
    }

    const startInterview = async () => {
        await askNextQuestion();
    }

    const processAnswer = async (answer: string) => {
        setStatus("processing");
        console.log("ANSWER:", answer);
        await sleep();
        
        await askNextQuestion(answer);
    }

    const askNextQuestion = async (answer?:string) => {
        try {
            setStatus("ai-speaking");

            const nextQuestionRes = await api.post("/interviews/submit-answer",{
                answer
            })
            const nextQuestion = nextQuestionRes.data.nextQuestion
            setCurrentQ(nextQuestion)
            const ttsResponse = await api.post(
                "/voice/synthesize",
                { text: nextQuestion },
                { responseType: "blob" }
            );

            await playAudio(ttsResponse.data)
            setStatus('user-speaking')
            handleSpeak()
        } catch (error) {
            setStatus("error")
        }

    }

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            toast.error("Browser does not supports STT switch to Chrome!!");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onstart = () => {
            console.log("recording started");
            setIsRecording(true)
        }

        recognition.onresult = (e) => {
            if(silenceDetectRef.current) {
                clearTimeout(silenceDetectRef.current)
            }
            silenceDetectRef.current = setTimeout(()=>{
                manuallyStopedRef.current = true;
                recognition.stop();
            },3000)
            let interim = "", final = "";

            for (let i = e.resultIndex; i < e.results.length; i++) {
                const transcript = e.results[i][0].transcript;

                if (e.results[i].isFinal) {
                    final += transcript + " "
                }
                else interim += transcript;
            }

            if (final) {
                setFinalTranscript((prev) => {
                    const updated = prev + final;
                    finalTranscriptRef.current = updated;
                    return updated;
                });
            }

            setInterimTranscript(interim)
        }

        recognition.onend = async e => {
            if(!manuallyStopedRef.current){
                recognition.start();
                return;
            }
            setIsRecording(false);
            const answer = finalTranscriptRef.current;
            setInterimTranscript("");
            await processAnswer(answer);
            setFinalTranscript("");
            finalTranscriptRef.current = "";
        }

        recognition.onerror = e => {
            console.log("Error occured", e);
            toast.error(e.error ? "Browser does not supports STT switch to Chrome!!" : "Something went wrong, try again!!")
            setIsRecording(false)
        }

        speechRecognitionRef.current = recognition;

        return () => {
            recognition.stop();
        }

    }, [])


    return (
        <div className='min-h-screen flex flex-col gap-y-2 items-center justify-center'>
            {
                status == "user-speaking" && (
                    <>
                        <div className='text-lg text-gray-600'>
                            <span className="text-white">
                                {finalTranscript}
                            </span>

                            {/* live temporary text */}
                            <span className="text-red-600">
                                {interimTranscript}
                            </span>
                        </div>
                    </>
                )
            }
            {
                status == 'idle' && (
                    <button
                        onClick={startInterview}
                        className={`flex items-center gap-x-2 bg-blue-500 hover:bg-blue-600 cursor-pointer text-white font-bold py-2 px-4 rounded`}
                    >
                        Start Interview
                    </button>
                )
            }
            {
                status == 'ai-speaking' && (
                    <div className='text-2xl font-bold'>
                        <p>{currentQ}</p>
                    </div>
                )
            }
            {status === "processing" && (
                <p>Processing answer...</p>
            )}
            {
                status == "completed" && <p>Interview completed!</p>
            }
            {
                status == "error" && (
                    <div>
                        <p>Something went wrong, please try again!!</p>
                        <button
                            onClick={startInterview}
                            className={`flex items-center gap-x-2 bg-blue-500 hover:bg-blue-600 cursor-pointer text-white font-bold py-2 px-4 rounded`}
                        >
                            Restart Interview
                        </button>
                    </div>
                )
            }
            {
                status == "loading" && <p>Loading...</p>
            }
        </div>
    )
}
export default FakeInterviewLoop
