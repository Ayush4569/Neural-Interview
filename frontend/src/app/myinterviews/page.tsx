'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, ExternalLink, Calendar as CalendarIcon, ClipboardCheck, AlertCircle, Zap } from 'lucide-react';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function MyInterviewsPage() {
  const [interviews, setInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvaluation, setSelectedEvaluation] = useState<any>(null);
  const [evalLoading, setEvalLoading] = useState(false);

  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      setLoading(false);
      return;
    }
    try {
      const res = await api.get('/interviews/history');
      setInterviews(res.data.interviews);
    } catch (error) {
      // Handled by global interceptor
    } finally {
      setLoading(false);
    }
  };

  const fetchEvaluation = async (id: string) => {
    setEvalLoading(true);
    setSelectedEvaluation(null);
    try {
      const res = await api.get(`/interviews/session/${id}/report`);
      setSelectedEvaluation(res.data.evaluation);
    } catch (error) {
      // Handled by global interceptor
    } finally {
      setEvalLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container max-w-5xl py-12 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Interview History</h1>
        {localStorage.getItem('isGhost') === 'true' && <Badge variant="outline" className="px-4 py-1">Ghost Mode Active</Badge>}
      </div>

      {interviews.length === 0 ? (
        <Card className="glassmorphism text-center py-20 max-w-2xl mx-auto w-full">
          <CardContent className="space-y-4">
            <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
            <div className="space-y-1">
              <h3 className="text-xl font-medium">No Interviews Yet</h3>
              <p className="text-muted-foreground">Start your first AI practice session today.</p>
            </div>
            <Button onClick={() => window.location.href='/setup'}>Schedule Now</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 max-w-3xl mx-auto w-full">
          {interviews.map((interview) => (
            <Card key={interview._id} className="glassmorphism group transition-all hover:border-primary/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-xl">{interview.jobTitle}</CardTitle>
                    <Badge className={
                      interview.status === 'completed' ? 'bg-green-500/20 text-green-500' :
                      interview.status === 'pending' ? 'bg-blue-500/20 text-blue-500' : 'bg-red-500/20 text-red-500'
                    }>
                      {interview.status}
                    </Badge>
                  </div>
                  <CardDescription className="flex items-center gap-2">
                    <CalendarIcon className="h-3 w-3" />
                    {format(new Date(interview.scheduledAt), 'PPP p')} • {interview.duration} mins
                  </CardDescription>
                </div>

                {interview.status === 'completed' && (
                  <Dialog>
                    <DialogTrigger render={<Button variant="secondary" onClick={() => fetchEvaluation(interview._id)} />}>
                      View Performance <ClipboardCheck className="ml-2 h-4 w-4" />
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl glassmorphism">
                      <DialogHeader>
                        <DialogTitle>Interview Evaluation</DialogTitle>
                      </DialogHeader>
                      {evalLoading ? (
                        <div className="py-10 flex justify-center"><Loader2 className="animate-spin" /></div>
                      ) : selectedEvaluation ? (
                        <div className="space-y-6">
                          <div className="flex items-center gap-4">
                            <div className="h-20 w-20 rounded-full border-4 border-primary flex items-center justify-center text-2xl font-bold">
                              {selectedEvaluation.score}%
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground italic">" {selectedEvaluation.feedback} "</p>
                            </div>
                          </div>
                          
                          <div className="grid sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <h4 className="font-bold text-green-500">Strengths</h4>
                              <ul className="text-sm list-disc pl-4 space-y-1">
                                {selectedEvaluation.strengths.map((s: string, i: number) => <li key={i}>{s}</li>)}
                              </ul>
                            </div>
                            <div className="space-y-2">
                              <h4 className="font-bold text-red-500">Weaknesses</h4>
                              <ul className="text-sm list-disc pl-4 space-y-1">
                                {selectedEvaluation.weaknesses.map((s: string, i: number) => <li key={i}>{s}</li>)}
                              </ul>
                            </div>
                          </div>

                          <div className="bg-primary/5 p-4 rounded-xl border border-primary/20">
                            <h4 className="font-bold text-primary mb-2">Areas of Improvement</h4>
                            <ul className="text-sm list-disc pl-4 space-y-1">
                              {selectedEvaluation.improvements.map((s: string, i: number) => <li key={i}>{s}</li>)}
                            </ul>
                          </div>
                        </div>
                      ) : (
                        <div className="py-10 flex flex-col items-center gap-4 text-center text-muted-foreground">
                          <Loader2 className="animate-spin h-8 w-8 text-primary/50" />
                          <p>AI is completing your detailed evaluation. Please check back shortly.</p>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                )}
                
                {interview.status === 'pending' && (
                  <Button onClick={() => window.location.href=`/interview/${interview._id}`}>
                    Start Now <Zap className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
