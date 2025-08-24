
import React from 'react';
import { Calendar, User ,Star,PlusCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import InterviewCard from '../_components/InterviewCard';
import EmptyState from '../_components/EmptyState';
import { CreateInterviewModal } from '../_components/CreateInterviewModal';
import { Button } from '@/components/ui/button';

// Mock data - replace with real data from your API
const mockInterviews = {
  past: [
    {
      id: '1',
      title: 'Frontend Developer Interview',
      company: 'TechCorp Inc.',
      date: '2025-08-20',
      time: '14:30',
      duration: 45,
      type: 'Technical',
      status: 'completed',
      score: 85,
      feedback: 'Strong technical skills, good communication',
    },
    {
      id: '2',
      title: 'System Design Interview',
      company: 'StartupXYZ',
      date: '2025-08-18',
      time: '10:00',
      duration: 60,
      type: 'Technical',
      status: 'completed',
      score: 78,
      feedback: 'Good architectural thinking, needs improvement in scalability',
    },
  ],
  upcoming: [
    {
      id: '3',
      title: 'HR Screening Interview',
      company: 'Global Tech Ltd.',
      date: '2025-08-25',
      time: '16:00',
      duration: 30,
      type: 'Non-Technical',
      status: 'scheduled',
    },
    {
      id: '4',
      title: 'Senior React Developer Interview',
      company: 'InnovateCorp',
      date: '2025-08-28',
      time: '11:30',
      duration: 75,
      type: 'Technical',
      status: 'scheduled',
    },
  ],
};


export default function MyInterviews() {
  const pastInterviews = mockInterviews.past;
  const upcomingInterviews = mockInterviews.upcoming;
  const avgScore = pastInterviews.length > 0 
    ? Math.round(pastInterviews.reduce((sum, interview) => sum + (interview.score || 0), 0) / pastInterviews.length)
    : 0;

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      <div className="container mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <Badge className="mb-2 bg-[color:var(--mint)] text-[#0E1116]">My Dashboard</Badge>
          <div className='flex flex-col gap-y-1.5 md:gap-y-0 md:flex-row md:items-center md:justify-between mb-2 '>
          <h1 className="text-3xl sm:text-4xl font-bold ">My Interviews</h1>
          <CreateInterviewModal>
                    <Button className='bg-white text-black hover:bg-gray-300 transition-colors ease-in cursor-pointer w-max'>
                      <PlusCircle  />
                      Create Interview
                    </Button>
                </CreateInterviewModal>
          </div>
          
          <p className="text-[color:var(--text-dim)] max-w-2xl">
            Track your interview progress, review past performances, and manage upcoming sessions all in one place.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[color:var(--text-dim)]">Total Interviews</p>
                  <p className="text-2xl font-bold text-[color:var(--text)]">{pastInterviews.length + upcomingInterviews.length}</p>
                </div>
                <User className="h-8 w-8 text-[color:var(--indigo)]" />
              </div>
            </CardContent>
          </Card>

          <Card style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[color:var(--text-dim)]">Average Score</p>
                  <p className="text-2xl font-bold text-[color:var(--mint)]">{avgScore}%</p>
                </div>
                <Star className="h-8 w-8 text-[color:var(--amber)]" />
              </div>
            </CardContent>
          </Card>

          <Card style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[color:var(--text-dim)]">Upcoming</p>
                  <p className="text-2xl font-bold text-[color:var(--coral)]">{upcomingInterviews.length}</p>
                </div>
                <Calendar className="h-8 w-8 text-[color:var(--coral)]" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for switching between upcoming and past */}
        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="grid w-fit gap-x-2 grid-cols-2 mb-8 bg-[color:var(--surface)] border border-[color:var(--border)]">
            <TabsTrigger value="upcoming" className="data-[state=active]:bg-indigo-500/10 data-[state=active]:text-white data-[state=active]:border data-[state=active]:border-indigo-500/20 cursor-pointer">
              Upcoming ({upcomingInterviews.length})
            </TabsTrigger>
            <TabsTrigger value="past" className="data-[state=active]:bg-indigo-500/10 data-[state=active]:text-white data-[state=active]:border data-[state=active]:border-indigo-500/20 cursor-pointer">
              Past ({pastInterviews.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingInterviews.length > 0 ? (
                upcomingInterviews.map((interview) => (
                  <InterviewCard key={interview.id} interview={interview} isPast={false} />
                ))
              ) : (
                <EmptyState
                  type="upcoming"
                  title="No upcoming interviews"
                  description="Ready to practice? Schedule your next AI-powered interview session and get instant feedback to improve your skills."
                />
              )}
            </div>
          </TabsContent>

          <TabsContent value="past">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pastInterviews.length > 0 ? (
                pastInterviews.map((interview) => (
                  <InterviewCard key={interview.id} interview={interview} isPast={true} />
                ))
              ) : (
                <EmptyState
                  type="past"
                  title="No interview history yet"
                  description="Start your journey with AI-powered practice interviews. Complete your first session to see detailed reports and track your progress."
                />
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
