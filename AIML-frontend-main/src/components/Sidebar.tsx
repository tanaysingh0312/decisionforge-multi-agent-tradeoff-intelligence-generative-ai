import React from 'react';
import { 
  Layout, 
  BrainCircuit, 
  Compass, 
  BarChart3, 
  Sparkles, 
  Gavel,
  User
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Screen } from '../types';

interface SidebarProps {
  currentScreen: Screen;
  onScreenChange: (screen: Screen) => void;
  onForgeRequest?: () => void;
}

export default function Sidebar({ currentScreen, onScreenChange, onForgeRequest }: SidebarProps) {
  const navItems = [
    { id: 'input', label: 'Input', icon: Layout },
    { id: 'thinking', label: 'Thinking', icon: BrainCircuit },
    { id: 'explorer', label: 'Explorer', icon: Compass },
    { id: 'analysis', label: 'Analysis', icon: BarChart3 },
    { id: 'recommendation', label: 'Recommendation', icon: Sparkles },
    { id: 'audit', label: 'Audit', icon: Gavel },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-72 border-r border-outline-variant/10 bg-slate-950/60 backdrop-blur-xl z-50 flex flex-col font-headline">
      <div className="p-8">
        <h1 className="text-xl font-bold tracking-tighter text-slate-50 uppercase">DecisionForge</h1>
        <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] mt-1">Decision Intelligence v2.0</p>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => {
          const isActive = currentScreen === item.id;
          const Icon = item.icon;
          
          return (
            <button
              key={item.id}
              disabled={currentScreen === 'thinking'}
              onClick={() => onScreenChange(item.id as Screen)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group",
                isActive 
                  ? "bg-primary/10 text-primary border-r-2 border-primary" 
                  : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/40",
                currentScreen === 'thinking' && "opacity-50 cursor-not-allowed"
              )}
            >
              <Icon size={20} className={cn(isActive && "fill-primary/20")} />
              <span className="text-sm font-semibold">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-6 mt-auto border-t border-outline-variant/10">
        <div className="flex items-center gap-3 mb-6 px-2">
          <div className="w-10 h-10 rounded-full bg-surface-container-highest border border-outline-variant/30 flex items-center justify-center overflow-hidden">
            <img 
              src="https://picsum.photos/seed/executive/200/200" 
              alt="Profile" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-200">Alex Sterling</span>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider">Chief Product Officer</span>
          </div>
        </div>
        <button 
          onClick={onForgeRequest}
          disabled={currentScreen === 'thinking'}
          className={cn(
            "w-full kinetic-gradient text-on-primary font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 scale-95 active:scale-90 transition-all shadow-lg shadow-primary/20",
            currentScreen === 'thinking' && "opacity-50 cursor-not-allowed grayscale"
          )}
        >
          <span className="text-sm uppercase tracking-widest">Forge Intelligence</span>
        </button>
      </div>
    </aside>
  );
}
