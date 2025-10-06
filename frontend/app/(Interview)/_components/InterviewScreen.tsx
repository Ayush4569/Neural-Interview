'use client';
import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import Vapi from '@vapi-ai/web';
import Image from 'next/image';
import { useAuthContext } from '@/context/AuthContext';

interface JoinPayload {
  config: {
    assistant: any;
    variableValues: any;
  };
  token: string;
}

type Bubble = { role: 'assistant' | 'user'; text: string };

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

export default function InterviewScreen({ interviewId }: { interviewId: string }) {
  const vapiRef = useRef<Vapi | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState<Bubble[]>([]);
  const [joinPayload, setJoinPayload] = useState<JoinPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthContext()

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/interviews/start/${interviewId}`,
          null,
          { withCredentials: true }
        );
        if (!cancelled) {
          if (!data?.success) setError('Failed to prepare interview');
          else setJoinPayload(data as JoinPayload);
        }
      } catch (e) {
        if (!cancelled) setError('Failed to prepare interview');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [interviewId]);

  useEffect(() => {
    if (!joinPayload?.token) return;
    const vapi = new Vapi(joinPayload.token);
    vapiRef.current = vapi;

    vapi.on('call-start', () => setIsConnected(true));
    vapi.on('call-end', () => setIsConnected(false));
    vapi.on('speech-start', () => setIsSpeaking(true));
    vapi.on('speech-end', () => setIsSpeaking(false));
    vapi.on('message', (m: any) => {
      // Expect { role, text }
      if (m?.text) {
        const role = m.role === 'assistant' ? 'assistant' : 'user';
        setTranscript((prev) => [...prev, { role, text: m.text }]);
      }
    });
    vapi.on('error', (e: any) => console.error('Vapi error', e));

    vapi
      .start(joinPayload.config.assistant, { variableValues: joinPayload.config.variableValues })
      .catch((e) => setError(e?.message || 'Failed to start call'));

    return () => {
      vapi.stop().catch(() => undefined);
    };
  }, [joinPayload]);

  const lastAssistantLine =
    [...transcript].reverse().find((t) => t.role === 'assistant')?.text ??
    'What job experience level are you targeting?';

  return (
    <div className="min-h-screen w-full bg-[#0B0D12] text-slate-100">

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

      {/* Main two-up stage */}
      <main className="mx-auto mt-6 w-full max-w-6xl px-4">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

          <CardShell title="AI Interviewer" subtitle={isConnected ? (isSpeaking ? 'Listening…' : 'Connected') : 'Connecting…'} highlight>

            <div className="flex h-56 items-center justify-center rounded-2xl bg-gradient-to-b from-slate-800/60 to-slate-900/60 ring-1 ring-slate-800">
              <Image
                alt='ai-cover'
                src='/ai-avatar.png'
                priority
                fill
              />
              <div className="h-24 w-24 rounded-2xl bg-slate-700" />
            </div>
          </CardShell>


          <CardShell title="Adrian (You)" subtitle="Microphone active">

            <div className="flex h-56 items-center justify-center rounded-2xl bg-gradient-to-b from-slate-800/60 to-slate-900/60 ring-1 ring-slate-800">
              <Image
                alt='user-cover'
                src={user?.avatarUrl || '/user-avatar.png'}
                priority
                fill
              />
              <div className="h-24 w-24 rounded-full bg-slate-700" />
            </div>
          </CardShell>
        </div>

        {/* Prompt / transcript bar */}
        <div className="mt-6">
          <PromptBar text={lastAssistantLine} />
        </div>

        {/* Bottom controls */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
          {/* <ControlButton variant="ghost" onClick={() => vapiRef.current.()}>
            ⟳ Repeat
          </ControlButton> */}
          <ControlButton
            variant="danger"
            onClick={() => {
              vapiRef.current?.stop?.();
              // navigate or lift state as needed
            }}
          >
            ✂ Leave interview
          </ControlButton>
        </div>

        {/* Error surface */}
        {error ? (
          <div className="mt-6 rounded-xl bg-rose-500/10 px-4 py-3 text-rose-300 ring-1 ring-rose-500/30">
            {error}
          </div>
        ) : null}
      </main>

      {/* Footer spacer */}
      <div className="h-10" />
    </div>
  );
}
