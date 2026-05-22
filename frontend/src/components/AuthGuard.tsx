'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useUser } from '@/hooks/useUser';
import { Loader2 } from 'lucide-react';

const protectedRoutes = ['/setup', '/myinterviews', '/interview', '/evaluation'];
const authRoutes = ['/login', '/register', '/signup'];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading } = useUser();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const isProtectedRoute = protectedRoutes.some(route => pathname === route || pathname.startsWith(`${route}/`));
    const isAuthRoute = authRoutes.some(route => pathname === route || pathname.startsWith(`${route}/`));

    if (!user && isProtectedRoute) {
      router.push('/login');
    } else if (user && isAuthRoute) {
      router.push('/');
    }
  }, [user, isLoading, pathname, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F1115]">
        <Loader2 className="w-10 h-10 animate-spin text-purple-500" />
      </div>
    );
  }

  const isProtectedRoute = protectedRoutes.some(route => pathname === route || pathname.startsWith(`${route}/`));
  if (isProtectedRoute && !user) {
      return null;
  }

  return <>{children}</>;
}
