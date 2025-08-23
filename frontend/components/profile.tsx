'use client';

import { useSession, signOut } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
    const { data: session, status } = useSession();
    const user = session?.user;

    return (
        <main
            className="min-h-screen"
            style={{ background: 'var(--bg)', color: 'var(--text)' }}
        >
            {/* Top bar */}
            <div className="container mx-auto px-4 sm:px-5 md:px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ background: 'var(--mint)' }} />
                    <span className="text-sm text-[color:var(--text-dim)]">Dashboard</span>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        asChild
                        className="text-white cursor-pointer hover:text-black hover:bg-white"
                    >
                        <Link href='/'>
                            Home
                        </Link>

                    </Button>
                    <Button
                        variant="outline"
                        className="text-white cursor-pointer hover:text-black hover:bg-white"
                        onClick={() => signOut({ callbackUrl: '/' })}
                    >
                        Sign out
                    </Button>
                </div>
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
                        {status === 'authenticated' ? (
                            <div className="flex items-center gap-3">
                                <AvatarBlock name={user?.name} image={user?.image} />
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <Skeleton className="h-4 w-28" />
                            </div>
                        )}
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
                                        <AvatarBlock name={user?.name} image={user?.image} size="lg" />
                                        <div>
                                            <div className="text-sm text-[color:var(--text-dim)]">Name</div>
                                            <div className="font-medium">{user?.name ?? '—'}</div>
                                        </div>
                                    </div>
                                    <Separator className="bg-[color:var(--border)]" />
                                    <div>
                                        <div className="text-sm text-[color:var(--text-dim)]">Email</div>
                                        <div className="font-medium break-all">{user?.email ?? '—'}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-[color:var(--text-dim)]">User ID</div>
                                        <div className="font-medium text-sm">{user?.id ?? '—'}</div>
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

/* ---------- UI helpers ---------- */

function AvatarBlock({
    name,
    image,
    size = 'md',
}: {
    name?: string | null;
    image?: string | null;
    size?: 'md' | 'lg';
}) {
    const dim = size === 'lg' ? 56 : 40;
    return (
        <div className="flex items-center gap-3">
            {image ? (
                <Image
                    src={image}
                    alt={name ?? 'Avatar'}
                    width={dim}
                    height={dim}
                    className="rounded-full object-cover"
                />
            ) : (
                <div
                    className="rounded-full grid place-items-center"
                    style={{
                        width: dim,
                        height: dim,
                        background: 'rgba(255,255,255,0.08)',
                        border: '1px solid var(--border)',
                        color: 'var(--text)',
                    }}
                >
                    <span className="text-sm">{name}</span>
                </div>
            )}
            {size === 'lg' ? null : <div className="text-sm">{name ?? '—'}</div>}
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


