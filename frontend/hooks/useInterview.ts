import { Interview } from "@/types/globalTypes";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { usePathname } from "next/navigation";
import { toast } from "sonner";

export const useGetInterviews = () => {
    const pathname = usePathname();
   return useQuery<Interview[],Error>({
        queryKey:['interviews'],
        staleTime: 5*60*1000,
        retry:false,
        refetchInterval:5*60*1000,
        refetchOnWindowFocus:false,
        enabled:pathname.startsWith('/interviews'),
        queryFn:async()=>{
            try {
                const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/interview`,{
                    withCredentials: true
                });
                return res.data.interviews as Interview[] || []
             } catch (error) {
                 console.log('Error fetching pagee', error);
                 const msg = axios.isAxiosError(error) ? error.response?.data.message : "Failed to fetch page"
                 toast.error(msg)
                 throw new Error(msg)
             } 
        }
    })
}