import { Mic, MicOff } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner';

const MAX_RETRY = 3;

function SpeechTest() {
    const [isRecording, setIsRecording] = useState<boolean>(false);
    const [interimTranscript, setInterimTranscript] = useState<string>("");
    const [finalTranscript, setFinalTranscript] = useState<string>("");
    const speechRecognitionRef = useRef<SpeechRecognition | null>(null);
    const manuallyStopedRef = useRef(false);
    const retryCountRef = useRef(0);

    const handleSpeak = () => {
        if (!speechRecognitionRef.current) return;
        if (isRecording) return

        speechRecognitionRef.current.start();
        manuallyStopedRef.current = false;
        retryCountRef.current = 0;
    }
    const handleStop = () => {
        if (speechRecognitionRef.current) {
            speechRecognitionRef.current.stop()
            manuallyStopedRef.current = true;
        }
    }

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            toast.error("Browser does not supports STT switch to Chrome!!");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.lang = 'en-US';
        recognition.interimResults = true;

        recognition.onstart = () => {
            console.log("recording started");
            setIsRecording(true)
        }

        recognition.onresult = (e) => {
            let interim = "", final = "";

            for (let i = e.resultIndex; i < e.results.length; i++) {
                const transcript = e.results[i][0].transcript;

                if (e.results[i].isFinal) {
                    final += transcript + " "
                }
                else interim += transcript;
            }

            if (final) {
                setFinalTranscript((prev) => prev + final)
            }

            setInterimTranscript(interim)
        }

        recognition.onend = e => {
            console.log("Recoring stopped", e);
            if (!manuallyStopedRef.current && retryCountRef.current < MAX_RETRY) {
                recognition.start()
                retryCountRef.current += 1;
            } else {
                setIsRecording(false);
                setInterimTranscript("");
            }
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
        <div className='min-h-screen bg-black flex flex-col gap-y-2 items-center justify-center'>
            <button
                onClick={isRecording ? handleStop : handleSpeak}
                className={`relative flex items-center justify-center w-20 h-20 rounded-full shadow-lg transition-all transform hover:scale-105 active:scale-95 outline-1 cursor-pointer disabled:opacity-50 disabled:transform-none ${isRecording
                    ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20'
                    : 'bg-white hover:bg-neutral-200 text-neutral-950 shadow-white/10'
                    }`}
            >
                {isRecording ? (
                    <MicOff className="w-8 h-8 text-white" />
                ) : (
                    <Mic className={`w-8 h-8`} />
                )}
            </button>
            <p className="text-sm text-neutral-400">
                {isRecording
                    ? "Listening..."
                    : "Click microphone to speak"}
            </p>
            {/* LIVE CAPTIONS */}
            <div className="max-w-2xl text-center text-2xl leading-relaxed">
                {/* confirmed text */}
                <span className="text-white">
                    {finalTranscript}
                </span>

                {/* live temporary text */}
                <span className="text-red-600">
                    {interimTranscript}
                </span>
            </div>
        </div>
    )
}

export default SpeechTest
