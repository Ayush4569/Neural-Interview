'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Mic, MicOff, User2, Cpu, Briefcase, Clock, CheckCircle2 } from 'lucide-react';
import { useGetInterviewById } from '@/hooks/useGetInterviewByid';
import { useAuthContext } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Loading from '@/app/loading';
import { toast } from 'sonner';

export default function PrejoinPanel({
  id
}: { id: string }) {

  const audioStreamRef = useRef<MediaStream | null>(null) // to capture audio tracks
  const analyserRef = useRef<AnalyserNode | null>(null) // gives real-time data about the audio signal (frequency, waveform, volume, etc.) 
  const rafRef = useRef<number | null>(null) // for drawing meter
  const [micAllowed, setIsMicAllowed] = useState<boolean>(true)
  const [micEnabled, setMicEnabled] = useState<boolean>(true);
  const [audioMeter, setAudioMeter] = useState<number>(0)
  const { user } = useAuthContext()
  const router = useRouter()
  const { data: interview, isPending, isError, error } = useGetInterviewById({ id })
  const requestMic = async () => {
    try {
      if (!navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== 'function') {
        toast.error("Microphone not available. Use HTTPS or a modern browser.");
        return;
      }
      if (!window.isSecureContext) {
        toast.error("Requires a secure context (HTTPS or localhost).");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      audioStreamRef.current = stream;
      setIsMicAllowed(true);

      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()

      const source = audioContext.createMediaStreamSource(stream)

      const analyzer = audioContext.createAnalyser()
      analyzer.fftSize = 512;
      source.connect(analyzer);
      analyserRef.current = analyzer
      const dataArray = new Uint8Array(analyzer.frequencyBinCount)
      const updateMeter = () => {
        // Fill dataArray with waveform data
        analyzer.getByteTimeDomainData(dataArray);

        // Convert raw data to a volume level
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          const value = (dataArray[i] - 128) / 128; // Convert 0–255 → -1..1
          sum += Math.abs(value); // Take absolute value
        }

        const avg = sum / dataArray.length; // Average amplitude (0..1)
        const volume = Math.min(100, Math.round(avg * 200)); // Scale to 0–100

        setAudioMeter(volume)
        // Repeat continuously
        rafRef.current = requestAnimationFrame(updateMeter);
      };

      updateMeter()

    } catch (err: any) {
      setIsMicAllowed(false);
      console.error("Mic request failed:", err);
      if (err?.name === "NotAllowedError") {
        toast.error("Permission denied. Check browser mic permissions.");
      } else if (err?.name === "NotFoundError") {
        toast.error("No microphone found. Plug in a mic and try again.");
      } else {
        toast.error("Unable to access microphone.");
      }
      return;
    }
  };

  const stopMic = async () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = null;
    analyserRef.current = null;
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((t) => t.stop())
      audioStreamRef.current = null
    }
  }

  const handleToggleMic = async (value: boolean) => {
    setMicEnabled(value)
    if (value) {
      if (!audioStreamRef.current) await requestMic()
      audioStreamRef.current?.getAudioTracks().forEach((t) => t.enabled = true)
    } else {
      audioStreamRef.current?.getAudioTracks().forEach((t) => (t.enabled = false));
      setAudioMeter(0);
    }
  }

  useEffect(() => {
    requestMic()

    return () => {
      stopMic()
    }
  }, [])
  if (isPending) {
    return <Loading />
  }
  else if (isError || !interview) {
    router.back()
    toast.error(error.message || "Error loading screen")
    return null
  }


  const canJoin = micAllowed
  return (
    <div className="min-h-[70vh] w-full px-4 py-8 sm:px-6 flex items-center justify-center" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      <Card className="w-full max-w-3xl border-[color:var(--border)]" style={{ background: 'var(--surface)' }}>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">Ready to join?</CardTitle>
            <Badge className="bg-[color:var(--mint)] text-[#0E1116]">Pre‑check</Badge>
          </div>
          <CardDescription className="text-[color:var(--text-dim)]">
            Review interview details and verify microphone before starting.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-lg border p-4" style={{ borderColor: 'var(--border)', background: 'var(--bg)' }}>
              <div className="flex items-center gap-2 text-sm text-[color:var(--text-dim)]">
                <User2 className="h-4 w-4" /> Candidate
              </div>
              <div className="mt-1 text-lg font-semibold">{user?.username}</div>
            </div>

            <div className="rounded-lg border p-4" style={{ borderColor: 'var(--border)', background: 'var(--bg)' }}>
              <div className="flex items-center gap-2 text-sm text-[color:var(--text-dim)]">
                <Briefcase className="h-4 w-4" /> Job Title
              </div>
              <div className="mt-1 text-lg font-semibold">{interview.jobTitle}</div>
            </div>

            <div className="rounded-lg break-words border p-4" style={{ borderColor: 'var(--border)', background: 'var(--bg)' }}>
              <div className="flex items-center gap-2 text-sm text-[color:var(--text-dim)]">
                <Cpu className="h-4 w-4" /> Tech Stack
              </div>
              <div className="mt-1 text-base font-semibold">{interview.techStack}</div>
            </div>

            <div className="rounded-lg border p-4" style={{ borderColor: 'var(--border)', background: 'var(--bg)' }}>
              <div className="flex items-center gap-2 text-sm text-[color:var(--text-dim)]">
                <Clock className="h-4 w-4" /> Duration
              </div>
              <div className="mt-1 text-lg font-semibold">{interview.durationMinutes} minutes</div>
            </div>
          </div>

          <Separator className="bg-[color:var(--border)]" />

          {/* Mic test */}
          <div className="rounded-xl border p-4 sm:p-5" style={{ borderColor: 'var(--border)', background: 'var(--bg)' }}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div  className={`rounded-full p-2 ${micEnabled ? 'bg-[color:var(--mint)]/10' : 'bg-[color:var(--coral)]/10'}`}>
                  {micEnabled ? (
                    <Mic onClick={()=> handleToggleMic(false)} className="h-5 w-5 cursor-pointer text-[color:var(--mint)]" />
                  ) : (
                    <MicOff
                     className="h-5 w-5 cursor-pointer text-[color:var(--coral)]"
                     onClick={()=> handleToggleMic(true)} 
                      />
                  )}
                </div>
                <div>
                  <div className="font-medium">Microphone</div>
                  <div className="text-sm text-[color:var(--text-dim)]">
                    {micAllowed ? 'Permission granted' : 'Permission required'}
                  </div>
                </div>
              </div>
            </div>

            {/* Level meter */}
            <div className="mt-4">
              <div className="h-2 w-full rounded-full bg-[color:var(--border)] overflow-hidden">
                <div
                  className="h-2 rounded-full transition-all"
                  style={{
                    width: `${micEnabled && micAllowed ? audioMeter : 0}%`,
                    background: 'linear-gradient(90deg, var(--indigo), var(--coral))',
                  }}
                />
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-[color:var(--text-dim)]">
                <span>Input level</span>
                <span>{micEnabled && micAllowed ? `${audioMeter}%` : '0%'}</span>
              </div>

              {!micAllowed && (
                <Button
                  variant="outline"
                  className="mt-3 border-[color:var(--border)] text-[color:var(--text)] hover:bg-[color:var(--border)]/10"
                  onClick={requestMic}
                >
                  Grant microphone permission
                </Button>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm text-[color:var(--text-dim)]">
              <CheckCircle2 className={`h-4 w-4 ${canJoin ? 'text-[color:var(--mint)]' : 'text-[color:var(--coral)]'}`} />
              {canJoin ? 'All checks passed' : 'Allow mic to proceed'}
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="border-[color:var(--border)] text-[color:var(--text)] hover:bg-[color:var(--border)]/10"
                onClick={() => window.history.back()}
              >
                Back
              </Button>
              <Button
                className="text-[#0E1116] font-semibold disabled:opacity-50"
                disabled={!canJoin}
                style={{ background: 'linear-gradient(135deg, var(--indigo), var(--coral))' }}
              >
                Join Interview
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
