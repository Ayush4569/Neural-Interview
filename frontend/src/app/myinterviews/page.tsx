'use client';

import { Button } from "@/components/ui/button";
import { Loader2, Calendar as CalendarIcon, ClipboardCheck, AlertCircle, Zap } from 'lucide-react';
import { format } from 'date-fns';
import { useInterviews } from '@/hooks/useInterviews';
import { useAuthStore } from '@/store/useAuthStore';
import Link from 'next/link';
import { Interview } from '@/types';

type DisplayStatus = 'scheduled' | 'live' | 'completed' | 'failed' | 'expired';

const resolveDisplayStatus = (interview: Interview): DisplayStatus => {
  const now = Date.now();
  const GRACE_MS = 30 * 60 * 1000; // 30-min window

  if (interview.status === 'scheduled') {
    const scheduledAt = new Date(interview.scheduledAt).getTime();
    if (now <= scheduledAt + GRACE_MS) return 'scheduled';
    return 'expired';
  }

  if (interview.status === 'live') {
    if (interview.startTime) {
      const endAt = new Date(interview.startTime).getTime() + interview.plannedDuration * 60 * 1000;
      if (now > endAt) return 'completed';
    }
    return 'scheduled';
  }

  return interview.status as DisplayStatus;
};

const STATUS_STYLES: Record<DisplayStatus, string> = {
  scheduled: 'bg-indigo-500/10 text-indigo-400',
  live:      'bg-blue-500/10 text-blue-400',
  completed: 'bg-green-500/10 text-green-400',
  failed:    'bg-red-500/10 text-red-400',
  expired:   'bg-zinc-500/10 text-zinc-400',
};

export default function MyInterviewsPage() {
  const { user } = useAuthStore();
  const { data: interviews, isLoading, isError } = useInterviews();

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
            <p className="text-gray-400 mb-6 max-w-md">
              You haven&apos;t completed any practice sessions. Start your first AI interview to receive detailed feedback.
            </p>
            <Link href="/setup">
              <Button className="bg-linear-to-r from-purple-400 to-pink-500 text-black border-0 hover:opacity-90 font-medium h-11 px-8 rounded-md">
                Schedule New Interview
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {interviews.map((interview: Interview) => {
              const displayStatus = resolveDisplayStatus(interview);
              const isJoinable = displayStatus === 'scheduled';
              const isCompleted = displayStatus === 'completed';

              return (
                <div
                  key={interview._id}
                  className="bg-[#161920] rounded-2xl border border-gray-800 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 hover:border-gray-700 transition-colors"
                >
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-xl font-medium truncate">{interview.jobTitle || 'General Interview'}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold shrink-0 ${STATUS_STYLES[displayStatus]}`}>
                        {displayStatus.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                      <CalendarIcon className="h-4 w-4 shrink-0" />
                      {format(new Date(interview.scheduledAt), 'MMM dd, yyyy - h:mm a')} &bull; {interview.plannedDuration || 5} min session
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {isCompleted && (
                      <Link href={`/evaluation/${interview._id}`}>
                        <Button
                          variant="outline"
                          className="bg-[#1A1D24] border-gray-700 hover:bg-[#252A36] text-white h-11 px-6 rounded-md"
                        >
                          <ClipboardCheck className="mr-2 h-4 w-4" /> See Results
                        </Button>
                      </Link>
                    )}

                    {isJoinable && (
                      <Link href={`/interview/${interview._id}/lobby`}>
                        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white border-0 h-11 px-8 rounded-md">
                          Start Now <Zap className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
