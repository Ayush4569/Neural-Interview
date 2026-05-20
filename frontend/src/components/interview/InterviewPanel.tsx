"use client";

import { useParams } from 'next/navigation';
import { Mic, MicOff, RefreshCw, Loader2, Bot } from 'lucide-react';
import { useUser } from '@/hooks/useUser';
import { useInterviewSession } from '@/hooks/useInterviewSession';

export default function InterviewPanel() {
    const params = useParams();
    const id = params.id as string;
    const { data: user } = useUser();
    
    const {
        status,
        timeLeft,
        aiQuestion,
        transcript,
        finalTranscript,
        isRecording,
        toggleRecording,
        replayQuestion
    } = useInterviewSession(id);

    const userInitial = user?.username ? user.username.charAt(0).toUpperCase() : 'U';

    return (
        <div className="flex flex-col h-screen bg-neutral-950 text-white font-sans">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-neutral-800 bg-neutral-900/50">
                <h1 className="text-xl font-semibold tracking-tight text-neutral-200">Neural Interview</h1>
                <div className="flex items-center space-x-6">
                    {timeLeft && status !== "ending" && (
                        <div className="flex items-center bg-neutral-800/80 px-4 py-1.5 rounded-full border border-neutral-700">
                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse mr-2" />
                            <span className="font-mono text-sm text-neutral-300">{timeLeft}</span>
                        </div>
                    )}
                    <div className="flex items-center space-x-2">
                        <span className="flex h-3 w-3 relative">
                            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${status === 'listening' ? 'bg-green-400' : status === 'playing' ? 'bg-blue-400' : status === 'processing' ? 'bg-yellow-400' : 'bg-neutral-500'}`}></span>
                            <span className={`relative inline-flex rounded-full h-3 w-3 ${status === 'listening' ? 'bg-green-500' : status === 'playing' ? 'bg-blue-500' : status === 'processing' ? 'bg-yellow-500' : 'bg-neutral-500'}`}></span>
                        </span>
                        <span className="text-sm font-medium text-neutral-400 capitalize">{status}</span>
                    </div>
                </div>
            </div>

            {/* Split Layout */}
            <div className="flex-1 flex overflow-hidden relative">
                {/* AI Side (Left) */}
                <div className="w-1/2 p-10 flex flex-col items-center justify-center border-r border-neutral-800 relative bg-linear-to-br from-neutral-950 to-neutral-900">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-blue-900/10 via-neutral-950 to-neutral-950 z-0"></div>
                    <div className={`z-10 relative flex items-center justify-center w-40 h-40 rounded-full shadow-2xl transition-all duration-500 ${status === 'playing' ? 'shadow-blue-500/40 scale-110 ring-4 ring-blue-500/20' : 'bg-neutral-900'}`}>
                        <div className="absolute inset-0 bg-linear-to-tr from-blue-600/20 to-cyan-500/20 rounded-full"></div>
                        <Bot className={`w-20 h-20 ${status === 'playing' ? 'text-blue-400 animate-pulse' : 'text-neutral-500'}`} />
                    </div>
                </div>

                {/* User Side (Right) */}
                <div className="w-1/2 p-10 flex flex-col items-center justify-center relative bg-linear-to-bl from-neutral-950 to-neutral-900">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-green-900/10 via-neutral-950 to-neutral-950 z-0"></div>
                    <div className={`z-10 relative flex items-center justify-center w-40 h-40 rounded-full shadow-2xl transition-all duration-500 ${status === 'listening' ? 'shadow-green-500/40 scale-110 ring-4 ring-green-500/20 bg-neutral-800' : 'bg-neutral-900'}`}>
                        <span className={`text-5xl font-bold ${status === 'listening' ? 'text-green-400' : 'text-neutral-500'}`}>{userInitial}</span>
                    </div>
                </div>

                {/* Unified Captions Area */}
                <div className="absolute bottom-8 left-0 right-0 px-10 flex justify-center pointer-events-none z-30">
                    <div className="max-w-4xl w-full bg-neutral-900/80 backdrop-blur-md border border-neutral-800 p-6 md:p-8 rounded-3xl shadow-2xl text-center transition-all duration-300 pointer-events-auto min-h-[140px] flex items-center justify-center">
                        {status === 'playing' || status === 'processing' ? (
                            <p className={`text-xl md:text-2xl leading-relaxed font-medium ${status === 'processing' ? 'text-blue-200 animate-pulse' : 'text-blue-100'}`}>
                                {status === 'processing' ? "AI is thinking..." : (aiQuestion || "Processing...")}
                            </p>
                        ) : status === 'listening' ? (
                            (finalTranscript || transcript) ? (
                                <p className="text-xl md:text-2xl text-green-100 leading-relaxed font-medium">
                                    {finalTranscript} <span className="text-green-100/50">{transcript}</span>
                                </p>
                            ) : (
                                <p className="text-xl md:text-2xl text-blue-100/60 leading-relaxed font-medium">
                                    {aiQuestion}
                                </p>
                            )
                        ) : (
                            <p className="text-lg md:text-xl text-neutral-500 italic">
                                {status === "connecting" ? "Connecting to interview..." : "Ready. Click the microphone to start speaking."}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Controls */}
            {status !== "ending" && (
                <div className="h-32 bg-neutral-950 border-t border-neutral-800 flex items-center justify-center space-x-8 px-10 relative z-20">
                    <button
                        onClick={replayQuestion}
                        disabled={!aiQuestion || status === "listening" || status === "processing"}
                        className="flex flex-col items-center justify-center p-4 rounded-xl hover:bg-neutral-900 disabled:opacity-40 disabled:hover:bg-transparent transition-colors group"
                    >
                        <div className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center group-hover:bg-blue-600/20 group-hover:text-blue-400 transition-colors mb-2">
                            <RefreshCw className="w-5 h-5 text-neutral-400 group-hover:text-blue-400" />
                        </div>
                        <span className="text-xs font-medium text-neutral-500 group-hover:text-neutral-300">Repeat</span>
                    </button>

                    <button
                        onClick={toggleRecording}
                        disabled={status === "processing" || status === "connecting" || status === "playing"}
                        className={`relative flex items-center justify-center w-20 h-20 rounded-full shadow-lg transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:transform-none ${
                            isRecording 
                                ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20' 
                                : 'bg-white hover:bg-neutral-200 text-neutral-950 shadow-white/10'
                        }`}
                    >
                        {isRecording ? (
                            <MicOff className="w-8 h-8 text-white" />
                        ) : (
                            <Mic className={`w-8 h-8 ${(status === "processing" || status === "connecting" || status === "playing") ? 'text-neutral-500' : ''}`} />
                        )}
                    </button>
                    
                    <div className="w-20">
                        {/* Placeholder for symmetry */}
                    </div>
                </div>
            )}
        </div>
    );
}