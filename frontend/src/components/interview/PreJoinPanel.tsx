"use client";

import { useGetInterviewById } from "@/hooks/useInterviews";
import { useAuthStore } from "@/store/useAuthStore";
import {  CheckCircle2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface PreJoinPanelProps {
  interviewId: string;
}

export default function PreJoinPanel({ interviewId }: PreJoinPanelProps) {
  const router = useRouter();
  const [micAllowed, setIsMicAllowed] = useState<boolean>(false);
  const [micEnabled, setIsMicEnabled] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const { data: interview, isLoading } = useGetInterviewById(interviewId);
  const { user } = useAuthStore();

  const requestMic = async () => {
    try {
      const audio = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });

      audioStreamRef.current = audio;

      setIsMicAllowed(true);
      setIsMicEnabled(true);
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(audio);
      const analyzer = audioContext.createAnalyser();
      source.connect(analyzer);
      analyzerRef.current = analyzer;
      analyzer.fftSize = 256;
      const dataArray = new Uint8Array(analyzer.frequencyBinCount);
      const updateMeter = () => {
        analyzer.getByteTimeDomainData(dataArray);
        let sum = 0;

        for (let i = 0; i < dataArray.length; i++) {
          const value = (dataArray[i] - 128) / 128;

          sum += Math.abs(value);
        }

        const average = sum / dataArray.length;

        const volume = Math.min(100, Math.round(average * 200));

        setVolume(volume);
        rafRef.current = requestAnimationFrame(updateMeter);
      };
      updateMeter();
    } catch (error: any) {
      setIsMicAllowed(false);
      console.log("Error during requesting mic: ", error);
      if (error?.name === "NotAllowedError") {
        toast.error("Permission denied. Check browser mic permissions.");
      } else if (error?.name === "NotFoundError") {
        toast.error("No microphone found. Plug in a mic and try again.");
      } else {
        toast.error("Unable to access microphone.");
      }
      return;
    }
  };

  const stopMic = () => {
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((t) => t.stop());
      audioStreamRef.current = null;
      setIsMicAllowed(false);
      setIsMicEnabled(false);
      setVolume(0);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    }
  };

  const toggleMic = () => {
    if (!audioStreamRef.current) return;
    const audioTracks = audioStreamRef.current.getAudioTracks();

    audioTracks.forEach((t) => {
      t.enabled = !t.enabled;
    });
    setIsMicEnabled(audioTracks[0].enabled);
  };

  useEffect(() => {
    return () => {
      stopMic();
    };
  }, []);

  if (isLoading || !interview) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <Loader2
          className="animate-spin text-purple-600 dark:text-fuchsia-400"
          size={50}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-8">
      {/* Main Card */}
      <div className="w-full max-w-3xl rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-white">
        {/* ================= HEADER ================= */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">Ready to Join?</h1>

            <p className="mt-2 text-sm text-zinc-400">
              Review interview details and test your microphone before joining.
            </p>
          </div>

          {/* Status Badge */}
          <div className="rounded-full bg-emerald-500/20 px-3 py-1 text-sm font-medium text-emerald-400">
            Pre-check
          </div>
        </div>

        {/* Divider */}
        <div className="my-6 h-px bg-zinc-800" />

        {/* ================= INTERVIEW DETAILS ================= */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Candidate */}
          <div className="rounded-xl border border-zinc-800 bg-black/40 p-4">
            <p className="text-sm text-zinc-400">Candidate</p>

            <h2 className="mt-2 text-lg font-semibold">{user?.username || "Guest"}</h2>
          </div>

          {/* Job Title */}
          <div className="rounded-xl border border-zinc-800 bg-black/40 p-4">
            <p className="text-sm text-zinc-400">Job Title</p>

            <h2 className="mt-2 text-lg font-semibold">{interview.jobTitle}</h2>
          </div>

          {/* Tech Stack */}
          <div className="rounded-xl border border-zinc-800 bg-black/40 p-4">
            <p className="text-sm text-zinc-400">Tech Stack</p>

            <h2 className="mt-2 text-lg  break-words">
              {interview.techStack.join(", ")}
            </h2>
          </div>

          {/* Duration */}
          <div className="rounded-xl border border-zinc-800 bg-black/40 p-4">
            <p className="text-sm text-zinc-400">Interview Duration</p>

            <h2 className="mt-2 text-lg font-semibold">
              {interview.plannedDuration} minutes
            </h2>
          </div>
        </div>

        {/* Divider */}
        <div className="my-6 h-px bg-zinc-800" />

        {/* ================= MICROPHONE SECTION ================= */}
        <div className="rounded-2xl border border-zinc-800 bg-black/40 p-5">
          {/* Mic Header */}
          <div className="flex items-center justify-between">
            {/* Left Side */}
            <div className="flex items-center gap-3">
              {/* Mic Icon Circle */}
              <div className={`flex h-12 w-12 items-center justify-center rounded-full transition-colors ${micAllowed && micEnabled ? "bg-emerald-500/20 text-emerald-400" : "bg-zinc-800 text-zinc-400"}`}>
                🎤
              </div>

              {/* Mic Info */}
              <div>
                <h3 className="font-semibold">Microphone</h3>

                <p className="text-sm text-zinc-400">
                  {micAllowed ? "Permission granted" : "Permission required"}
                </p>
              </div>
            </div>

            {/* Toggle Button */}
            {micAllowed && (
              <button
                onClick={toggleMic}
                className="rounded-lg border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-800 transition-colors"
              >
                {micEnabled ? "Mute" : "Unmute"}
              </button>
            )}
          </div>

          {/* ================= AUDIO METER ================= */}

          <div className="mt-6">
            {/* Meter Background */}
            <div className="h-3 w-full overflow-hidden rounded-full bg-zinc-800">
              {/* Meter Fill */}
              <div
                className="h-full rounded-full bg-linear-to-r from-indigo-500 to-pink-500 transition-all duration-75"
                style={{ width: `${micEnabled ? volume : 0}%` }}
              />
            </div>

            {/* Meter Labels */}
            <div className="mt-2 flex items-center justify-between text-xs text-zinc-500">
              <span>Input Level</span>

              <span>{micEnabled ? volume : 0}</span>
            </div>
          </div>

          {/* Permission Button */}
          {!micAllowed ? (
            <button
              onClick={requestMic}
              className="mt-4 rounded-lg border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-800 transition-colors"
            >
              Grant Microphone Permission
            </button>
          ) : (
            <button
              onClick={stopMic}
              className="mt-4 rounded-lg border border-red-500/50 text-red-400 px-4 py-2 text-sm hover:bg-red-500/10 transition-colors"
            >
              Revoke Permission
            </button>
          )}
        </div>

        {/* Divider */}
        <div className="my-6 h-px bg-zinc-800" />

        {/* ================= FOOTER ACTIONS ================= */}
        <div className="flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Status */}
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <CheckCircle2
              className={`h-4 w-4 ${micAllowed ? "text-emerald-500" : "text-red-500"}`}
            />
            {micAllowed ? "All checks passed" : "Allow mic to proceed"}
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            {/* Back Button */}
            <button 
              onClick={() => router.back()}
              className="rounded-lg border border-zinc-700 px-5 py-2.5 hover:bg-zinc-800 transition-colors"
            >
              Back
            </button>

            {/* Join Button */}
            <button
              disabled={!micAllowed}
              onClick={() => router.push(`/interview/${interviewId}`)}
              className="rounded-lg bg-linear-to-r from-indigo-500 to-pink-500 px-5 py-2.5 font-semibold text-black hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
            >
              Join Interview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
