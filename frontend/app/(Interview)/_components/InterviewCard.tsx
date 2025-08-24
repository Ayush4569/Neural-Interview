
import React from 'react';
import Link from 'next/link';
import { Calendar, Clock, User, ArrowRight, FileText, Star } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const InterviewCard = ({ interview, isPast }: { interview: any; isPast: boolean }) => (
    <Card className="group hover:-translate-y-1 transition-all duration-300 hover:shadow-xl border-[color:var(--border)]" style={{ background: 'var(--surface)' }}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={interview.type === 'Technical' ? 'border-indigo-500/20 text-indigo-400' : 'border-emerald-500/20 text-emerald-400'}>
              {interview.type}
            </Badge>
            {isPast && interview.score && (
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 text-[color:var(--amber)]" />
                <span className={`text-sm font-semibold ${interview.score >= 80 ? 'text-[color:var(--mint)]' : interview.score >= 60 ? 'text-[color:var(--amber)]' : 'text-[color:var(--coral)]'}`}>
                  {interview.score}%
                </span>
              </div>
            )}
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-[color:var(--text)]">
              {new Date(interview.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </p>
            <div className="flex items-center gap-1 text-xs text-[color:var(--text-dim)] mt-1">
              <Clock className="h-3 w-3" />
              <span>{interview.time} • {interview.duration}min</span>
            </div>
          </div>
        </div>
        <CardTitle className="text-lg group-hover:text-white transition-colors">{interview.title}</CardTitle>
        <CardDescription>{interview.company}</CardDescription>
      </CardHeader>
  
      {isPast && interview.feedback && (
        <CardContent className="py-3">
          <div className="p-3 rounded-lg bg-[color:var(--bg)]/50 border border-[color:var(--border)]">
            <p className="text-sm text-[color:var(--text-dim)] italic">"{interview.feedback}"</p>
          </div>
        </CardContent>
      )}
  
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
        <Button asChild className="px-3 hover:scale-110 transition-transform ease-in-out text-gray-300">
          <Link href={isPast ? `/interviews/${interview.id}/report` : `/interviews/${interview.id}`}
            style={{ 
              background: isPast ? 'var(--indigo)' : 'linear-gradient(135deg, var(--indigo), var(--coral))'
            }}
          >
            {isPast ? 'View Report' : 'Join Interview'}
            <ArrowRight className="h-3 w-3 ml-1" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );

export default InterviewCard;