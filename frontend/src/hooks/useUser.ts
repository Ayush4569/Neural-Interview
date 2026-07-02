import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';

export const useUser = () => {
  const setUser = useAuthStore((state) => state.setUser);
  const clearUser = useAuthStore((state) => state.clearUser);

  return useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      try {
        const { data } = await api.get('/user/profile');
        if (data.success && data.user) {
          setUser(data.user);
          return data.user;
        }
        throw new Error('User profile data invalid');
      } catch (error) {
        clearUser();
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
  });
};
