import React from 'react';
import Link from 'next/link';
import { Calendar, Clock, User, ArrowRight, FileText, Star } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Interview } from '@/types/globalTypes';

const InterviewCard = ({ interview, isPast }: { interview: Interview; isPast: boolean }) => {
  console.log(interview);
  const techStack: string[] = interview.techStack.split(',');
  return (
    <Card className="group hover:-translate-y-1 transition-all duration-300 hover:shadow-xl border-[color:var(--border)]" style={{ background: 'var(--surface)' }}>
      <CardHeader className="pb-1">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={interview.type === 'past' ? 'border-indigo-500/20 text-indigo-400' : 'border-emerald-500/20 text-emerald-400'}>
              {interview.type}
            </Badge>
            {isPast && interview.score && (
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 text-[color:var(--amber)]" />
                <span className={`text-sm font-semibold ${interview.summary.finalAiScore >= 80 ? 'text-[color:var(--mint)]' : interview.summary.finalAiScore >= 60 ? 'text-[color:var(--amber)]' : 'text-[color:var(--coral)]'}`}>
                  {interview.summary.finalAiScore}%
                </span>
              </div>
            )}
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-[color:var(--text)]">
              {new Date(interview.startTime).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}

            </p>
            <div className="flex items-center gap-1 text-xs text-[color:var(--text-dim)] mt-1">
              <Clock className="h-3 w-3" />
              <span>{interview.durationMinutes}min</span>
            </div>
          </div>
        </div>
        <CardTitle className="text-lg group-hover:text-white transition-colors">{interview.jobTitle}</CardTitle>
      </CardHeader>

      <CardContent className="pt-1 flex flex-col gap-y-4">
        <div className="flex flex-wrap gap-x-2 gap-y-3">
          {techStack.map((t) => (
            <Badge
              key={t}
              className="text-sm px-3 py-2 rounded-full
            bg-white/10 backdrop-blur-md 
            text-indigo-300  hover:shadow-indigo-500/50
              transition-all duration-300 ease-out
              hover:scale-105 hover:text-white border border-indigo-500 shadow-[0_0_10px_2px_rgba(99,102,241,0.7)]"
            >
              {t}
            </Badge>
          ))}
        </div>

        {isPast && interview.summary && (
          <div className="p-3 rounded-lg bg-[color:var(--bg)]/50 border border-[color:var(--border)]">
            <p className="text-sm text-[color:var(--text-dim)] italic">"{interview.summary.overallSummary}"</p>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex items-center justify-between pt-4">
        <div className="flex items-center gap-3 text-xs text-[color:var(--text-dim)]">
          {isPast ? (
            <span className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              Report Available
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Scheduled
            </span>
          )}
        </div>
        <Button size="sm" asChild className="h-7 px-3 text-xs">
          <Link href={isPast ? `/interviews/${interview.id}/report` : `/interviews/${interview.id}`}
            style={{
              background: isPast ? 'var(--indigo)' : 'linear-gradient(135deg, var(--indigo), var(--coral))',
              color: '#0E1116'
            }}
          >
            {isPast ? 'View Report' : 'Join Interview'}
            <ArrowRight className="h-3 w-3 ml-1" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default InterviewCard;