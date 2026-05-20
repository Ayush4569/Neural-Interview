'use client';

import { useParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, ArrowLeft, RotateCcw, Zap, Target, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { useGetEvaluation } from '@/hooks/useGetEvaluation';

export default function EvaluationPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data, isPending, error } = useGetEvaluation(id);
  const evaluation = data?.evaluation;
  const interview = data?.interview;

  if (isPending) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0A0A0F]">
        <Loader2 className="h-12 w-12 animate-spin text-purple-500 mb-4" />
        <p className="text-gray-400 text-lg">Generating your evaluation...</p>
        <p className="text-gray-600 text-sm mt-2">This may take a few seconds</p>
      </div>
    );
  }

  if (error || !evaluation) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0A0A0F] text-white p-6 text-center">
        <AlertCircle className="h-14 w-14 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Evaluation Not Available</h2>
        <p className="text-gray-400 mb-8 max-w-md">
          We couldn't load the feedback for this session. It may still be processing or the interview is not yet completed.
        </p>
        <Link href="/myinterviews">
          <Button variant="outline" className="border-gray-700 text-white hover:bg-gray-800">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  const score = evaluation.score ?? 0;
  const scoreColor =
    score >= 75 ? 'text-green-400' :
    score >= 50 ? 'text-yellow-400' :
    'text-red-400';

  const circumference = 2 * Math.PI * 54;
  const dashOffset = circumference - (circumference * score) / 100;

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">
      {/* Top navigation */}
      <div className="max-w-4xl mx-auto px-4 pt-8 pb-2">
        <button
          onClick={() => router.push('/myinterviews')}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-4 pb-20">

        {/* ───── HEADER ───── */}
        <div className="text-center py-10 border-b border-gray-800">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            Feedback on the Interview —{' '}
            <span className="text-purple-400">{interview?.jobTitle || 'Interview'}</span>
          </h1>
          <div className="flex items-center justify-center gap-6 text-gray-400 text-sm mt-2 flex-wrap">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-purple-400" />
              <span>
                Overall Impression:{' '}
                <span className={`font-bold text-base ${scoreColor}`}>{score}</span>
                <span className="text-gray-500">/100</span>
              </span>
            </div>
            {interview?.scheduledAt && (
              <div className="flex items-center gap-2">
                <span>📅</span>
                <span>{format(new Date(interview.scheduledAt), 'MMM dd, yyyy - h:mm a')}</span>
              </div>
            )}
          </div>
        </div>

        {/* ───── SCORE + SUMMARY ───── */}
        <div className="flex flex-col md:flex-row items-center gap-10 py-10 border-b border-gray-800">
          {/* SVG ring */}
          <div className="relative shrink-0">
            <svg width="140" height="140" className="-rotate-90">
              <circle cx="70" cy="70" r="54" fill="none" stroke="#1f2937" strokeWidth="12" />
              <circle
                cx="70" cy="70" r="54"
                fill="none"
                stroke={score >= 75 ? '#22c55e' : score >= 50 ? '#eab308' : '#ef4444'}
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                style={{ transition: 'stroke-dashoffset 1s ease' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-3xl font-bold ${scoreColor}`}>{score}</span>
              <span className="text-xs text-gray-500 font-semibold">/ 100</span>
            </div>
          </div>

          <p className="text-gray-300 text-lg leading-relaxed text-center md:text-left">
            {evaluation.feedback}
          </p>
        </div>

        {/* ───── BREAKDOWN ───── */}
        <div className="py-10 border-b border-gray-800">
          <h2 className="text-2xl font-bold mb-8">Breakdown of Evaluation:</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Strengths */}
            <div className="bg-[#0F1115] border border-gray-800 rounded-2xl p-6">
              <h3 className="font-bold text-green-400 text-lg mb-4 flex items-center gap-2">
                <Zap className="h-5 w-5" /> Strengths
              </h3>
              <ul className="space-y-3">
                {evaluation.strengths?.map((item: string, i: number) => (
                  <li key={i} className="flex gap-3 items-start text-gray-300">
                    <span className="text-green-500 mt-0.5 shrink-0">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Weaknesses */}
            <div className="bg-[#0F1115] border border-gray-800 rounded-2xl p-6">
              <h3 className="font-bold text-red-400 text-lg mb-4 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" /> Areas to Improve
              </h3>
              <ul className="space-y-3">
                {evaluation.weaknesses?.map((item: string, i: number) => (
                  <li key={i} className="flex gap-3 items-start text-gray-300">
                    <span className="text-red-500 mt-0.5 shrink-0">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* ───── FINAL VERDICT ───── */}
        <div className="py-10 border-b border-gray-800">
          <div className="flex items-center gap-4 mb-6 flex-wrap">
            <h2 className="text-2xl font-bold">Final Verdict:</h2>
            <span className={`px-4 py-1.5 rounded-full text-sm font-semibold border ${
              score >= 75
                ? 'bg-green-500/10 border-green-500/40 text-green-400'
                : score >= 50
                ? 'bg-yellow-500/10 border-yellow-500/40 text-yellow-400'
                : 'bg-red-500/10 border-red-500/40 text-red-400'
            }`}>
              {score >= 75 ? 'Recommended' : score >= 50 ? 'Needs Improvement' : 'Not Recommended'}
            </span>
          </div>

          <div className="bg-[#0F1115] border border-gray-800 rounded-2xl p-6">
            <h3 className="font-bold text-purple-400 text-lg mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" /> Next Steps & Improvements
            </h3>
            <ul className="space-y-3">
              {evaluation.improvements?.map((item: string, i: number) => (
                <li key={i} className="flex gap-3 items-start text-gray-300">
                  <span className="text-purple-500 mt-0.5 shrink-0">→</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ───── ACTIONS ───── */}
        <div className="flex flex-col sm:flex-row gap-4 pt-10">
          <Link href="/myinterviews" className="flex-1">
            <Button
              variant="outline"
              className="w-full h-14 text-base border-gray-700 text-white hover:bg-gray-800 rounded-2xl"
            >
              <ArrowLeft className="mr-2 h-5 w-5" /> Back to dashboard
            </Button>
          </Link>
          <Link href="/setup" className="flex-1">
            <Button
              className="w-full h-14 text-base bg-white text-black hover:bg-gray-100 font-semibold rounded-2xl"
            >
              <RotateCcw className="mr-2 h-5 w-5" /> Retake interview
            </Button>
          </Link>
        </div>

      </div>
    </div>
  );
}
