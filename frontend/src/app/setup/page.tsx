'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api from '@/lib/api';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useUser } from '@/hooks/useUser';
import { useQueryClient } from '@tanstack/react-query';
import { setupInterviewSchema } from '@/schemas';
import { toast } from 'sonner';

type FormValues = z.infer<typeof setupInterviewSchema>;

export default function SetupPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuthStore();
  const { isLoading: isFetchingUser } = useUser();
  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(true);

  useEffect(() => {
    if (isFetchingUser) return;

    if (!isAuthenticated) {
      const initGhost = async () => {
        try {
          await api.post('/user/auth/guest');
          await queryClient.invalidateQueries({ queryKey: ['user'] });
        } catch (error: unknown) {
          console.error(error);
        } finally {
          setInitLoading(false);
        }
      };
      initGhost();
    } else {
      setInitLoading(false);
    }
  }, [isAuthenticated, isFetchingUser, queryClient]);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(setupInterviewSchema),
    defaultValues: {
      experienceLevel: 'Junior',
      duration: '5',
    }
  });

  const durationValue = watch('duration');

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    try {
      const payload = {
        jobTitle: data.jobTitle,
        techStack: data.techStack.split(',').map((s: string) => s.trim()),
        experienceLevel: data.experienceLevel,
        duration: parseInt(data.duration, 10),
        scheduledAt: new Date().toISOString(),
      };
      
      const res = await api.post('/interviews', payload);
      router.push(`/interview/${res.data.interview._id}`);
    } catch (error: unknown) {
      toast.error("Failed to setup interview. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  if (initLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] bg-[#0F1115]">
        <Loader2 className="h-10 w-10 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] px-4 bg-[#0F1115] py-12">
      <div className="w-full max-w-xl space-y-8">
        
        <div className="space-y-2 relative">
          {user?.isGhost && (
            <span className="absolute -top-6 right-0 text-xs font-bold px-3 py-1 bg-red-500/10 text-red-500 border border-red-500/20 rounded-full">
              Ghost Mode
            </span>
          )}
          <h1 className="text-3xl font-semibold tracking-tight text-white">Configure Your Interview</h1>
          <p className="text-sm text-gray-400">
            Customize the role, stack, and duration to match your target job perfectly.
          </p>
        </div>

        <div className="bg-[#161920] border border-gray-800 rounded-2xl p-6 md:p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            <div className="space-y-2">
              <Label htmlFor="jobTitle" className="text-xs font-semibold text-gray-300">Target Job Title</Label>
              <Input 
                id="jobTitle" 
                placeholder="e.g. Senior Frontend Engineer" 
                className="bg-[#0F1115] border-gray-800 text-white h-12" 
                {...register("jobTitle")} 
              />
              {errors.jobTitle && <p className="text-xs text-red-500">{errors.jobTitle.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="techStack" className="text-xs font-semibold text-gray-300">Tech Stack (Comma separated)</Label>
              <Input 
                id="techStack" 
                placeholder="React, Node.js, TypeScript" 
                className="bg-[#0F1115] border-gray-800 text-white h-12" 
                {...register("techStack")} 
              />
              {errors.techStack && <p className="text-xs text-red-500">{errors.techStack.message}</p>}
            </div>

            <div className="space-y-3">
              <Label className="text-xs font-semibold text-gray-300">Experience Level</Label>
              <RadioGroup 
                defaultValue="Junior" 
                onValueChange={(v) => setValue("experienceLevel", v)} 
                className="grid grid-cols-2 sm:grid-cols-4 gap-4"
              >
                {['Entry', 'Junior', 'Senior', 'Expert'].map((level) => (
                  <div key={level} className="flex relative items-center justify-center bg-[#0F1115] p-3 rounded-xl border border-gray-800 hover:border-gray-600 cursor-pointer transition-colors">
                    <RadioGroupItem value={level} id={level} className="sr-only" />
                    <Label htmlFor={level} className="cursor-pointer w-full text-center text-gray-300 font-medium">{level}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-gray-300">Duration (Minutes)</Label>
              <Select value={durationValue} onValueChange={(v) => v && setValue("duration", v)}>
                <SelectTrigger className="h-12 bg-[#0F1115] border-gray-800 text-white">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent className="bg-[#161920] border-gray-800 text-white">
                  {user?.isGhost ? (
                    <SelectItem value="3">3 Minutes (Ghost Trial)</SelectItem>
                  ) : (
                    <>
                      <SelectItem value="3">3 Minutes</SelectItem>
                      <SelectItem value="5">5 Minutes</SelectItem>
                      <SelectItem value="10">10 Minutes</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="pt-4 mt-8 border-t border-gray-800">
              <Button 
                type="submit" 
                className="w-full font-bold h-12 bg-linear-to-r from-purple-400 to-pink-500 text-black border-0 hover:opacity-90 rounded-md" 
                disabled={loading}
              >
                {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Start Interview Immediately"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
