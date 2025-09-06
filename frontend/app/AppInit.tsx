'use client'
import { useQuery } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { User as UserState } from "@/types/globalTypes";
import { useEffect } from "react";
import { useAuthContext } from "@/context/AuthContext";
import { toast } from "sonner";
export default function AppInit({ hasAccessToken, hasRefreshToken }:
{ hasAccessToken: boolean, hasRefreshToken: boolean }) {

    const { login, logout, setLoading } = useAuthContext();
    const query = useQuery<UserState, Error>({
        queryKey: ["user"],
        queryFn: async () => {
            const res = await axios.get(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/user`,
                {
                    withCredentials: true,
                }
            );
            return res.data.user as UserState;
        },
        retry: false,
        enabled: hasAccessToken,
        refetchOnWindowFocus: false,
    });

    useEffect(() => {
        if (query.isLoading) {
            setLoading()
        }
    }, [query.isLoading]);
    useEffect(() => {
        if (query.isError) {
            logout();
            console.error("Error fetching user:", query.error);
        }
    }, [query.isError]);
    useEffect(() => {

        if (query.data) {
            console.log("User data fetched:", query.data);
            login({...query.data})
        }
    }, [query.isSuccess, query.data]);

    useEffect(() => {
        if (!hasAccessToken && !hasRefreshToken) {
            logout()
            return;
        }
        else if(!hasAccessToken && hasRefreshToken) {
            axios
                .post(
                    `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/refresh-token`,
                    null,
                    { withCredentials: true }
                )
                .catch((error) => {
                    console.error("Refresh failed:", error);
                    logout()
                    if (error instanceof AxiosError) {
                        toast.error(error.response?.data.message);
                    } else {
                        toast.error("unexpected error ");
                    }
                });
        }
    }, [hasAccessToken, hasRefreshToken]);

    return null;
}