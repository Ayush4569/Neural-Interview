'use client';

import { useState, useEffect, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Button } from "@/components/ui/button";
import { SpeechRecognitionEvent, ISpeechRecognition, ISpeechRecognitionConstructor } from '@/types/speech';
import { Bot, Loader2, LogOut, Mic, MicOff, RefreshCcw, User, Volume2 } from 'lucide-react';

export default function InterviewRoom({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentCaption, setCurrentCaption] = useState('Initializing interview...');
  const [lastAiMessage, setLastAiMessage] = useState('');
  
  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const transcriptRef = useRef<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as unknown as { SpeechRecognition: ISpeechRecognitionConstructor, webkitSpeechRecognition: ISpeechRecognitionConstructor }).SpeechRecognition || (window as unknown as { SpeechRecognition: ISpeechRecognitionConstructor, webkitSpeechRecognition: ISpeechRecognitionConstructor }).webkitSpeechRecognition;
      if (SpeechRecognition ) {
        
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;

        recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
          let interimTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              transcriptRef.current += event.results[i][0].transcript;
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }

          const currentFullText = transcriptRef.current + interimTranscript;
          setCurrentCaption(`(You) ${currentFullText}`);

          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = setTimeout(() => {
            if (transcriptRef.current || interimTranscript) {
              const textToSend = transcriptRef.current + interimTranscript;
              handleSend(textToSend);
              transcriptRef.current = '';
              recognitionRef.current?.stop();
            }
          }, 3000);
        };

        recognitionRef.current.onerror = (event: Event) => {
          setIsListening(false);
        };
        recognitionRef.current.onend = () => setIsListening(false);
      }
      synthRef.current = window.speechSynthesis;
    }

    startInteraction();

    return () => {
      if (synthRef.current) synthRef.current.cancel();
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    };
  }, [id]);

  const startInteraction = async () => {
    try {
      const res = await api.post(`/interviews/session/${id}/begin`);
      if (res.data.status === 'completed') {
        router.push('/myinterviews');
        return;
      }
      const aiMsg = res.data.aiMessage;
      setLastAiMessage(aiMsg);
      speak(aiMsg);
    } catch (error) {
      router.push('/myinterviews');
    } finally {
      setLoading(false);
    }
  };

  const handleFinalComplete = async () => {
    try {
      setLoading(true);
      await api.post(`/interviews/session/${id}/terminate`);
      router.push('/myinterviews');
    } catch (e) {
      router.push('/');
    }
  };

  const speak = (text: string) => {
    if (!synthRef.current) return;
    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => {
      setIsSpeaking(true);
      setCurrentCaption(text);
    };
    utterance.onend = () => {
      setIsSpeaking(false);
      setCurrentCaption('...');
    };
    synthRef.current.speak(utterance);
  };

  const handleSend = async (text: string) => {
    if (!text.trim()) return;
    
    setLoading(true);
    setCurrentCaption('Thinking...');

    try {
      const res = await api.post(`/interviews/session/${id}/interact`, { answer: text, isEnding: false });
      const aiMsg = res.data.aiMessage;
      
      setLastAiMessage(aiMsg);
      speak(aiMsg);

    } catch (error) {
       setCurrentCaption('Error reaching AI...');
    } finally {
      setLoading(false);
    }
  };

  const toggleMic = () => {
    if (isListening) {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      recognitionRef.current?.stop();
    } else {
      setIsListening(true);
      transcriptRef.current = '';
      recognitionRef.current?.start();
    }
  };

  const repeatLastMessage = () => {
    if (lastAiMessage) speak(lastAiMessage);
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)] bg-[#0F1115] text-white p-6 md:p-10">
      <header className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg">
             <Bot className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-semibold">Technical Interview</h1>
        </div>
      </header>

      <div className="flex-1 max-w-6xl w-full mx-auto flex flex-col justify-center gap-8">
        
        {/* Avatars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full h-[50vh] min-h-[300px]">
          
          {/* AI Card */}
          <div className={`flex flex-col items-center justify-center bg-[#161920] rounded-3xl border ${isSpeaking ? 'border-indigo-500 shadow-[0_0_30px_-5px_rgba(99,102,241,0.4)]' : 'border-gray-800'} transition-all duration-300`}>
             <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full bg-linear-to-br from-indigo-500/20 to-purple-600/20 flex items-center justify-center border-4 border-[#1E232D]">
               {isSpeaking && (
                 <div className="absolute inset-0 rounded-full border-2 border-indigo-400 animate-ping opacity-20"></div>
               )}
               <Volume2 className={`h-12 w-12 ${isSpeaking ? 'text-indigo-400' : 'text-gray-500'}`} />
             </div>
             <h2 className="mt-6 text-xl font-medium tracking-wide">AI Interviewer</h2>
          </div>

          {/* User Card */}
          <div className={`flex flex-col items-center justify-center bg-[#161920] rounded-3xl border ${isListening ? 'border-pink-500 shadow-[0_0_30px_-5px_rgba(236,72,153,0.4)]' : 'border-gray-800'} transition-all duration-300`}>
             <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full bg-linear-to-br from-gray-700 to-gray-900 flex items-center justify-center border-4 border-[#1E232D]">
               {isListening && (
                 <div className="absolute inset-0 rounded-full border-2 border-pink-400 animate-ping opacity-20"></div>
               )}
               <User className={`h-12 w-12 ${isListening ? 'text-pink-400' : 'text-gray-500'}`} />
             </div>
             <h2 className="mt-6 text-xl font-medium tracking-wide">Candidate (You)</h2>
          </div>

        </div>

        {/* Subtitle / Caption Area */}
        <div className="w-full bg-[#161920] rounded-2xl border border-gray-800 p-6 flex items-center justify-center min-h-[100px]">
          {loading && currentCaption === 'Thinking...' ? (
            <div className="flex items-center gap-3 text-gray-400">
               <Loader2 className="h-5 w-5 animate-spin" /> Analyzing response...
            </div>
          ) : (
            <p className="text-xl md:text-2xl text-center font-medium leading-relaxed">
              {currentCaption}
            </p>
          )}
        </div>

        {/* Controls */}
        <div className="flex flex-wrap justify-center items-center gap-4 mt-6">
          <Button 
            variant="outline" 
            onClick={repeatLastMessage}
            className="h-12 px-6 rounded-full bg-[#1A1D24] border-gray-700 hover:bg-[#252A36] text-white"
          >
            <RefreshCcw className="mr-2 h-4 w-4" /> Repeat
          </Button>

          <Button 
            onClick={toggleMic}
            className={`h-14 w-14 rounded-full border-0 shadow-lg flex items-center justify-center ${
              isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-linear-to-r from-purple-500 to-indigo-500 hover:opacity-90'
            }`}
          >
            {isListening ? <MicOff className="h-6 w-6 text-white" /> : <Mic className="h-6 w-6 text-white" />}
          </Button>

          <Button 
            variant="destructive"
            onClick={handleFinalComplete}
            className="h-12 px-6 rounded-full bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20"
          >
            <LogOut className="mr-2 h-4 w-4" /> Leave interview
          </Button>
        </div>

      </div>
    </div>
  );
}
