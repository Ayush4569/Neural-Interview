'use client';

import { useState } from 'react';
import api from '@/lib/api';
import { Button } from "@/components/ui/button";
import { Loader2, ExternalLink, Calendar as CalendarIcon, ClipboardCheck, AlertCircle, Zap, ArrowLeft, RotateCcw } from 'lucide-react';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useInterviews } from '@/hooks/useInterviews';
import { useAuthStore } from '@/store/useAuthStore';
import Link from 'next/link';

export default function MyInterviewsPage() {
  const { user } = useAuthStore();
  const { data: interviews, isLoading, isError } = useInterviews();
  
  const [selectedEvaluation, setSelectedEvaluation] = useState<any>(null);
  const [evalLoading, setEvalLoading] = useState(false);

  const fetchEvaluation = async (id: string) => {
    setEvalLoading(true);
    setSelectedEvaluation(null);
    try {
      const res = await api.get(`/interviews/session/${id}/report`);
      setSelectedEvaluation(res.data.evaluation);
    } catch (error) {
      // Handled globally
    } finally {
      setEvalLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] bg-[#0F1115]">
        <Loader2 className="h-10 w-10 animate-spin text-purple-500" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] bg-[#0F1115] text-white">
        <p>Failed to load interviews. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#0F1115] text-white py-12 px-4 md:px-8">
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        
        <div className="flex justify-between items-center bg-[#161920] p-6 rounded-2xl border border-gray-800">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Your Interviews</h1>
            <p className="text-gray-400 mt-1">Review past performance and feedback</p>
          </div>
          {user?.isGhost && (
            <span className="px-4 py-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full text-sm font-medium">
              Ghost Mode
            </span>
          )}
        </div>

        {!interviews || interviews.length === 0 ? (
          <div className="bg-[#161920] rounded-2xl border border-gray-800 p-12 text-center flex flex-col items-center justify-center">
            <AlertCircle className="h-12 w-12 text-gray-500 mb-4" />
            <h3 className="text-xl font-medium mb-2">No Interviews Yet</h3>
            <p className="text-gray-400 mb-6 max-w-md">You haven't completed any practice sessions. Start your first AI interview to receive detailed feedback.</p>
            <Link href="/setup">
              <Button className="bg-gradient-to-r from-purple-400 to-pink-500 text-black border-0 hover:opacity-90 font-medium h-11 px-8 rounded-md">
                Schedule New Interview
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {interviews.map((interview: any) => (
              <div key={interview._id} className="bg-[#161920] rounded-2xl border border-gray-800 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 hover:border-gray-700 transition-colors">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-medium">{interview.jobTitle || 'General Interview'}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      interview.status === 'completed' ? 'bg-green-500/10 text-green-400' :
                      interview.status === 'pending' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-red-500/10 text-red-400'
                    }`}>
                      {interview.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                    <CalendarIcon className="h-4 w-4" />
                    {format(new Date(interview.scheduledAt), 'MMM dd, yyyy - h:mm a')} • {interview.duration || 5} min session
                  </div>
                </div>

                {interview.status === 'completed' && (
                  <Dialog>
                    <DialogTrigger >
                      <Button 
                        onClick={() => fetchEvaluation(interview._id)}
                        variant="outline" 
                        className="bg-[#1A1D24] border-gray-700 hover:bg-[#252A36] text-white h-11 px-6 rounded-md"
                      >
                        <ClipboardCheck className="mr-2 h-4 w-4" /> Feedback
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl bg-[#0F1115] border-gray-800 text-white p-0 overflow-hidden rounded-2xl shadow-2xl">
                      {evalLoading ? (
                        <div className="p-20 flex flex-col items-center justify-center gap-4">
                          <Loader2 className="h-10 w-10 animate-spin text-purple-500" />
                          <p className="text-gray-400">Loading your evaluation...</p>
                        </div>
                      ) : selectedEvaluation ? (
                        <div className="flex flex-col h-[80vh] max-h-[800px] overflow-y-auto custom-scrollbar p-6 md:p-10">
                          
                          <div className="mb-8">
                            <h2 className="text-3xl font-semibold mb-2">Feedback on your Interview</h2>
                            <p className="text-gray-400 capitalize">{interview.jobTitle} Candidate</p>
                          </div>

                          {/* Overall Dashboard Hero */}
                          <div className="flex flex-col md:flex-row items-center gap-8 mb-10 p-8 bg-[#161920] rounded-3xl border border-gray-800">
                            {/* Score Ring */}
                            <div className="relative flex items-center justify-center flex-shrink-0">
                               <svg className="w-32 h-32 transform -rotate-90">
                                 <circle cx="64" cy="64" r="56" className="stroke-gray-800" strokeWidth="12" fill="none" />
                                 <circle 
                                   cx="64" cy="64" r="56" 
                                   className="stroke-purple-500 outline-none" 
                                   strokeWidth="12" fill="none" 
                                   strokeDasharray="351.858" 
                                   strokeDashoffset={351.858 - (351.858 * (selectedEvaluation.score || 0)) / 100} 
                                   strokeLinecap="round" 
                                 />
                               </svg>
                               <div className="absolute flex flex-col items-center justify-center">
                                 <span className="text-3xl font-bold">{selectedEvaluation.score}</span>
                                 <span className="text-xs text-gray-500 font-semibold">/ 100</span>
                               </div>
                            </div>
                            <div className="flex-1 space-y-2 text-center md:text-left">
                              <h3 className="text-2xl font-semibold">Overall Impression</h3>
                              <p className="text-gray-400 leading-relaxed">
                                {selectedEvaluation.feedback}
                              </p>
                            </div>
                          </div>

                          {/* Breakdown Grids */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                             <div className="bg-green-500/5 border border-green-500/20 rounded-2xl p-6">
                                <h4 className="text-lg font-semibold text-green-400 mb-4 flex items-center gap-2">
                                  <Zap className="h-5 w-5" /> Key Strengths
                                </h4>
                                <ul className="space-y-3">
                                  {selectedEvaluation.strengths?.map((item: string, i: number) => (
                                    <li key={i} className="text-gray-300 text-sm flex gap-3"><span className="text-green-500 mt-0.5">•</span> {item}</li>
                                  ))}
                                </ul>
                             </div>
                             
                             <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6">
                                <h4 className="text-lg font-semibold text-red-400 mb-4 flex items-center gap-2">
                                  <AlertCircle className="h-5 w-5" /> Core Weaknesses
                                </h4>
                                <ul className="space-y-3">
                                  {selectedEvaluation.weaknesses?.map((item: string, i: number) => (
                                    <li key={i} className="text-gray-300 text-sm flex gap-3"><span className="text-red-500 mt-0.5">•</span> {item}</li>
                                  ))}
                                </ul>
                             </div>
                          </div>

                          {/* Final Verdict / Improvements */}
                          <div className="bg-[#161920] border border-gray-800 rounded-2xl p-6 mb-10">
                            <h4 className="text-lg font-semibold mb-4 border-b border-gray-800 pb-2">Final Verdict & Next Steps</h4>
                            <ul className="space-y-3">
                              {selectedEvaluation.improvements?.map((item: string, i: number) => (
                                <li key={i} className="text-gray-400 text-sm flex gap-3"><span className="text-purple-500 mt-0.5">→</span> {item}</li>
                              ))}
                            </ul>
                          </div>

                          {/* Bottom Actions */}
                          <div className="flex flex-col sm:flex-row gap-4 mt-auto border-t border-gray-800 pt-6">
                            <Link href="/myinterviews" className="flex-1">
                              <DialogTrigger >
                                <Button variant="outline" className="w-full h-12 bg-[#1A1D24] border-gray-700 hover:bg-[#252A36] text-white">
                                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to dashboard
                                </Button>
                              </DialogTrigger>
                            </Link>

                            <Link href="/setup" className="flex-1">
                              <Button className="w-full h-12 bg-gradient-to-r from-purple-400 to-pink-500 text-black border-0 hover:opacity-90 font-medium">
                                <RotateCcw className="mr-2 h-4 w-4" /> Retake interview
                              </Button>
                            </Link>
                          </div>

                        </div>
                      ) : (
                        <div className="p-20 text-center text-gray-500">No evaluation found.</div>
                      )}
                    </DialogContent>
                  </Dialog>
                )}
                
                {interview.status === 'pending' && (
                  <Link href={`/interview/${interview._id}`}>
                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white border-0 h-11 px-8 rounded-md">
                      Start Now <Zap className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
