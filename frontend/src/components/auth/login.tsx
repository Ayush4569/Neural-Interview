'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api from '@/lib/api';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Lock, Mail, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { loginSchema } from '@/schemas';
import { useAuthStore } from '@/store/useAuthStore';

type FormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const setUser = useAuthStore(state => state.setUser)

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    try {
      const res = await api.post('/user/auth/login', {...data,device : navigator.platform || navigator.userAgent});
      toast.success("Login successfull");
      setUser(res.data.user);
      router.push('/myinterviews');
    } catch (error: unknown) {
      // API interceptor handles the error toast
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] px-4 bg-[#0F1115]">
      <div className="w-full max-w-md space-y-8">
        
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-white">Login to you account</h1>
          <p className="text-sm text-gray-400">
            Hey welcome back 👋, login to continue.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs font-semibold text-gray-300">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
              <Input 
                id="email" 
                placeholder="name@example.com" 
                className="pl-10 bg-[#161920] border-gray-800 text-white placeholder:text-gray-500 rounded-md focus-visible:ring-1 focus-visible:ring-indigo-500" 
                {...register("email")} 
              />
            </div>
            {errors.email && <p className="text-xs text-red-500 text-left">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-xs font-semibold text-gray-300">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
              <Input 
                id="password" 
                type={showPassword ? "text" : "password"}
                placeholder="••••••••" 
                className="pl-10 pr-10 bg-[#161920] border-gray-800 text-white placeholder:text-gray-500 rounded-md focus-visible:ring-1 focus-visible:ring-indigo-500" 
                {...register("password")} 
              />
              <button 
                type="button" 
                className="absolute right-3 top-3 text-gray-500 hover:text-gray-300"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password ? (
                <p className="text-xs text-red-500 text-left">{errors.password.message}</p>
            ) : (
                <p className="text-xs text-gray-500 text-left mt-1">Password must be at least 6 characters</p>
            )}
          </div>

          <Button 
            type="submit" 
            disabled={loading}
            className="w-full h-11 rounded-md font-medium text-black bg-linear-to-r from-purple-400 to-pink-500 hover:opacity-90 transition-opacity border-0"
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Login"}
          </Button>

          <p className="text-sm text-center text-gray-400">
            Don't have an account?{" "}
            <Link href="/register" className="text-gray-300 hover:text-white underline">
              Register
            </Link>
          </p>
        </form>

      </div>
    </div>
  );
}
