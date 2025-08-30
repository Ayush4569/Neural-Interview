'use client'
import { MenuIcon } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import Sidebar from './sidebar';
import Image from 'next/image';
import { Button } from './ui/button';
import { useSession } from 'next-auth/react';
import { Skeleton } from './ui/skeleton';
import { usePathname } from 'next/navigation';
import { AvatarDropDown } from '@/app/(auth)/_components/AvatarDropdown';
export function Navbar() {
  const { status, data } = useSession();
  const pathname = usePathname();
  return (
    <header className="container mx-auto px-4 sm:px-5 md:px-6">
      <nav className="sticky top-0 z-30 flex items-center justify-between py-4 md:py-6 backdrop-blur-md">
        {/* Mobile menu button */}
        <div className="md:hidden">
          <Sidebar>
            <MenuIcon
              role="button"
              className="h-6 w-6 text-muted-foreground cursor-pointer"
            />
          </Sidebar>
        </div>
        <div className="font-bold text-lg sm:text-xl">Neural Interview</div>

        {/* Desktop links */}
        <div className="hidden md:flex gap-5 lg:gap-6 text-[color:var(--text-dim)]">
          <Link className={`hover:underline transition-all duration-200 px-3 py-1 rounded-lg ${pathname === '/' ? 'bg-indigo-500/10 text-white border border-indigo-500/20' : 'text-[color:var(--text-dim)] hover:text-[color:var(--text)]'}`} href="/">Home</Link>

          <Link className={`hover:underline transition-all duration-200 px-3 py-1 rounded-lg ${pathname === '/interviews' ? 'bg-indigo-500/10 text-white border border-indigo-500/20' : 'text-[color:var(--text-dim)] hover:text-[color:var(--text)]'}`} href="/interviews">Interviews</Link>

          <Link className={`hover:underline transition-all duration-200 px-3 py-1 rounded-lg ${pathname === '/pricing' ? 'bg-indigo-500/10 text-white border border-indigo-500/20' : 'text-[color:var(--text-dim)] hover:text-[color:var(--text)]'}`} href="/pricing">Pricing</Link>

          <Link className={`hover:underline transition-all duration-200 px-3 py-1 rounded-lg ${pathname === '/about' ? 'bg-indigo-500/10 text-white border border-indigo-500/20' : 'text-[color:var(--text-dim)] hover:text-[color:var(--text)]'}`} href="/about">About</Link>

        </div>

        {/* CTAs */}
        <div className="hidden md:flex ">
          {status === "loading" && (
            <div className="flex gap-2 animate-out">
              <Skeleton className="h-[50px] w-[50px] rounded-full bg-neutral-200 dark:bg-neutral-700" />
            </div>
          )}
          {status !== "loading" && status === "unauthenticated" && (
            <Button asChild className="cursor-pointer hover:scale-120">
              <Link href="/login" className='hover:underline '>Login</Link>
            </Button>
          )}
          {status === "authenticated" && data.user.id && (
            <AvatarDropDown>
              <Image
                src={data.user.image || '/user-avatar.png'}
                alt={data.user.name || 'User Avatar'}
                height={50}
                width={50}
                priority
                className="rounded-full"
              />
            </AvatarDropDown>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
