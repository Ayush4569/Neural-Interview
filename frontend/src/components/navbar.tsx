'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Zap, LogOut, Menu, X } from "lucide-react";
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
      router.replace('/login');
    } catch (error) {
      console.error(error);
    }
  };

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Pricing', href: '#' },
  ];

  if (pathname.includes('/interview/')) return null;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-800 bg-[#0F1115]/90 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex flex-col justify-center">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
              <Zap className="h-5 w-5 text-indigo-400" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              PrepWise
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <div className="flex items-center gap-6">
              {navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  href={link.href}
                  className={`text-sm font-medium transition-colors hover:text-white ${
                    pathname === link.href ? 'text-white' : 'text-gray-400'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              {isAuthenticated && (
                <Link 
                  href="/myinterviews"
                  className={`text-sm font-medium transition-colors hover:text-white ${
                    pathname === '/myinterviews' ? 'text-white' : 'text-gray-400'
                  }`}
                >
                  Dashboard
                </Link>
              )}
            </div>

            <div className="h-6 w-px bg-gray-800" />

            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleLogout}
                  className="text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                >
                  <LogOut className="h-4 w-4 mr-2" /> Logout
                </Button>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white hover:bg-[#1A1D24]">Log in</Button>
                  </Link>
                  <Link href="/setup">
                    <Button size="sm" className="bg-gradient-to-r from-purple-400 to-pink-500 text-black border-0 hover:opacity-90 font-medium font-semibold">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
          <div className="md:hidden bg-[#0F1115] border-b border-gray-800 px-4 py-6 flex flex-col gap-4 absolute w-full left-0">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className="text-lg font-medium text-gray-300 hover:text-white transition-colors"
              >
                {link.name}
              </Link>
            ))}
            {isAuthenticated && (
              <Link 
                href="/myinterviews"
                onClick={() => setIsMenuOpen(false)}
                className="text-lg font-medium text-gray-300 hover:text-white transition-colors"
              >
                Dashboard
              </Link>
            )}
            <div className="h-px w-full bg-gray-800 my-2" />
            {isAuthenticated ? (
              <Button 
                variant="destructive" 
                onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                className="w-full justify-start bg-red-500/10 text-red-500 border-0"
              >
                <LogOut className="h-4 w-4 mr-2" /> Logout
              </Button>
            ) : (
              <div className="flex flex-col gap-3">
                <Link href="/login" onClick={() => setIsMenuOpen(false)} className="w-full">
                  <Button variant="outline" className="w-full bg-[#1A1D24] border-gray-700 text-white">Log in</Button>
                </Link>
                <Link href="/setup" onClick={() => setIsMenuOpen(false)} className="w-full">
                  <Button className="w-full bg-gradient-to-r from-purple-400 to-pink-500 text-black border-0 font-medium">Get Started</Button>
                </Link>
              </div>
            )}
          </div>
      )}
    </nav>
  );
}
