'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { Eye, EyeOff, User, Mail, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import { signupSchema } from '@/schemas';
import { toast } from 'sonner';
import axios, { AxiosError } from 'axios';
import { useAuthContext } from '@/context/AuthContext';

export default function Signup() {
  const router = useRouter();
  const [showPw, setShowPw] = useState(false);
  const { login } = useAuthContext()
  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    mode: 'onChange',
    defaultValues: { username: '', email: '', password: '', avatarUrl: undefined },
  });

  const isSubmitting = form.formState.isSubmitting;

  async function onSubmit(data: z.infer<typeof signupSchema>) {
    const result = signupSchema.safeParse(data);
    if (!result.success) {
      toast.error(result.error.format()._errors.toString());
      return;
    }
    const { username, email, password, avatarUrl } = result.data;

    const formData = new FormData()
    formData.append("username", username)
    formData.append("email", email)
    formData.append("password", password)
    if (avatarUrl && avatarUrl.size) {
      formData.append("avatarUrl", avatarUrl)
    }
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user/signup`, formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        },
        withCredentials:true
      });
      login({ ...response.data.user })
      toast.success(response.data.message || "user registered");
      router.replace('/')
    } catch (error) {
      console.error("Error during sign-up:", error);
      if (error instanceof AxiosError) {
        toast.error(error.response?.data.message);
      } else {
        toast.error("unexpected error ");
      }
    }
  }

  return (
    <main
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'var(--bg)', color: 'var(--text)' }}
    >


      <Card
        className="w-full max-w-[460px] md:border-[color:var(--border)] md:shadow-xl border-none"
      >
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl">Create your account</CardTitle>
          <CardDescription className="text-base text-[color:var(--text-dim)]">
            Sign up to start AI-powered interview practice.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-5">
              {/* Username */}
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[color:var(--text)]">Username</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[color:var(--text-dim)]" />
                        <Input
                          placeholder="Enter your username"
                          className="pl-9 border-[color:var(--border)] bg-[color:var(--bg)] text-[color:var(--text)] placeholder:text-[color:var(--text-dim)]"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className='text-red-700'/>
                  </FormItem>
                )}
              />

              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[color:var(--text)]">Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[color:var(--text-dim)]" />
                        <Input
                          type="email"
                          inputMode="email"
                          autoComplete="email"
                          placeholder="name@company.com"
                          className="pl-9 border-[color:var(--border)] bg-[color:var(--bg)] text-[color:var(--text)] placeholder:text-[color:var(--text-dim)]"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className='text-red-700'/>
                  </FormItem>
                )}
              />

              {/* Password */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[color:var(--text)]">Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[color:var(--text-dim)]" />
                        <Input
                          type={showPw ? 'text' : 'password'}
                          autoComplete="new-password"
                          placeholder="••••••••"
                          className="pl-9 pr-10 border-[color:var(--border)] bg-[color:var(--bg)] text-[color:var(--text)] placeholder:text-[color:var(--text-dim)]"
                          {...field}
                        />
                        <button
                          type="button"
                          aria-label={showPw ? 'Hide password' : 'Show password'}
                          onClick={() => setShowPw(v => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[color:var(--text-dim)] hover:text-[color:var(--text)] transition-colors "
                        >
                          {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormDescription className="text-[color:var(--text-dim)]">
                      Password must be at least 6 characters
                    </FormDescription>
                    <FormMessage className='text-red-700'/>
                  </FormItem>
                )}
              />
              {/* Image upload */}
              <FormField
                control={form.control}
                name="avatarUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor='avatarUrl' className="text-[color:var(--text)]">Avatar </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          id='avatarUrl'
                          accept='image/*'
                          type='file'
                          onChange={(e) => {
                            field.onChange(e.target.files?.[0] ?? undefined)
                          }}
                          onBlur={field.onBlur}
                          ref={field.ref}
                        />
                      </div>
                    </FormControl>
                    <FormDescription className="text-[color:var(--text-dim)]">
                      Password must be at least 6 characters
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={isSubmitting || !form.formState.isValid}
                className="rounded-lg px-5 py-3 font-semibold text-[#0E1116] bg-gradient-to-tr from-indigo-500 to-rose-500 hover:from-indigo-400 hover:to-rose-400 transition-colors duration-200"
              >
                {isSubmitting ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#0E1116]/20 border-t-[#0E1116]" />
                    Creating account...
                  </span>
                ) : (
                  'Sign up'
                )}
              </Button>
            </form>
          </Form>
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          <p className="text-sm text-[color:var(--text-dim)]">
            Already have an account?{' '}
            <Link href="/login" className="underline hover:text-[color:var(--text)]">
              Log in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </main>
  );
}
