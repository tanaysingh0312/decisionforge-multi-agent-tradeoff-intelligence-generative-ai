import React from 'react';
import { Search, Bell, Settings, HelpCircle } from 'lucide-react';
import { cn } from '../lib/utils';

export default function TopBar() {
  return (
    <header className="fixed top-0 left-72 right-0 h-20 flex justify-between items-center px-8 py-4 bg-slate-950/40 backdrop-blur-md z-40 border-b border-outline-variant/5">
      <div className="flex items-center gap-8">
        <nav className="flex gap-6 font-headline uppercase tracking-widest text-[10px]">
          <a href="#" className="text-slate-400 hover:text-primary transition-all">Dashboard</a>
          <a href="#" className="text-primary border-b border-primary pb-1 transition-all">Strategy</a>
          <a href="#" className="text-slate-400 hover:text-primary transition-all">Reports</a>
        </nav>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative group hidden lg:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors" size={14} />
          <input 
            type="text" 
            placeholder="SEARCH DECISION ARCHIVE..." 
            className="bg-surface-container-lowest border-none text-[10px] tracking-widest font-headline px-10 py-2 rounded-full w-64 focus:ring-1 focus:ring-primary/50 text-on-surface placeholder:text-slate-600"
          />
        </div>
        
        <div className="flex items-center gap-4 text-slate-400">
          <button className="hover:text-primary transition-all"><Bell size={18} /></button>
          <button className="hover:text-primary transition-all"><Settings size={18} /></button>
          <button className="hover:text-primary transition-all"><HelpCircle size={18} /></button>
        </div>

        <button 
          disabled={window.location.hash.includes('thinking')} // Simple hack or I prop drill
          className="kinetic-gradient text-on-primary text-[10px] font-black uppercase tracking-widest px-6 py-2 rounded-full shadow-lg shadow-primary/10 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
        >
          Execute Forge
        </button>
      </div>
    </header>
  );
}
