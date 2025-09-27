import { Interview } from "@/types/globalTypes";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { usePathname } from "next/navigation";
import { toast } from "sonner";

export const useGetInterviewById = ({id}:{id:string}) => {
   const pathname = usePathname();
   return useQuery<Interview,Error>({
        queryKey:["interview",id],
        staleTime: 5*60*1000,
        retry:false,
        refetchInterval:4*60*1000,
        refetchOnWindowFocus:false,
        enabled:pathname.startsWith('/interviews/'+id),
        queryFn:async()=>{
            try {
                const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/interview/${id}`,{
                    withCredentials: true
                });
                return res.data.interview as Interview
             } catch (error) {
                 console.log('Error fetching interview', error);
                 const msg = axios.isAxiosError(error) ? error.response?.data.message : "Failed to load interview"
                 toast.error(msg)
                 throw new Error(msg)
             } 
        }
    })
}