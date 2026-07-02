"use client";

import { Bot, Mic, RefreshCw } from "lucide-react";

export default function InterviewPanel() {
    
  return (
    <div className="flex h-screen flex-col bg-neutral-950 text-white">

      {/* Main Layout */}
      <main className="flex h-[75%] overflow-hidden">
        <section className="flex w-1/2 items-center justify-center border-r border-neutral-800 bg-neutral-950 p-6 md:p-8">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-neutral-900 shadow-2xl">
            <Bot className="h-12 w-12 text-neutral-500" />
          </div>
        </section>

        {/* User Side */}
        <section className="flex w-1/2 items-center justify-center bg-neutral-950 p-10">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-neutral-900 shadow-2xl">
            <span className="text-3xl font-bold text-neutral-500">
              U
            </span>
          </div>
        </section>

        {/* Caption Area */}
        <div className="absolute bottom-5 left-0 right-0 flex justify-center px-10">
          <div className="flex min-h-[96px] w-full max-w-4xl items-center justify-center rounded-3xl border border-neutral-800 bg-neutral-900 p-5 md:p-6 shadow-2xl">
            <p className="text-center text-xl text-neutral-400">
              Interview question and transcript will appear here.
            </p>
          </div>
        </div>
      </main>

      {/* Controls */}
      <footer className="flex items-center justify-center gap-8 border-t border-neutral-800 bg-neutral-950 px-10">
        <button className="group flex flex-col items-center justify-center rounded-xl p-4 hover:bg-neutral-900">
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-800">
            <RefreshCw className="h-5 w-5 text-neutral-400" />
          </div>
          <span className="text-xs text-neutral-500">
            Repeat
          </span>
        </button>

        <button className="group flex flex-col items-center justify-center rounded-xl p-4 hover:bg-neutral-900">
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-800">
            <Mic className="h-5 w-5 text-neutral-400" />
          </div>
          <span className="text-xs text-neutral-500">
            Repeat
          </span>
        </button>
      </footer>
    </div>
  );
}