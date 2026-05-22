"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { setupInterviewSchema } from "@/schemas";
import { useAuthStore } from "@/store/useAuthStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { useEffect, useState } from "react";

import { useCreateInterview } from "@/hooks/useInterviews";

type Formvalues = z.infer<typeof setupInterviewSchema>;

const now = new Date();
const timeInHHMM = now.toTimeString().slice(0, 5);
const MIN_BUFFER_MINUTES = 5;
export default function SetupPage() {
  const [date, setDate] = useState<Date>(now);
  const [time, setTime] = useState<string>(timeInHHMM);
  const router = useRouter();
  const isUser = useAuthStore((state) => state.isAuthenticated);
  const { mutateAsync: createInterview } = useCreateInterview();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<Formvalues>({
    resolver: zodResolver(setupInterviewSchema),
    defaultValues: {
      experienceLevel: "0-1",
      duration: "3",
      scheduledAt: new Date().toISOString(),
      optionalPrompt: "",
      mode: "schedule",
    },
  });
  const experience = watch("experienceLevel");
  const mode = watch("mode");

  const onSubmit = async (data: Formvalues) => {
    const currentTime = new Date();
    if (mode === "schedule" && new Date(data.scheduledAt) < currentTime) {
      toast.error("Cannot schedule in the past");
      return;
    }

    if (
      mode === "schedule" &&
      new Date(data.scheduledAt).getTime() - currentTime.getTime() <
        MIN_BUFFER_MINUTES * 60 * 1000
    ) {
      toast.error(`Schedule at least ${MIN_BUFFER_MINUTES} minutes ahead`);
      return;
    }
    const payload = {
      ...data,
      techStack: data.techStack.split(",").map((item) => item.trim()),
      duration: parseInt(data.duration),
      ...(mode === "now" && { scheduledAt: currentTime.toISOString() }),
      mode
    };


    try {
      const data = await createInterview(payload);
      toast.success("Interview created successfully");
      
      if (mode === "schedule") {
        router.push("/myinterviews");
      } else {
        router.push(`/interview/${data.interviewId}/lobby`);
      }
    } catch {
      // handled by global axios interceptor 
      
    }
  };

  useEffect(() => {
    if (!date || !time || mode !== "schedule") return;
    const scheduledDate = new Date(
      `${format(date, "yyyy-MM-dd")}T${time}`,
    ).toISOString();
    setValue("scheduledAt", scheduledDate);
  }, [date, time,setValue,mode]);

  useEffect(() => {
    if (mode === "now") {
      setValue("scheduledAt", new Date().toISOString());
    }
  }, [mode,setValue]);
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] px-4 bg-[#0F1115] py-12">
      <div className="w-full max-w-xl space-y-8">
        {/* Header */}
        <div className="space-y-2 relative">
          {!isUser && (
            <span
              className={`absolute -top-6 right-0 text-xs font-bold px-3 py-1 bg-red-500/10 text-red-500 border border-red-500/20 rounded-full`}
            >
              Ghost mode
            </span>
          )}

          <h1 className="text-3xl font-semibold tracking-tight text-white">
            Configure Your Interview
          </h1>

          <p className="text-sm text-gray-400">
            Customize the role, stack, and duration to match your target job
            perfectly.
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-[#161920] border border-gray-800 rounded-2xl p-6 md:p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Job Title */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-gray-300">
                Target Job Title
              </Label>
              <Input
                placeholder="e.g. Senior Frontend Engineer"
                className="bg-[#0F1115] border-gray-800 text-white h-12"
                {...register("jobTitle")}
              />
              {/* Error placeholder */}
              {errors.jobTitle && (
                <p className="text-xs text-red-500">
                  {errors.jobTitle.message}
                </p>
              )}
            </div>

            {/* Tech Stack */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-gray-300">
                Tech Stack (Comma separated)
              </Label>
              <Input
                placeholder="React, Node.js, TypeScript"
                className="bg-[#0F1115] border-gray-800 text-white h-12"
                {...register("techStack")}
              />
              {errors.techStack && (
                <p className="text-xs text-red-500">
                  {errors.techStack.message}
                </p>
              )}
            </div>

            {/* Experience Level */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-gray-300">
                Experience Level (Year)
              </Label>

              <RadioGroup
                defaultValue="0-1"
                value={experience}
                onValueChange={(value) => setValue("experienceLevel", value)}
                className="grid grid-cols-2 sm:grid-cols-4 gap-4"
              >
                {["0-1", "1-3", "3-5", "5+"].map((level) => (
                  <Label
                    key={level}
                    htmlFor={level}
                    className={`flex items-center justify-center p-3 rounded-xl border cursor-pointer transition-colors w-full ${
                      experience === level
                        ? "border-purple-500 bg-purple-500/10"
                        : "border-gray-800 bg-[#0F1115] hover:border-gray-600"
                    }`}
                  >
                    <RadioGroupItem
                      value={level}
                      id={level}
                      className="sr-only absolute"
                    />
                    <span className="text-center text-gray-300 font-medium">
                      {level}
                    </span>
                  </Label>
                ))}
              </RadioGroup>
              {errors.experienceLevel && (
                <p className="text-xs text-red-500">
                  {errors.experienceLevel.message}
                </p>
              )}
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-gray-300">
                Duration (Minutes)
              </Label>

              <Select
                value={watch("duration")}
                onValueChange={(value) => setValue("duration", value as string)}
              >
                <SelectTrigger className="h-12 bg-[#0F1115] border-gray-800 text-white">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>

                <SelectContent className="bg-[#161920] border-gray-800 text-white">
                  <SelectItem value="3">3 Minutes</SelectItem>
                  <SelectItem value="5">5 Minutes</SelectItem>
                  <SelectItem value="10">10 Minutes</SelectItem>
                </SelectContent>
              </Select>
              {errors.duration && (
                <p className="text-xs text-red-500">
                  {errors.duration.message}
                </p>
              )}
            </div>

            {/* Date and time */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-gray-300">
                Date and time
              </Label>

              <RadioGroup
                defaultValue="schedule"
                onValueChange={(v) => setValue("mode", v)}
                className="flex gap-x-4 mb-4 cursor-pointer"
              >
                <div className="flex items-center gap-x-2">
                  <RadioGroupItem value="now" id="now" />
                  <Label htmlFor="now">Start Now</Label>
                </div>

                <div className="flex items-center gap-x-2">
                  <RadioGroupItem value="schedule" id="schedule" />
                  <Label htmlFor="schedule">Schedule for later</Label>
                </div>
              </RadioGroup>

              {mode === "schedule" && (
                <>
                  <Popover>
                    <PopoverTrigger
                      render={
                        <Button
                          variant="outline"
                          data-empty={!date}
                          className="justify-start text-left font-normal data-[empty=true]:text-muted-foreground h-12"
                        />
                      }
                    >
                      <CalendarIcon />
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        required
                        disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                      />
                    </PopoverContent>
                  </Popover>
                  <Input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full h-12 px-3 text-white placeholder-gray-400 bg-gray-900 border border-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </>
              )}

              {errors.scheduledAt && (
                <p className="text-xs text-red-500">
                  {errors.scheduledAt.message}
                </p>
              )}
            </div>

            {/* Optional prompt */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-gray-300">
                Optional prompt (Tell about job desc or focusing on specific
                topic)
              </Label>
              <Input
                placeholder="Add specific instructions for the interviewer"
                className="bg-[#0F1115] border-gray-800 text-white h-12"
                {...register("optionalPrompt")}
              />
              {errors.optionalPrompt && (
                <p className="text-xs text-red-500">
                  {errors.optionalPrompt.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <div className="pt-4 mt-8 border-t border-gray-800">
              <Button
                disabled={isSubmitting}
                type="submit"
                className="w-full font-bold h-12 bg-linear-to-r from-purple-400 to-pink-500 text-black border-0 hover:opacity-90 rounded-md"
              >
                {isSubmitting
                  ? "Creating Interview..."
                  : mode === "now" ? "Start Interview Immediately" : "Schedule Interview"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
