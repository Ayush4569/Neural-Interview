
import React from 'react';
import { Calendar, User, Star, PlusCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import InterviewCard from '../_components/InterviewCard';
import EmptyState from '../_components/EmptyState';
import { CreateInterviewModal } from '../_components/InterviewForm';
import { Button } from '@/components/ui/button';



export default async function MyInterviews() {

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      <div className="container mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <Badge className="bg-[color:var(--mint)] text-[#0E1116]">My Dashboard</Badge>
          <div className='mt-4 flex md:flex-row md:items-center md:gap-y-0 md:justify-between flex-col gap-y-3 '>
            <h1 className="text-3xl sm:text-4xl font-bold">My Interviews</h1>
            <CreateInterviewModal>
              <Button className="text-black py-5 text-wrap bg-white  flex items-center cursor-pointer hover:bg-gray-300 transition-all w-1/2 md:w-max">
                <PlusCircle className="h-6 w-6" />
                Create Interview
              </Button>
            </CreateInterviewModal>
          </div>
          <p className="text-[color:var(--text-dim)] text-lg max-w-2xl mt-4">
            Track your interview progress, review past performances, and manage upcoming sessions all in one place.
          </p>
        </div>
      </div>
    </div>
  )
}
