import React, { ReactNode } from 'react';
import { Navbar } from './Navbar';
import { Sparkles, Heart } from 'lucide-react';

export const Layout: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-paper selection:bg-accent/20 selection:text-ink">
      <Navbar />
      <main className="flex-1 w-full flex flex-col items-center">
        <div className="max-w-[1440px] w-full px-4 sm:px-8 lg:px-12 py-10 md:py-16">
          {children}
        </div>
      </main>
      <footer className="border-t border-line bg-paper py-10 mt-auto">
        <div className="max-w-[1440px] w-full mx-auto px-4 sm:px-8 lg:px-12 flex flex-col sm:flex-row items-center justify-between gap-6 font-mono text-[10px] text-ink-muted uppercase tracking-widest">
          <div className="flex items-center gap-3">
            <Sparkles className="w-4 h-4 text-accent" />
            <span>Antigravity AI &copy; 2026</span>
            <span className="text-line">|</span>
            <span>Built with Supabase</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-ink-faint">Internal Portal</span>
            <span className="text-line">|</span>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              <span className="text-ink font-semibold">RLS Active</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

