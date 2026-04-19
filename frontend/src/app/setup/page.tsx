'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api from '@/lib/api';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Zap, Loader2 } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { motion } from 'framer-motion';

const formSchema = z.object({
  jobTitle: z.string().min(2, "Job title is required"),
  techStack: z.string().min(2, "At least one technology is required"),
  experienceLevel: z.enum(['Entry', 'Junior', 'Senior', 'Expert']),
  duration: z.string(),
  scheduledAt: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function SetupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isGhost, setIsGhost] = useState(false);

  useEffect(() => {
    const storedId = localStorage.getItem('userId');
    const storedIsGhost = localStorage.getItem('isGhost') === 'true';
    if (storedId) {
      setUserId(storedId);
      setIsGhost(storedIsGhost);
    } else {
      // Auto ghost login
      const initGhost = async () => {
        try {
          const res = await api.post('/user/auth/guest');
          localStorage.setItem('userId', res.data.user._id);
          localStorage.setItem('isGhost', 'true');
          setUserId(res.data.user._id);
          setIsGhost(true);
        } catch (error) {
          // Handled by global interceptor
        }
      };
      initGhost();
    }
  }, []);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      experienceLevel: 'Junior',
      duration: '5',
    }
  });

  const durationValue = watch('duration');

  const onSubmit = async (data: FormValues) => {
    if (!userId) return;
    setLoading(true);
    try {
      const payload = {
        ...data,
        techStack: data.techStack.split(',').map(s => s.trim()),
        duration: parseInt(data.duration),
        scheduledAt: data.scheduledAt || new Date().toISOString(),
      };

      const res = await api.post('/interviews', payload);

      router.push(`/interview/${res.data.interview._id}`);
    } catch (error: any) {
      if (error.response?.status === 403) {
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  


  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-20 relative overflow-hidden">
      <div className="absolute inset-0 premium-gradient opacity-10 blur-3xl -z-10"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <Card className="glassmorphism border-primary/20 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4">
            {isGhost && <Badge variant="destructive">Ghost Mode</Badge>}
          </div>
          <CardHeader className="text-center pt-8">
            <CardTitle className="text-3xl font-extrabold tracking-tight">Configure Your Interview</CardTitle>
            <CardDescription className="text-base mt-2">
              Customize the role, stack, and duration to match your target job perfectly.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-6 px-8 pt-4">
              <div className="space-y-2">
                <Label htmlFor="jobTitle" className="text-sm font-semibold">Target Job Title</Label>
                <Input id="jobTitle" placeholder="e.g. Senior Frontend Engineer" className="bg-background/50 h-12" {...register("jobTitle")} />
                {errors.jobTitle && <p className="text-xs text-destructive">{errors.jobTitle.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="techStack" className="text-sm font-semibold">Tech Stack (Comma separated)</Label>
                <Input id="techStack" placeholder="React, Node.js, TypeScript" className="bg-background/50 h-12" {...register("techStack")} />
                {errors.techStack && <p className="text-xs text-destructive">{errors.techStack.message}</p>}
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-semibold">Experience Level</Label>
                <RadioGroup defaultValue="Junior" onValueChange={(v) => setValue("experienceLevel", v as any)} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {['Entry', 'Junior', 'Senior', 'Expert'].map((level) => (
                    <div key={level} className="flex items-center space-x-2 bg-background/30 p-3 rounded-xl border border-primary/10 cursor-pointer hover:bg-primary/5 transition-colors">
                      <RadioGroupItem value={level} id={level} />
                      <Label htmlFor={level} className="cursor-pointer w-full text-center">{level}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold">Duration (Minutes)</Label>
                <Select value={durationValue} onValueChange={(v) => v && setValue("duration", v)}>
                  <SelectTrigger className="h-12 bg-background/50">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    {isGhost ? (
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
            </CardContent>
            <CardFooter className="px-8 pb-8 pt-4">
              <Button type="submit" className="w-full font-bold h-14 text-lg premium-gradient border-0 hover:opacity-90 transition-opacity text-white shadow-xl" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Start Interview Immediately"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
