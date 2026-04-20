'use client';

import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { ArrowRight, Trophy, Zap, Clock } from "lucide-react";
import { useUser } from '@/hooks/useUser';
import { useAuthStore } from '@/store/useAuthStore';

export default function Home() {
  const { isAuthenticated } = useAuthStore();
  useUser();

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)] bg-[#0F1115] text-white">
      <main className="flex-1">
        <section className="w-full py-16 md:py-32 flex flex-col items-center justify-center">
          <div className="container px-4 md:px-6 text-center space-y-6">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Master Your Next Technical <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Interview with AI</span>
            </h1>
            <p className="mx-auto max-w-[700px] text-gray-400 md:text-xl">
              Practice with real-time feedback, voice interaction, and personalized evaluations. Try our Ghost Login to start practicing in seconds.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
              {isAuthenticated ? (
                <>
                  <Link href="/setup">
                    <Button size="lg" className="w-full sm:w-auto h-12 px-8 font-medium bg-gradient-to-r from-purple-400 to-pink-500 text-black border-0 hover:opacity-90">
                      New Interview <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="/myinterviews">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 px-8 font-medium border-gray-700 bg-[#161920] hover:bg-[#1E232D] text-white">
                      Recent Interviews
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/setup">
                    <Button size="lg" className="w-full sm:w-auto h-12 px-8 font-medium bg-gradient-to-r from-purple-400 to-pink-500 text-black border-0 hover:opacity-90">
                      Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 px-8 font-medium border-gray-700 bg-[#161920] hover:bg-[#1E232D] text-white">
                      Sign In
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </section>

        <section className="w-full py-16 bg-[#0B0D10] border-t border-gray-800">
          <div className="container px-4 md:px-6">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-center space-y-4 text-center p-8 bg-[#161920] rounded-2xl border border-gray-800">
                <div className="p-4 bg-purple-500/10 rounded-full">
                  <Zap className="h-8 w-8 text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold text-white">Real-time STT/TTS</h3>
                <p className="text-sm text-gray-400">Natural conversation with our AI assistant through high-quality Speech-to-Text and Text-to-Speech.</p>
              </div>
              
              <div className="flex flex-col items-center space-y-4 text-center p-8 bg-[#161920] rounded-2xl border border-gray-800">
                <div className="p-4 bg-pink-500/10 rounded-full">
                  <Trophy className="h-8 w-8 text-pink-400" />
                </div>
                <h3 className="text-xl font-semibold text-white">Deep Evaluation</h3>
                <p className="text-sm text-gray-400">Receive detailed feedback on technical skills, soft skills, and areas of improvement after every session.</p>
              </div>
              
              <div className="flex flex-col items-center space-y-4 text-center p-8 bg-[#161920] rounded-2xl border border-gray-800">
                <div className="p-4 bg-indigo-500/10 rounded-full">
                  <Clock className="h-8 w-8 text-indigo-400" />
                </div>
                <h3 className="text-xl font-semibold text-white">Ghost Mode</h3>
                <p className="text-sm text-gray-400">Try up to 2 full interviews without registration. Perfect for quick practice sessions to test the waters.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="py-8 w-full shrink-0 flex justify-center px-4 md:px-6 border-t border-gray-800 bg-[#0B0D10]">
        <p className="text-sm text-gray-500">
          © 2026 AI Interviewer Inc. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
