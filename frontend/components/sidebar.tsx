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
import { signOut, useSession } from 'next-auth/react';
import { ChevronsLeft } from 'lucide-react';

type SidebarProps = { children: ReactNode };

const nav = [
    { href: '/', label: 'Home' },
    { href: '/interviews', label: 'Interviews' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/about', label: 'About' },
];

const Sidebar = ({ children }: SidebarProps) => {
    const pathname = usePathname();
    const session = useSession()
    return (
        <Sheet>
            <SheetTrigger asChild>{children}</SheetTrigger>

            <SheetContent
                side="left"
                className="p-0 w-[88vw] max-w-[360px] sm:w-[320px] border-r border-[color:var(--border)] [&>button:last-child]:hidden"
                style={{ background: 'var(--bg)', color: 'var(--text)' }}
            >
                <SheetHeader className='hidden '>
                    <SheetTitle>Navigation menu</SheetTitle>
                    <SheetDescription>Browse primary sections of the site</SheetDescription>
                </SheetHeader>
                <div className="flex items-center justify-between px-4 py-4 ">
                    <h1 className="font-extrabold text-lg">Neural Interview</h1>
                    <SheetClose asChild>
                        <ChevronsLeft className="rounded-md h-7 w-7 text-muted-foreground hover:bg-primary/5 dark:bg-neutral-600 transition cursor-pointer"
                            aria-label="Close sidebar"
                        />
                    </SheetClose>
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
                </div>

                {/* Footer / Actions */}
                <SheetFooter className="mt-auto border-t border-[color:var(--border)] px-4 py-4">
                    <div className="flex w-full items-center justify-between gap-3">
                        <SheetClose asChild>

                            <Link
                                href="/login"
                                onClick={() => signOut({ callbackUrl: '/' })}
                                className="flex-1 text-center rounded-lg border border-[color:var(--border)] px-4 py-2.5 bg-amber-700"
                            >
                                Logout
                            </Link>
                        </SheetClose>
                        {
                            session.status === 'authenticated' && (
                                <SheetClose asChild>
                                    <Link
                                        href="/profile"
                                        className="flex-1 text-center rounded-lg border border-[color:var(--border)] px-4 py-2.5 bg-white text-black"
                                    >
                                        Profile
                                    </Link>
                                </SheetClose>
                            )
                        }
                    </div>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
};

export default Sidebar;
