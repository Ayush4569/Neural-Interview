import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export const useGetEvaluation = (id: string) => {
  return useQuery({
    queryKey: ['evaluation', id],
    queryFn: async () => {
      const { data } = await api.get(`/interviews/session/${id}/report`);
      return {
        evaluation: data.evaluation || {},
        interview: data.interview || {},
      };
    },
    staleTime: 10 * 60 * 1000,
  });
};
