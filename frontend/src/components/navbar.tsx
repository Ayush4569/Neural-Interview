'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Zap, LogOut, LayoutDashboard, Menu, X } from "lucide-react";
import api from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await api.get('/user/auth/logout');
      useAuthStore.getState().clearUser();
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error(error);
    }
  };

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Pricing', href: '#' },
    { name: 'About', href: '#' },
  ];

  if (pathname.includes('/interview/')) return null;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 glassmorphism">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="p-1.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
            <Zap className="h-6 w-6 text-primary fill-primary/20" />
          </div>
          <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent premium-gradient">
            Neural Interview
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <div className="flex items-center gap-6">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname === link.href ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {link.name}
              </Link>
            ))}
            {isAuthenticated && (
              <Link 
                href="/myinterviews"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname === '/myinterviews' ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                Dashboard
              </Link>
            )}
          </div>

          <div className="h-6 w-px bg-white/10" />

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLogout}
                className="text-destructive hover:bg-destructive/10"
              >
                <LogOut className="h-4 w-4 mr-2" /> Logout
              </Button>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">Log in</Button>
                </Link>
                <Link href="/setup">
                  <Button size="sm" className="premium-gradient border-0 text-white shadow-lg">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden p-2 text-muted-foreground hover:text-primary transition-colors"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Navigation */}
        {isMenuOpen && (
            <div className="container mx-auto px-4 py-6 flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="text-lg font-medium hover:text-primary transition-colors"
                >
                  {link.name}
                </Link>
              ))}
              {isAuthenticated && (
                <Link 
                  href="/myinterviews"
                  onClick={() => setIsMenuOpen(false)}
                  className="text-lg font-medium hover:text-primary transition-colors"
                >
                  Dashboard
                </Link>
              )}
              <div className="h-px w-full bg-white/10 my-2" />
              {isAuthenticated ? (
                <Button 
                  variant="destructive" 
                  onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                  className="w-full justify-start"
                >
                  <LogOut className="h-4 w-4 mr-2" /> Logout
                </Button>
              ) : (
                <div className="flex flex-col gap-3">
                  <Link href="/login" onClick={() => setIsMenuOpen(false)} className="w-full">
                    <Button variant="outline" className="w-full">Log in</Button>
                  </Link>
                  <Link href="/setup" onClick={() => setIsMenuOpen(false)} className="w-full">
                    <Button className="w-full premium-gradient border-0 text-white">Get Started</Button>
                  </Link>
                </div>
              )}
            </div>
        )}
    </nav>
  );
}
