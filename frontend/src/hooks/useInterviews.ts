import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export const useInterviews = () => {
  return useQuery({
    queryKey: ['interviews'],
    queryFn: async () => {
      const { data } = await api.get('/interviews/history');
      return data.interviews || [];
    },
    staleTime: 5 * 60 * 1000,
  });
};
