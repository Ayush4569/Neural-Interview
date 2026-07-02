'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useUser } from '@/hooks/useUser';
import { useAuthStore } from '@/store/useAuthStore';
import { Loader2 } from 'lucide-react';

const protectedRoutes = ['/setup', '/myinterviews', '/interview', '/evaluation'];
const authRoutes = ['/login', '/register', '/signup'];

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isLoading } = useUser();
  const { isAuthenticated } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();

  const isProtectedRoute = protectedRoutes.some(route => pathname === route || pathname.startsWith(`${route}/`));

  useEffect(() => {
    if (!isLoading && isProtectedRoute && !isAuthenticated) {
      console.log("AuthGuard: redirecting to login");
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading, isProtectedRoute, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F1115]">
        <Loader2 className="w-10 h-10 animate-spin text-purple-500" />
      </div>
    );
  }

  if (isProtectedRoute && !isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
export  {AuthGuard};