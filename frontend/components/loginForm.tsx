'use client';

import Image from 'next/image';
import { signIn } from 'next-auth/react';
import Link from 'next/link';

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
              className="text-sm text-[color:var(--text-dim)] hover:text-[color:var(--text)]"
            >
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

            {/* OAuth buttons */}
            <div className="flex flex-col gap-3">
              <button
                onClick={() => signIn('google', { callbackUrl: '/' })}
                className="group relative flex w-full items-center justify-center gap-3 rounded-lg border px-4 py-2.5 font-medium"
                style={{ borderColor: 'var(--border)', background: 'rgba(255,255,255,0.02)' }}
              >
                <span className="absolute left-3 flex items-center">
                  <Image
                    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                    width={20}
                    height={20}
                    alt="Google"
                    priority
                  />
                </span>
                Continue with Google
                <span
                  className="pointer-events-none absolute inset-0 rounded-lg opacity-0 transition-opacity group-hover:opacity-100"
                  style={{ boxShadow: '0 0 0 1px var(--indigo) inset' }}
                />
              </button>

              <button
                onClick={() => signIn('github', { callbackUrl: '/' })}
                className="group relative flex w-full items-center justify-center gap-3 rounded-lg border px-4 py-2.5 font-medium"
                style={{ borderColor: 'var(--border)', background: 'rgba(255,255,255,0.02)' }}
              >
                <span className="absolute left-3 flex items-center">
                  <Image
                    src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg"
                    width={20}
                    height={20}
                    alt="GitHub"
                    priority
                  />
                </span>
                Continue with GitHub
                <span
                  className="pointer-events-none absolute inset-0 rounded-lg opacity-0 transition-opacity group-hover:opacity-100"
                  style={{ boxShadow: '0 0 0 1px var(--coral) inset' }}
                />
              </button>
            </div>

            {/* Divider */}
            <div className="my-6 flex items-center gap-3 text-[color:var(--text-dim)]">
              <span className="h-px flex-1" style={{ background: 'var(--border)' }} />
              <span className="text-xs">or</span>
              <span className="h-px flex-1" style={{ background: 'var(--border)' }} />
            </div>

            {/* Hint / Privacy */}
            <p className="text-xs text-[color:var(--text-dim)]">
              By continuing, you agree to our{' '}
              <Link href="/terms" className="underline hover:text-[color:var(--text)]">
                Terms
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="underline hover:text-[color:var(--text)]">
                Privacy Policy
              </Link>
              .
            </p>
          </section>

          {/* Subtle CTA */}
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
