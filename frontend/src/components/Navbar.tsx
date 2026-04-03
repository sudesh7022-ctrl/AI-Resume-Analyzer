'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Sparkles, Settings, LogOut, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  return (
    <nav className="w-full bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 z-50 sticky top-0">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="p-1.5 bg-blue-600 rounded-lg text-white group-hover:bg-blue-700 transition-colors shadow-sm">
              <Sparkles size={18} />
            </div>
            <span className="font-black text-xl tracking-tight text-slate-900 dark:text-white">
              VRIF <span className="text-blue-600">AI</span>
            </span>
          </Link>

          <div className="flex items-center gap-6 font-medium text-sm text-slate-600">
            {user ? (
              <>
                <Link href="/jobs" className="hover:text-blue-600 transition-colors">
                  Jobs Board
                </Link>
                <Link href="/history" className="hover:text-blue-600 transition-colors">
                  History
                </Link>
                <div className="flex items-center gap-4 border-l border-slate-200 pl-6">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center text-white font-bold shadow-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-semibold text-slate-800">{user.name}</span>
                  </div>
                  <button onClick={logout} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Logout">
                    <LogOut size={18} />
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link href="/auth" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-bold">
                  Sign In
                </Link>
                <Link href="/auth" className="bg-slate-900 dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white text-white px-4 py-2 rounded-lg font-bold transition-all shadow-md">
                  Get Started
                </Link>
              </>
            )}
            
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Sun size={20} className="hidden dark:block text-slate-300 hover:text-white" />
              <Moon size={20} className="block dark:hidden text-slate-600 hover:text-slate-900" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
