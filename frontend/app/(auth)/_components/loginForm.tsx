'use client';

import Image from 'next/image';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '../../../components/ui/button';
import { ArrowLeft, Github } from 'lucide-react';

export default function LoginPage() {
  return (
    <main
      className="min-h-screen relative flex flex-col justify-center overflow-hidden"
      style={{ background: 'var(--bg)', color: 'var(--text)' }}
    >

      <div className="container mx-auto px-4 sm:px-5 md:px-6">
        <div className="mx-auto w-full max-w-[440px]">
          <header className="flex items-center justify-between py-6">
            <Link
              href="/"
              className="text-sm flex items-center gap-x-1 text-[color:var(--text-dim)] hover:text-[color:var(--text)]"
            >
              <ArrowLeft className='h-4 w-4' />
              Back to home
            </Link>
          </header>

          <section className="rounded-2xl border p-6 sm:p-8"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <div className="mb-6">
              <span className="inline-block rounded-full bg-[color:var(--mint)] px-3 py-1.5 text-[10px] sm:text-xs font-medium text-[#0E1116]">
                Welcome back
              </span>
              <h1 className="mt-3 text-2xl sm:text-3xl font-bold leading-tight">
                Sign in to your account
              </h1>
              <p className="mt-2 text-sm text-[color:var(--text-dim)]">
                Practice role‑specific interviews and get instant feedback.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Button
                className='w-full flex items-center gap-x-2 bg-white text-black cursor-pointer hover:bg-amber-600'
                onClick={() => signIn('google', { callbackUrl: '/' })}
              >
                <Image
                  src="/google.svg"
                  alt="Google Icon"
                  width={25}
                  height={25}
                  priority
                />
                Sign in with google
              </Button>
              <Button
                className='w-full flex items-center gap-x-2 bg-white text-black cursor-pointer hover:bg-amber-600'
                onClick={() => signIn('github', { callbackUrl: '/' })}
              >
                <Image
                  src="/github.svg"
                  alt="Github Icon"
                  width={25}
                  height={25}
                  priority
                />
                Sign in with Github
              </Button>
            </div>

            <div className="my-6 flex items-center gap-3 text-[color:var(--text-dim)]">
              <span className="h-px flex-1" style={{ background: 'var(--border)' }} />
              <span className="text-xs">or</span>
              <span className="h-px flex-1" style={{ background: 'var(--border)' }} />
            </div>

            <p className="text-xs text-[color:var(--text-dim)]">
              By continuing, you agree to our{' '}
              <span className="underline cursor-pointer hover:text-[color:var(--text)]">Terms </span>
              and
              {" "}
              <span className="underline cursor-pointer hover:text-[color:var(--text)]">       Privacy Policy</span>
            </p>
          </section>

          <p className="mt-4 text-center text-sm text-[color:var(--text-dim)]">
            Don’t have an account? It’ll be created automatically after sign‑in.
          </p>
        </div>
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-1/2 h-24 w-[1200px] -translate-x-1/2 rounded-t-full blur-2xl opacity-30"
        style={{
          background: 'linear-gradient(90deg, var(--indigo), var(--coral))',
        }}
      />
    </main>
  );
}
