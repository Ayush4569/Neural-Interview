import {  MenuIcon } from 'lucide-react';
import Link from 'next/link';

import React from 'react';
import Sidebar from './sidebar';
import { Button } from './ui/button';

export function Navbar() {
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
          <Link className="hover:underline" href="/">Home</Link>
          <Link className="hover:underline" href="/interviews">Interviews</Link>
          <Link className="hover:underline" href="/pricing">Pricing</Link>
          <Link className="hover:underline" href="/about">About</Link>
        </div>

        {/* CTAs */}
        <div className="hidden md:flex ">
          <Button variant='outline' className='px-7 py-3' asChild>
          <Link
            href="/login"
            // className="rounded-lg border border-[color:var(--border)] px-3 py-2 sm:px-4 text-[color:var(--text)]"
          >
            Login
          </Link>
          </Button>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
