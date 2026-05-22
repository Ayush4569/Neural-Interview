import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Interview } from "@/types";

type CreateInterviewPayload = {
  jobTitle: string;
  techStack: string[];
  experienceLevel: "0-1" | "1-3" | "3-5" | "5+";
  duration: number;
  optionalPrompt?: string;
  scheduledAt: string;
  mode: "now" | "schedule";
};


export const useInterviews = () => {
  return useQuery({
    queryKey: ["interviews"],
    queryFn: async () => {
      const { data } = await api.get("/interviews/history");
      return (data.interviews as Interview[]) || [];
    },
    retry: false,
    refetchOnWindowFocus: false,
    refetchInterval: 1000 * 60 * 5,
    staleTime: 5 * 60 * 1000,
  });
};

export const useGetInterviewById = (id: string) => {
  return useQuery({
    queryKey: ["interviews", id],
    queryFn: async () => {
      const { data } = await api.get(`/interviews/${id}`);
      return data.interview as Interview;
    },
    enabled: !!id,
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 1000 * 60 * 5,
  });
};

export const useCreateInterview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateInterviewPayload) => {
      const { data } = await api.post("/interviews", payload);
      return data ;
    },
    onMutate : async (payload : CreateInterviewPayload) => {
      await queryClient.cancelQueries({ queryKey: ["interviews"] });

      const previousInterviews = queryClient.getQueryData<Interview[]>(["interviews"]) || [];
      const newInterview = {
        _id: `temp-${Date.now()}`,
        jobTitle: payload.jobTitle,
        status: "scheduled",
        scheduledAt: payload.scheduledAt,
        plannedDuration: payload.duration,
        techStack: payload.techStack,
        experienceLevel: payload.experienceLevel,
        createdAt: new Date().toISOString()
      } as unknown as Interview;

      queryClient.setQueryData(["interviews"], [newInterview, ...previousInterviews]);

      return { previousInterviews };
    },
    onError: (err: Error, newInterview: CreateInterviewPayload, context: { previousInterviews: Interview[] } | undefined) => {
      if(context?.previousInterviews){
        queryClient.setQueryData(["interviews"], context.previousInterviews);
      }
    },
    onSuccess: (data) => {
      if (data.interview) {
        queryClient.setQueryData(["interviews"], (old: Interview[] = []) => {
          if (!old) return [data.interview];
          return old.map(interview => interview._id.startsWith("temp-") ? data.interview : interview)
        });
        queryClient.invalidateQueries({ queryKey: ["interviews"] });
      }
    },
  });
};