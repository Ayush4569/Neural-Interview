'use client';
import Image from 'next/image';
import React from 'react';

const TechChip = ({ label }: { label: string }) => (
  <span className="inline-flex items-center gap-1 rounded-full bg-slate-800/70 px-2.5 py-1 text-xs text-slate-200 ring-1 ring-slate-700">
    {label}
  </span>
);

const ControlButton = ({
  variant = 'primary',
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'danger' | 'ghost' }) => {
  const base =
    'inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-medium transition-colors';
  const styles =
    variant === 'danger'
      ? 'bg-rose-500/90 hover:bg-rose-500 text-white'
      : variant === 'ghost'
        ? 'bg-slate-800/70 hover:bg-slate-800 text-slate-200 ring-1 ring-slate-700'
        : 'bg-indigo-500/90 hover:bg-indigo-500 text-white';
  return (
    <button className={`${base} ${styles}`} {...rest}>
      {children}
    </button>
  );
};

const CardShell = ({
  title,
  subtitle,
  children,
  highlight = false,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  highlight?: boolean;
}) => (
  <div
    className={[
      'flex w-full flex-col rounded-3xl p-6 sm:p-7 lg:p-8',
      'bg-slate-900/70 ring-1 ring-slate-800',
      highlight ? 'outline-2 outline-indigo-700/50' : '',
    ].join(' ')}
    style={{ minHeight: 360 }}
  >
    <div className="flex-1">{children}</div>
    <div className="mt-4">
      <div className="text-lg font-semibold text-slate-100">{title}</div>
      {subtitle ? <div className="text-sm text-slate-400">{subtitle}</div> : null}
    </div>
  </div>
);

const PromptBar = ({ text }: { text: string }) => (
  <div className="w-full rounded-2xl bg-slate-900/70 px-5 py-4 text-slate-200 ring-1 ring-slate-800">
    {text}
  </div>
);

export default function InterviewScreenStatic() {
  const lastAssistantLine = 'What job experience level are you targeting?';
  return (
    <div className="min-h-screen w-full bg-[#0B0D12] text-slate-100">
      {/* Top bar */}
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-5">
        <div className="flex items-center gap-2">
          <div className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-indigo-600/90">💬</div>
          <div className="text-lg font-semibold tracking-tight">PrepWise</div>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-slate-800/70 px-3 py-1 text-xs text-slate-300 ring-1 ring-slate-700">
            Technical Interview
          </span>
          <div className="h-8 w-8 rounded-full bg-slate-800 ring-1 ring-slate-700" />
        </div>
      </header>

      {/* Title row */}
      <section className="mx-auto w-full max-w-6xl px-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl font-semibold text-slate-100">Frontend Developer Interview</h1>
          <div className="flex items-center gap-2">
            <TechChip label="React" />
            <TechChip label="Next.js" />
          </div>
        </div>
      </section>

      {/* Main stage */}
      <main className="mx-auto mt-6 w-full max-w-6xl px-4">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <CardShell title="AI Interviewer" subtitle="Connected" highlight>
            <div className="flex h-56 items-center justify-center rounded-2xl bg-gradient-to-b from-slate-800/60 to-slate-900/60 ring-1 ring-slate-800">
              {/* AI image slot */}
              <Image
                alt='ai-cover'
                src='/ai-avatar.png'
                priority
                width={70}
                height={70}
                className='bg-white rounded-2xl'
              />
            </div>
          </CardShell>

          <CardShell title="Adrian (You)" subtitle="Microphone active">
            <div className="flex h-56 items-center justify-center rounded-2xl bg-gradient-to-b from-slate-800/60 to-slate-900/60 ring-1 ring-slate-800">
              {/* User image slot */}

              <Image
                alt='user-cover'
                src={'/user-avatar.png'}
                priority
                width={70}
                height={70}
                className=' rounded-2xl'
              />
            </div>
          </CardShell>
        </div>

        <div className="mt-6">
          <PromptBar text={lastAssistantLine} />
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
          <ControlButton variant="ghost">⟳ Repeat</ControlButton>
          <ControlButton variant="danger">✂ Leave interview</ControlButton>
        </div>

        <div className="h-10" />
      </main>
    </div>
  );
}
