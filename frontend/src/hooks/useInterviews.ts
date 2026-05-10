import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Interview } from '@/types';

export const useInterviews = () => {
  return useQuery({
    queryKey: ['interviews'],
    queryFn: async () => {
      const { data } = await api.get('/interviews/history');
      return data.interviews as Interview[] || [];
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useGetInterviewById = (id:string)=>{
  return useQuery({
    queryKey: ['interviews', id],
    queryFn: async () => {
      const { data } = await api.get(`/interviews/${id}`);
      return data.interview as Interview;
    },
    staleTime: 5 * 60 * 1000,
  });
}