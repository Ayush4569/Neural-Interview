import z from "zod";

export const InterviewSchema = z.object({
  jobTitle: z.string().min(2, "Job title must be at least 2 characters"),
  techStack: z.array(z.string()).min(1, "Tech stack is required"),
  experienceLevel: z.enum(["0-1", "1-3", "3-5", "5+"]),
  duration: z.number().min(3, "Interview duration must be at least 3 minutes"),
  scheduledAt: z.iso.datetime("Please enter a valid date and time"),
  optionalPrompt: z.string().optional(),
  mode: z.enum(["now", "schedule"]),
});

export const QuestionResponseSchema = z.string().min(1,"Answer cannot be empty")