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
import api from "@/lib/api";
import { setupInterviewSchema } from "@/schemas";
import { useAuthStore } from "@/store/useAuthStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

type Formvalues = z.infer<typeof setupInterviewSchema>;
export default function SetupPage() {
  const router = useRouter();
  const isUser = useAuthStore((state) => state.isAuthenticated);
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
    },
  });

  const onSubmit = async (data: Formvalues) => {
    const payload = {
      ...data,
      techStack: data.techStack.split(",").map((item) => item.trim()),
      duration: parseInt(data.duration, 10),
    };
    try {
      // const res = await api.post("/interviews", payload);
      toast.success("Interview created successfully");
      // console.log('payloa');

      // router.push(`/interview/${res.data.interview._id}`);
    } catch (error) {
      toast.error("Failed to setup interview. Please try again.");
    }
  };
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] px-4 bg-[#0F1115] py-12">
      <div className="w-full max-w-xl space-y-8">
        {/* Header */}
        <div className="space-y-2 relative">
          <span
            className={`${!isUser ? "absolute" : "hidden"} -top-6 right-0 text-xs font-bold px-3 py-1 bg-red-500/10 text-red-500 border border-red-500/20 rounded-full`}
          >
            Ghost mode
          </span>

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
            <div className="space-y-3">
              <Label className="text-xs font-semibold text-gray-300">
                Experience Level
              </Label>

              <RadioGroup
                defaultValue="0-1"
                value={watch("experienceLevel")}
                onValueChange={(value) => setValue("experienceLevel", value)}
                className="grid grid-cols-2 sm:grid-cols-4 gap-4"
              >
                {["0-1", "1-3", "3-5", "5+"].map((level) => (
                  <Label
                    key={level}
                    htmlFor={level}
                    className={`flex items-center justify-center p-3 rounded-xl border cursor-pointer transition-colors w-full ${
                      watch("experienceLevel") === level
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
                  <SelectItem value="3 Mins">3 Minutes</SelectItem>
                  <SelectItem value="5 Mins">5 Minutes</SelectItem>
                  <SelectItem value="10 Mins">10 Minutes</SelectItem>
                </SelectContent>
              </Select>
              {errors.duration && (
                <p className="text-xs text-red-500">
                  {errors.duration.message}
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
                  : "Start Interview Immediately"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
