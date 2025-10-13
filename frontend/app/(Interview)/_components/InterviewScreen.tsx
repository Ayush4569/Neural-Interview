'use client';
import React, { useEffect, useRef, useState } from 'react';
import Vapi from '@vapi-ai/web';
import Image from 'next/image';
import { useAuthContext } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { useGetInterviewById } from '@/hooks/useGetInterviewByid';
import Loading from '@/app/loading';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface JoinPayload {
  config: {
    assistant: object;
    variableValues: object;
  };
  token: string;
}

type TranscriptType = { role: "user" | "system" | "assistant"; content: string };

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
    className={cn(
      'flex w-full flex-col rounded-3xl p-6 sm:p-7 lg:p-8',
      'bg-slate-900/70 ring-1 ring-slate-800 min-h-[360px]',
      highlight ? 'outline-2 outline-indigo-700/50' : '',
    )}
  >
    <div className="flex-1">{children}</div>
    <div className="mt-4">
      <div className="text-lg font-semibold text-slate-100">
        {title}
      </div>
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
  const router = useRouter()
  const vapiRef = useRef<Vapi | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptType[]>([]);
  const [joinPayload, setJoinPayload] = useState<JoinPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthContext()
  const { data: interview, isPending, isError, error: interviewError } = useGetInterviewById({ id: interviewId })


  useEffect(() => {
    const raw = sessionStorage.getItem(`join:${interviewId}`);
    if (!raw) {
      router.back()
      toast.error("No interview session found")
      return;
    }
    try {
      const payload = JSON.parse(raw);
      setJoinPayload(payload);
    } catch (e) {
      router.back()
      toast.error("Invalid interview session data")
    }
    if (!joinPayload?.token) {
      router.back()
      toast.error("No interview session found")
      return;
    };
    const vapi = new Vapi(joinPayload.token);
    vapiRef.current = vapi;

    vapi.on('call-start', () => {
      sessionStorage.removeItem(`join:${interviewId}`);
      setIsConnected(true)
    });
    vapi.on('call-end', () => setIsConnected(false));
    vapi.on('speech-start', () => setIsSpeaking(true));
    vapi.on('speech-end', () => setIsSpeaking(false));
    vapi.on('message', (message: Message) => {
      console.log('Vapi message', message);
      if (message.type === 'transcript') {
        const newMessage = { role: message.role, content: message.transcript };
        setTranscript((prev) => [...prev, newMessage]);
      }
    });
    vapi.on('error', (err) => console.error('Vapi error', err));

    vapi
      .start(joinPayload.config.assistant, { variableValues: joinPayload.config.variableValues })
      .catch((e) => setError(e?.message || 'Failed to start call'));

    return () => {
      vapi.stop()
    };
  }, [joinPayload]);

  const lastAssistantLine =
    [...transcript].reverse().find((t) => t.role === 'assistant')?.content ?? '';

  const handleDisconnect = () => {
    if (!vapiRef.current) return;
    vapiRef.current.stop()
    router.back()
  }
  if (isPending) {
    return <Loading />
  }
  else if (isError || !interview) {
    router.back()
    toast.error(interviewError.message || "Error loading screen")
    return null
  }
  return (
    <div className="min-h-screen w-full bg-[#0B0D12] text-slate-100">

      {/* Title row */}
      <section className="mx-auto w-full max-w-6xl px-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl font-semibold text-slate-100">{interview.jobTitle.toLocaleUpperCase()} Interview</h1>
          <div className="flex items-center gap-2">
            {
              interview.techStack.split(',').map((t) => {
                return <TechChip label={t} key={t} />
              })
            }
          </div>
        </div>
      </section>

      {/* Main two-up stage */}
      <main className="mx-auto mt-6 w-full max-w-6xl px-4">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

          <CardShell title="AI Interviewer" subtitle={isConnected ? (isSpeaking ? 'Listening…' : 'Connected') : 'Connecting…'} highlight>

            <div className="flex h-56 items-center justify-center rounded-2xl bg-gradient-to-b from-slate-800/60 to-slate-900/60 ring-1 ring-slate-800">
              <div className="flex h-56 items-center justify-center rounded-2xl bg-gradient-to-b from-slate-800/60 to-slate-900/60 ring-1 ring-slate-800">

                <Image
                  alt='ai-cover'
                  src='/ai-avatar.png'
                  priority
                  width={70}
                  height={70}
                  className='bg-white rounded-2xl'
                />
              </div>
            </div>
          </CardShell>


          <CardShell title={`${user?.username.toUpperCase()} (You)`} subtitle="Microphone active">

            <div className="flex h-56 items-center justify-center rounded-2xl bg-gradient-to-b from-slate-800/60 to-slate-900/60 ring-1 ring-slate-800">
              <Image
                src={user?.avatarUrl || '/user-avatar.png'}
                alt='User Avatar'
                height={66}
                width={66}
                style={{ height: 66, width: 66 }}
                className='object-cover rounded-full'
              />
            </div>
          </CardShell>
        </div>

        {/* transcript bar */}
        <div className="mt-6">
          <PromptBar text={lastAssistantLine} />
        </div>


        <div className="mt-6 flex flex-wrap items-center justify-center gap-4">

          <ControlButton
            variant="danger"
            onClick={handleDisconnect}
          >
            Leave interview
          </ControlButton>
        </div>


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
