'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthContext } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import axios, { AxiosError } from 'axios';
import { toast } from 'sonner';

export default function DashboardPage() {
    const { user, status,logout } = useAuthContext()
    const router = useRouter()
    const handleLogOut = async () => {
        try {
            const res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user/logout`, null, {
                withCredentials: true
            });
            if (res.data.success) {
                logout()
                toast.success("Logged out successfully.");
                router.push("/login");
            }
        } catch (error) {
            console.error("Failed to logout:", error);
            if (error instanceof AxiosError) {
                toast.error(error.response?.data.message);
            } else {
                toast.error("unexpected error ");
            }
        }
    }
    return (
        <main
            className="min-h-screen"
            style={{ background: 'var(--bg)', color: 'var(--text)' }}
        >
            {/* Top bar */}
            <div className="container mt-6 mx-auto px-4 sm:px-5 md:px-6 py-4 flex items-center justify-between">
            <span className="text-xl font-bold">Dashboard</span>

                    <Button
                        variant="outline"
                        asChild
                        className="text-white cursor-pointer hover:text-black hover:bg-white"
                    >
                        <Link href='/'>
                            Home
                        </Link>

                    </Button>
            </div>

            <section className="container mx-auto px-4 sm:px-5 md:px-6 pb-10">
                <div
                    className="mb-5 rounded-2xl border px-4 py-4 sm:px-6 sm:py-5"
                    style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
                >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-xl sm:text-2xl font-semibold">Welcome back</h1>
                            <p className="text-sm text-[color:var(--text-dim)]">
                                View your authentication details and account connections.
                            </p>
                        </div>
                        <Button
                                    className=" cursor-pointer text-center rounded-lg border border-red-600/20 px-4 py-2.5 bg-red-700/80 text-red-100 hover:bg-red-600/20 hover:text-red-300 transition-all duration-200"
                                    onClick={handleLogOut}
                                >
                                    Logout
                                </Button>
                    </div>
                </div>


                <div className="grid grid-cols-1 gap-4 sm:gap-5 md:gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Card
                        className="border"
                        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
                    >
                        <CardHeader>
                            <CardTitle>Profile</CardTitle>
                            <CardDescription className="text-[color:var(--text-dim)]">
                                Basic account information from your provider profile.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {status !== 'authenticated' ? (
                                <ProfileSkeleton />
                            ) : (
                                <>
                                    <div className="flex items-center gap-3">
                                        <AvatarBlock image={user?.avatarUrl} size="lg" />
                                        <div>
                                            <div className="text-sm text-[color:var(--text-dim)]">Name</div>
                                            <div className="font-medium">{user?.username ?? '—'}</div>
                                        </div>
                                    </div>
                                    <Separator className="bg-[color:var(--border)]" />
                                    <div>
                                        <div className="text-sm text-[color:var(--text-dim)]">Email</div>
                                        <div className="font-medium break-all">{user?.email ?? '—'}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-[color:var(--text-dim)]">User ID</div>
                                        <div className="font-medium text-sm">{user?.id}</div>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>

            </section>
        </main>
    );
}

function AvatarBlock({
    image,
    size = 'md',
}: {
    image?: string | null;
    size?: 'md' | 'lg';
}) {
    const dim = size === 'lg' ? 56 : 40;
    return (
        <div className="flex items-center gap-3">
            <Image
                src={image || '/user-avatar.png'}
                alt='Avatar'
                width={dim}
                height={dim}
                className="rounded-full object-cover"
            />
        </div>
    );
}

function ProfileSkeleton() {
    return (
        <div className="space-y-3">
            <div className="flex items-center gap-3">
                <Skeleton className="h-14 w-14 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-4 w-28" />
                </div>
            </div>
            <Separator className="bg-[color:var(--border)]" />
            <Skeleton className="h-4 w-3/4" />
            <div className="grid grid-cols-2 gap-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
            </div>
        </div>
    );
}

