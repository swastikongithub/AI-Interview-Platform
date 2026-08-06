import React, { ReactNode } from 'react';
import { Navbar } from './Navbar';
import { Sparkles, Heart } from 'lucide-react';

export const Layout: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-accent/20 selection:text-text-primary">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <footer className="border-t border-border bg-background py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-muted">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent" />
            <span>Antigravity AI Interview Platform &copy; 2026. Built with Supabase & Gemini AI.</span>
          </div>
          <div className="flex items-center gap-1 text-text-muted">
            <span>Phase 0: Foundation Increment</span>
            <span className="mx-2 text-border">|</span>
            <span className="text-accent font-semibold">RLS Active</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

