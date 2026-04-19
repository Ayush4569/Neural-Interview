'use client';

import { useState, useEffect, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Send, Loader2, Volume2, VolumeX, LogOut } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { motion, AnimatePresence } from 'framer-motion';

export default function InterviewRoom({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentCaption, setCurrentCaption] = useState('');
  const [isAborted, setIsAborted] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isEndingSent, setIsEndingSent] = useState(false);
  const [showEndDialog, setShowEndDialog] = useState(false);

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const transcriptRef = useRef<string>('');
  const isEndingSentRef = useRef(false);

  const TERMINATION_KEYWORDS = [
    "conclude", "terminate", "wrap up", "that's all", "stop the interview", 
    "finish", "goodbye", "i am done", "conclude the session", "bye", "end this"
  ];

  const checkTermination = (text: string) => {
    return TERMINATION_KEYWORDS.some(keyword => text.toLowerCase().includes(keyword.toLowerCase()));
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;

        recognitionRef.current.onresult = (event: any) => {
          let interimTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              transcriptRef.current += event.results[i][0].transcript;
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }

          const currentFullText = transcriptRef.current + interimTranscript;
          setCurrentCaption(currentFullText);

          // Check for termination keywords immediately
          if (checkTermination(currentFullText)) {
            if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
            handleSend(currentFullText);
            recognitionRef.current?.stop();
            return;
          }

          // Reset silence timer
          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = setTimeout(() => {
            if (transcriptRef.current || interimTranscript) {
              const textToSend = transcriptRef.current + interimTranscript;
              handleSend(textToSend);
              transcriptRef.current = '';
              recognitionRef.current?.stop();
            }
          }, 4000); // 4 second pause delay
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error);
          setIsListening(false);
        };
        recognitionRef.current.onend = () => setIsListening(false);
      }
      synthRef.current = window.speechSynthesis;
    }

    startInteraction();

    const cleanup = () => {
      if (synthRef.current) synthRef.current.cancel();
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    };

    return cleanup;
  }, [id]);

  const startInteraction = async () => {
    try {
      const res = await api.post(`/interviews/session/${id}/begin`);
      
      if (res.data.status === 'completed') {
        router.push('/myinterviews');
        return;
      }
      
      const durationMins = res.data.duration || 5;
      setTimeLeft(durationMins * 60);

      const aiMsg = res.data.aiMessage;
      setMessages([{ role: 'ai', content: aiMsg }]);
      speak(aiMsg);
    } catch (error) {
      // Handled by global interceptor
      router.push('/myinterviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (timeLeft === null) return;
    
    if (timeLeft === 12 && !isEndingSentRef.current) {
      forceConclusion();
    }

    if (timeLeft <= 0) {
      handleFinalComplete();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev !== null ? prev - 1 : null);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const forceConclusion = () => {
    isEndingSentRef.current = true;
    setIsEndingSent(true);

    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      recognitionRef.current.stop();
      setIsListening(false);
    }
    if (synthRef.current) synthRef.current.cancel();

    const conclusionText = "Alright it was great but since we don't have much time left its time to conclude, good luck for your future, you will get the evaluation of the interview up till now.";
    
    setMessages(prev => [...prev, { role: 'ai', content: conclusionText }]);
    setCurrentCaption('');
    
    const utterance = new SpeechSynthesisUtterance(conclusionText);
    utterance.onstart = () => {
      setIsSpeaking(true);
      setCurrentCaption(conclusionText);
    };
    utterance.onend = () => {
      setIsSpeaking(false);
      setCurrentCaption('');
    };
    if (synthRef.current) synthRef.current.speak(utterance);
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
      setCurrentCaption('');
    };
    synthRef.current.speak(utterance);
  };

  const handleSend = async (text: string = userInput) => {
    if (!text.trim()) return;
    
    // Check for termination
    const shouldTerminate = checkTermination(text);
    
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setUserInput('');
    transcriptRef.current = '';
    setLoading(true);

    try {
      const isEndingFlag = shouldTerminate;
      if (isEndingFlag && !isEndingSentRef.current) {
        isEndingSentRef.current = true;
        setIsEndingSent(true);
      }

      const res = await api.post(`/interviews/session/${id}/interact`, { answer: text, isEnding: isEndingFlag });
      
      // If forced 12s interruption happened while waiting for this API call, ignore this backend response.
      if (isEndingSentRef.current && !isEndingFlag) {
        setLoading(false);
        return;
      }

      const aiMsg = res.data.aiMessage;
      setMessages(prev => [...prev, { role: 'ai', content: aiMsg }]);
      setCurrentCaption(''); // Clear caption
      speak(aiMsg);

      if (isEndingFlag) {
        setTimeout(() => {
          handleFinalComplete();
        }, 8000); // Allow AI to speak its last message before disconnecting
      }
    } catch (error) {
       // Handled
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const attemptEarlyEnd = () => {
    setShowEndDialog(true);
  };

  const confirmEnd = async () => {
    setShowEndDialog(false);
    handleFinalComplete();
  };

  if (loading && messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground">Entering the interview room...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full py-8 px-4 relative">
      {/* Header Section */}
      <header className="flex justify-between items-center mb-10 pb-6 border-b border-white/10">
        <div className="flex flex-col">
          <h2 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            Live Interview
          </h2>
          <p className="text-muted-foreground text-sm mt-1">Session ID: {id.slice(-8).toUpperCase()}</p>
        </div>
        
        <div className="flex items-center gap-6">
          {timeLeft !== null && (
            <div className={`flex flex-col items-end`}>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">Time Remaining</span>
              <div className={`font-mono text-3xl font-black ${timeLeft <= 60 ? 'text-destructive' : 'text-primary'}`}>
                {formatTime(timeLeft)}
              </div>
            </div>
          )}
          <Button variant="outline" className="border-destructive/20 text-destructive hover:bg-destructive/10 h-12 px-6 font-bold" onClick={attemptEarlyEnd}>
            <LogOut className="mr-2 h-4 w-4" /> End Session
          </Button>
        </div>
      </header>

      <div className="flex-1 space-y-8 mb-32 overflow-y-auto pr-4 custom-scrollbar scroll-smooth">
        <AnimatePresence mode="popLayout">
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className={`flex flex-col ${m.role === 'ai' ? 'items-start' : 'items-end'}`}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2 px-1">
                {m.role === 'ai' ? 'AI Interviewer' : 'You'}
              </span>
              <div className={`max-w-[85%] p-5 rounded-3xl shadow-lg text-lg leading-relaxed ${
                m.role === 'ai' 
                  ? 'glassmorphism rounded-tl-none border-primary/20 bg-primary/5' 
                  : 'premium-gradient text-white rounded-tr-none shadow-primary/20'
              }`}>
                {m.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {loading && (
          <div className="flex flex-col items-start ml-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">AI Interviewer</span>
            <div className="glassmorphism p-5 rounded-3xl rounded-tl-none flex items-center gap-3">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-sm font-bold uppercase tracking-widest text-primary/70">Interviewer is thinking</span>
            </div>
          </div>
        )}
      </div>

      {/* Live Caption Overlay */}
      <AnimatePresence>
        {currentCaption && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-32 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 z-40"
          >
            <div className="bg-black/80 backdrop-blur-xl border border-white/10 p-4 rounded-xl text-center shadow-2xl">
              <p className="text-lg font-medium text-white leading-relaxed">
                {currentCaption}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Control Bar */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4">
        <div className="glassmorphism p-4 rounded-full flex items-center gap-4 shadow-2xl scale-110 sm:scale-100">
          <Button 
            size="icon" 
            variant={isListening ? "destructive" : "secondary"} 
            className="rounded-full h-12 w-12 shrink-0"
            onClick={toggleMic}
          >
            {isListening ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
          </Button>

          <input 
            className="bg-transparent border-none focus:ring-0 flex-1 px-4 text-sm outline-none" 
            placeholder={isListening ? "Listening..." : "Type your answer or use mic..."}
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={loading}
          />

          <Button 
            size="icon" 
            className="rounded-full h-12 w-12 shrink-0 premium-gradient"
            onClick={() => handleSend()}
            disabled={loading || !userInput.trim()}
          >
            <Send className="h-5 w-5 text-white" />
          </Button>
        </div>
        
        {/* Voice Visualizer Mock */}
        {isSpeaking && (
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 flex items-center gap-1">
            {[1,2,3,4,5].map(i => (
              <motion.div
                key={i}
                animate={{ height: [10, 30, 10] }}
                transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                className="w-1 bg-primary rounded-full"
              />
            ))}
            <Volume2 className="h-4 w-4 text-primary ml-2" />
          </div>
        )}
      </div>

      {/* End Session Dialog */}
      <Dialog open={showEndDialog} onOpenChange={setShowEndDialog}>
        <DialogContent className="glassmorphism border-destructive/20">
          <DialogHeader>
            <DialogTitle>End Interview Early?</DialogTitle>
            <DialogDescription>
              Are you sure you want to end the session? You haven't completed the designated time limit. Your evaluation will be based on your performance so far.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setShowEndDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmEnd}>End Now</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
