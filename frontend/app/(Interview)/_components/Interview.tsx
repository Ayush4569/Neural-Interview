'use client'
import React from 'react'
import { Calendar, User, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import InterviewCard from '../_components/InterviewCard';
import EmptyState from '../_components/EmptyState';
import { useGetInterviews } from '@/hooks/useInterview';
import Loading from '@/app/loading';


const Interview = () => {
    const {data:interviews,isPending,error,isError} = useGetInterviews();
    if(isPending) {
        return <Loading/>
    } else if(isError) {
        return <span>Error: {error.message}</span>
    }
    const upcomingInterviews = interviews.filter(({type})=> type=='upcoming')
    const pastInterviews = interviews.filter(({type})=> type=='past')
    const totalScore = interviews.reduce((acc,interview)=>{
        if(interview.type === 'upcoming') return 0;
        return acc + interview.score
    },0)
    const avgScore = totalScore/pastInterviews.length
    return (
        <main>
            <div className="container mx-auto px-4 sm:px-6 py-8">
                {/* Header */}
                <div className="mb-8">
                    <Badge className="mb-2 bg-[color:var(--mint)] text-[#0E1116]">My Dashboard</Badge>
                    <h1 className="text-3xl sm:text-4xl font-bold mb-3">My Interviews</h1>
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
                    <TabsList className="grid w-fit grid-cols-2 mb-8 bg-[color:var(--surface)] border border-[color:var(--border)]">
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
        </main>
    )
}

export default Interview
