'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, Zap, ArrowLeft, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { useGetEvaluation } from '@/hooks/useGetEvaluation';

export default function EvaluationPage() {
  const params = useParams();
  const id = params.id as string;
  
  const { data: evaluation, isPending, error } = useGetEvaluation(id);

  if (isPending) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] bg-[#0F1115]">
        <Loader2 className="h-10 w-10 animate-spin text-purple-500 mb-4" />
        <p className="text-gray-400">Loading your comprehensive evaluation...</p>
      </div>
    );
  }

  if (error || !evaluation) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] bg-[#0F1115] text-white p-6 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Evaluation Not Found</h2>
        <p className="text-gray-400 mb-6 max-w-md">We couldn't retrieve the feedback for this session. It may still be processing or the session is invalid.</p>
        <Link href="/myinterviews">
          <Button variant="outline" className="bg-[#161920] border-gray-800 text-white hover:bg-[#1A1D24]">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#0F1115] text-white py-12 px-4 md:px-8">
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        
        {/* Header Action */}
        <div className="flex items-center gap-4 mb-2">
          <Link href="/myinterviews">
             <Button variant="ghost" className="text-gray-400 hover:text-white p-0 h-auto hover:bg-transparent">
               <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
             </Button>
          </Link>
        </div>

        <div className="bg-[#161920] rounded-3xl border border-gray-800 p-8 md:p-12 shadow-2xl">
          
          <div className="mb-10">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">Interview Evaluation</h1>
            <p className="text-gray-400">Detailed breakdown of your session performance</p>
          </div>

          {/* Overall Dashboard Hero */}
          <div className="flex flex-col md:flex-row items-center gap-8 mb-12 p-8 bg-[#0F1115] rounded-3xl border border-gray-800">
            {/* Score Ring */}
            <div className="relative flex items-center justify-center shrink-0">
               <svg className="w-40 h-40 transform -rotate-90">
                 <circle cx="80" cy="80" r="72" className="stroke-gray-800" strokeWidth="14" fill="none" />
                 <circle 
                   cx="80" cy="80" r="72" 
                   className="stroke-purple-500 outline-none transition-all duration-1000 ease-out" 
                   strokeWidth="14" fill="none" 
                   strokeDasharray="452.389" 
                   strokeDashoffset={452.389 - (452.389 * (evaluation.score || 0)) / 100} 
                   strokeLinecap="round" 
                 />
               </svg>
               <div className="absolute flex flex-col items-center justify-center">
                 <span className="text-4xl font-bold">{evaluation.score}</span>
                 <span className="text-sm text-gray-500 font-semibold">/ 100</span>
               </div>
            </div>
            <div className="flex-1 space-y-4 text-center md:text-left">
              <h3 className="text-2xl font-semibold">Overall Impression</h3>
              <p className="text-gray-300 leading-relaxed text-lg">
                {evaluation.feedback}
              </p>
            </div>
          </div>

          {/* Breakdown Grids */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
             <div className="bg-green-500/5 border border-green-500/20 rounded-2xl p-8">
                <h4 className="text-xl font-semibold text-green-400 mb-6 flex items-center gap-2">
                  <Zap className="h-6 w-6" /> Key Strengths
                </h4>
                <ul className="space-y-4">
                  {evaluation.strengths?.map((item: string, i: number) => (
                    <li key={i} className="text-gray-300 text-base flex gap-3 items-start"><span className="text-green-500 mt-1">•</span> <span className="flex-1">{item}</span></li>
                  ))}
                </ul>
             </div>
             
             <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-8">
                <h4 className="text-xl font-semibold text-red-400 mb-6 flex items-center gap-2">
                  <AlertCircle className="h-6 w-6" /> Core Weaknesses
                </h4>
                <ul className="space-y-4">
                  {evaluation.weaknesses?.map((item: string, i: number) => (
                    <li key={i} className="text-gray-300 text-base flex gap-3 items-start"><span className="text-red-500 mt-1">•</span> <span className="flex-1">{item}</span></li>
                  ))}
                </ul>
             </div>
          </div>

          {/* Final Verdict / Improvements */}
          <div className="bg-[#0F1115] border border-gray-800 rounded-2xl p-8 mb-10">
            <h4 className="text-xl font-semibold mb-6 border-b border-gray-800 pb-4">Final Verdict & Next Steps</h4>
            <ul className="space-y-4">
              {evaluation.improvements?.map((item: string, i: number) => (
                <li key={i} className="text-gray-300 text-base flex gap-3 items-start"><span className="text-purple-500 mt-1">→</span> <span className="flex-1">{item}</span></li>
              ))}
            </ul>
          </div>

          {/* Bottom Actions */}
          <div className="flex flex-col sm:flex-row gap-4 mt-auto border-t border-gray-800 pt-8">
            <Link href="/setup" className="flex-1">
              <Button className="w-full h-14 text-lg bg-linear-to-r from-purple-400 to-pink-500 text-black border-0 hover:opacity-90 font-medium rounded-xl">
                <RotateCcw className="mr-2 h-5 w-5" /> Retake Practice Interview
              </Button>
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
