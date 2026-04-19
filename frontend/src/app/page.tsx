'use client';

import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { ArrowRight, Trophy, Zap, Clock, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import api from '@/lib/api';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setIsAuthenticated(!!localStorage.getItem('userId'));
  }, []);



  return (
    <div className="flex flex-col min-h-screen">
      
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 premium-gradient opacity-10 blur-3xl -z-10"></div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="container px-4 md:px-6 text-center"
          >
            <div className="space-y-4">
              <h1 className="text-4xl font-extrabold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl leading-tight">
                Master Your Next Technical <br />
                <span className="text-transparent bg-clip-text premium-gradient">Interview with AI</span>
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl leading-relaxed">
                Practice with real-time feedback, voice interaction, and personalized evaluations. Try our "Ghost Login" to start practicing in seconds.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-6 mt-8">
                {isAuthenticated ? (
                  <>
                    <Link href="/setup">
                      <Button size="lg" className="px-8 font-semibold w-full sm:w-auto h-12 text-lg shadow-lg hover:scale-105 transition-transform duration-200">
                        New Interview <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </Link>
                    <Link href="/myinterviews">
                      <Button size="lg" variant="outline" className="px-8 font-semibold w-full sm:w-auto h-12 text-lg hover:scale-105 transition-transform duration-200 glassmorphism">
                        Recent Interviews
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/setup">
                      <Button size="lg" className="px-8 font-semibold w-full sm:w-auto h-12 text-lg shadow-lg hover:scale-105 transition-transform duration-200">
                        Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </Link>
                    <Link href="/login">
                      <Button size="lg" variant="outline" className="px-8 font-semibold w-full sm:w-auto h-12 text-lg hover:scale-105 transition-transform duration-200 glassmorphism">
                        Sign In
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-black/20 border-t border-white/5">
          <div className="container px-4 md:px-6">
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="flex flex-col items-center space-y-4 text-center glassmorphism p-8 rounded-3xl hover:border-primary/50 transition-colors"
              >
                <div className="p-4 bg-primary/10 rounded-full">
                  <Zap className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-2xl font-bold">Real-time STT/TTS</h3>
                <p className="text-muted-foreground leading-relaxed">Natural conversation with our AI assistant through high-quality Speech-to-Text and Text-to-Speech.</p>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="flex flex-col items-center space-y-4 text-center glassmorphism p-8 rounded-3xl hover:border-primary/50 transition-colors"
              >
                <div className="p-4 bg-primary/10 rounded-full">
                  <Trophy className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-2xl font-bold">Deep Evaluation</h3>
                <p className="text-muted-foreground leading-relaxed">Receive detailed feedback on technical skills, soft skills, and areas of improvement after every registered session.</p>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="flex flex-col items-center space-y-4 text-center glassmorphism p-8 rounded-3xl hover:border-primary/50 transition-colors"
              >
                <div className="p-4 bg-primary/10 rounded-full">
                  <Clock className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-2xl font-bold">Ghost Mode</h3>
                <p className="text-muted-foreground leading-relaxed">Try up to 2 full interviews without registration. Perfect for quick practice sessions to test the waters.</p>
              </motion.div>
            </div>
          </div>
        </section>
      </main>
      <footer className="py-8 w-full shrink-0 items-center px-4 md:px-6 border-t border-white/10 bg-background/80 backdrop-blur-sm z-10">
        <p className="text-sm text-center text-muted-foreground font-medium">
          © 2026 AI Interviewer Inc. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
