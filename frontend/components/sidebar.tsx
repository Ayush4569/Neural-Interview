'use client';

import {
    Sheet,
    SheetContent,
    SheetTrigger,
    SheetClose,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from '@/components/ui/sheet';
import React, { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type SidebarProps = { children: ReactNode };

const nav = [
    { href: '/', label: 'Home' },
    { href: '/interviews', label: 'Interviews' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/about', label: 'About' },
];

const Sidebar = ({ children }: SidebarProps) => {
    const pathname = usePathname();

    return (
        <Sheet>
            <SheetTrigger asChild>{children}</SheetTrigger>

            <SheetContent
                side="left"
                className="
          p-0 
          w-[88vw] max-w-[360px] sm:w-[320px]
          border-r border-[color:var(--border)]
          data-[state=open]:animate-in data-[state=open]:slide-in-from-left
          data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left
          [padding-bottom:env(safe-area-inset-bottom)]
          [padding-top:env(safe-area-inset-top)]
        "
                style={{ background: 'var(--bg)', color: 'var(--text)' }}
            >
                <SheetHeader className='hidden'>
                    <SheetTitle>Navigation menu</SheetTitle>
                    <SheetDescription>Browse primary sections of the site</SheetDescription>
                </SheetHeader>
                <div className="flex items-center justify-between px-4 py-4 ">
                    <div className="font-extrabold text-lg">Neural Interview</div>
                </div>

                {/* Body */}
                <div className="flex flex-col gap-6 px-3 py-4 overflow-y-auto">
                    {/* Primary navigation */}
                    <nav className="flex flex-col">
                        {nav.map((item) => {
                            const active = pathname === item.href;
                            return (
                                <SheetClose asChild key={item.href}>
                                    <Link
                                        href={item.href}
                                        className={`
                      px-3 py-3 rounded-lg
                      text-sm sm:text-base
                      transition-colors
                      ${active
                                                ? 'bg-[color:var(--surface)] text-[color:var(--text)] border border-[color:var(--border)]'
                                                : 'text-[color:var(--text-dim)] hover:text-[color:var(--text)] hover:bg-[rgba(255,255,255,0.03)]'}
                    `}
                                    >
                                        {item.label}
                                    </Link>
                                </SheetClose>
                            );
                        })}
                    </nav>

                    {/* Secondary/help section */}
                    <div className="border-t border-[color:var(--border)] pt-4">
                        <div className="px-3 pb-2 text-xs uppercase tracking-wide text-[color:var(--text-dim)]">
                            Help
                        </div>
                        <div className="flex flex-col">
                            <SheetClose asChild>
                                <Link
                                    href="/help"
                                    className="px-3 py-3 rounded-lg text-[color:var(--text-dim)] hover:text-[color:var(--text)] hover:bg-[rgba(255,255,255,0.03)]"
                                >
                                    Help Center
                                </Link>
                            </SheetClose>
                            <SheetClose asChild>
                                <Link
                                    href="/contact"
                                    className="px-3 py-3 rounded-lg text-[color:var(--text-dim)] hover:text-[color:var(--text)] hover:bg-[rgba(255,255,255,0.03)]"
                                >
                                    Contact
                                </Link>
                            </SheetClose>
                        </div>
                    </div>
                </div>

                {/* Footer / Actions */}
                <SheetFooter className="mt-auto border-t border-[color:var(--border)] px-4 py-4">
                    <div className="flex w-full items-center justify-between gap-3">
                        <SheetClose asChild>
                            <Link
                                href="/login"
                                className="flex-1 text-center rounded-lg border border-[color:var(--border)] px-4 py-2.5 bg-amber-700"
                            >
                                Login
                            </Link>
                        </SheetClose>
                    </div>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
};

export default Sidebar;
