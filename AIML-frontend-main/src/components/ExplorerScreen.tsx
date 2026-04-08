import React from 'react';
import { Rocket, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface ExplorerScreenProps {
  data: any;
  onNextScreen?: () => void;
}

export default function ExplorerScreen({ data, onNextScreen }: ExplorerScreenProps) {
  const options = data?.stages?.stage2 || [];
  const decisionQuestion = data?.stages?.stage1?.decision_question || 'Strategy Exploration';

  return (
    <div className="p-12 max-w-7xl mx-auto w-full">
      <div className="mb-12 flex justify-between items-end">
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
        >
          <h2 className="text-4xl font-extrabold font-headline tracking-tighter text-white mb-2 uppercase">Options Explorer</h2>
          <p className="text-on-surface-variant font-sans max-w-xl leading-relaxed">
            {decisionQuestion}
          </p>
        </motion.div>
        <div className="text-right">
          <span className="text-[10px] font-headline font-bold tracking-widest text-primary uppercase">Engine Status</span>
          <div className="text-2xl font-headline font-bold text-white uppercase tracking-tight">Stage 2 Verified</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {options.map((option: any, index: number) => (
          <motion.div 
            key={option.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-panel forge-glow rounded-xl p-8 border border-outline-variant/10 transition-all duration-500 group relative hover:bg-surface-container/60"
          >
            <div className="mb-6">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-2xl font-headline font-bold text-white uppercase tracking-tight">{option.name}</h3>
                <span className="text-[10px] font-mono text-outline-variant/30">{option.id}</span>
              </div>
              <p className="text-on-surface-variant text-sm leading-relaxed">
                {option.description}
              </p>
            </div>
            <div className="flex gap-3 mb-8">
              <span className={cn(
                "px-3 py-1 text-[10px] font-headline font-bold uppercase tracking-widest rounded-full border",
                option.effort === 'High' || option.effort === 'High' 
                  ? "bg-tertiary-container/10 text-tertiary-container border-tertiary-container/20"
                  : "bg-secondary/10 text-secondary border-secondary/20"
              )}>
                Effort: {option.effort}
              </span>
              <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-headline font-bold uppercase tracking-widest rounded-full border border-primary/20">
                Impact: {option.impact}
              </span>
            </div>
            <div className="space-y-6">
              <div className="p-4 bg-surface-container-low rounded-lg border-l-2 border-secondary">
                <span className="text-[9px] font-headline font-bold tracking-widest text-secondary uppercase block mb-1">Primary Benefit</span>
                <p className="text-sm text-on-surface">{option.primary_benefit}</p>
              </div>
              <div className="p-4 bg-surface-container-low rounded-lg border-l-2 border-tertiary-container">
                <span className="text-[9px] font-headline font-bold tracking-widest text-tertiary-container uppercase block mb-1">Primary Risk</span>
                <p className="text-sm text-on-surface">{option.primary_risk}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex flex-col items-center justify-center pt-8 border-t border-slate-800/30">
        <p className="text-slate-500 text-[10px] font-headline font-bold tracking-widest uppercase mb-6">Continue to multidimensional trade-off simulation</p>
        <button 
          onClick={onNextScreen}
          className="group flex items-center gap-4 kinetic-gradient text-on-primary font-headline font-extrabold uppercase tracking-tighter px-12 py-5 rounded shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
        >
          <span>Run Trade-off Analysis</span>
          <Rocket className="transition-transform group-hover:translate-x-1" size={20} />
        </button>
      </div>
    </div>
  );
}
