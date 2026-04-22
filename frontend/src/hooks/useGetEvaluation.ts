import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export const useGetEvaluation = (id: string) => {
  return useQuery({
    queryKey: ['interview', id],
    queryFn: async () => {
      const { data } = await api.get(`/interviews/session/${id}/report`);
      return data.evaluation || {}
    },
    staleTime: 5 * 60 * 1000,
  });
};
