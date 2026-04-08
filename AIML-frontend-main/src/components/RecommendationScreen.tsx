import React from 'react';
import { Verified, ArrowRight, AlertTriangle, Database, Clock, Info, BrainCircuit } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface RecommendationScreenProps {
  data: any;
}

export default function RecommendationScreen({ data }: RecommendationScreenProps) {
  const stage2 = data?.stages?.stage2 || [];
  const stage4 = data?.stages?.stage4 || { risks: [] };
  const stage5 = data?.stages?.stage5 || {};

  const recommended = stage2.find((o: any) => o.id === stage4.recommended_option_id);
  const runnerUp = stage2.find((o: any) => o.id === stage4.runner_up_option_id);

  return (
    <div className="max-w-[1400px] mx-auto py-8">
      <div className="grid grid-cols-12 gap-6 items-stretch">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="col-span-12 lg:col-span-8 bg-surface-container-low rounded-xl p-8 forge-glow relative overflow-hidden group border border-outline-variant/10"
        >
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <Verified size={120} className="text-primary" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <span className="bg-secondary/10 text-secondary text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-secondary/20">Optimal Path</span>
              <span className="text-slate-500 text-xs font-headline uppercase tracking-widest uppercase italic">Forge Decision Directive</span>
            </div>
            <h2 className="text-5xl font-extrabold font-headline tracking-tighter text-slate-50 mb-4 max-w-2xl uppercase italic leading-none">{recommended?.name || 'Loading Recommendation...'}</h2>
            <p className="text-xl text-on-surface-variant font-light leading-relaxed mb-8 max-w-3xl italic">
              "{stage4.recommendation_justification}"
            </p>
            <div className="flex items-center gap-12 pt-8 border-t border-outline-variant/10">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 font-headline uppercase tracking-widest mb-1">CPO Confidence</span>
                <span className="text-2xl font-black text-secondary">{stage4.confidence_score}%</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 font-headline uppercase tracking-widest mb-1">Reasoning Quality</span>
                <span className="text-2xl font-black text-primary">{stage5.reasoning_quality_score}/100</span>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="col-span-12 lg:col-span-4 bg-surface-container rounded-xl p-8 flex flex-col items-center justify-center text-center border border-outline-variant/5"
        >
          <span className="text-[10px] text-slate-500 font-headline uppercase tracking-[0.3em] mb-8">Model Verdict</span>
          <div className="relative flex items-center justify-center mb-6">
            <svg className="w-48 h-48 -rotate-90">
              <circle className="text-slate-800" cx="96" cy="96" fill="transparent" r="88" stroke="currentColor" strokeWidth="8"></circle>
              <motion.circle 
                initial={{ strokeDashoffset: 552.92 }}
                animate={{ strokeDashoffset: 552.92 - (552.92 * (stage4.confidence_score / 100)) }}
                transition={{ duration: 2, ease: "easeOut" }}
                className="text-secondary" 
                cx="96" cy="96" fill="transparent" r="88" stroke="currentColor" strokeDasharray="552.92" strokeWidth="8" style={{ strokeLinecap: 'round' }}
              ></motion.circle>
            </svg>
            <div className="absolute flex flex-col items-center inset-0 justify-center">
              <span className="text-6xl font-black font-headline text-slate-50 leading-none">{stage4.confidence_score}</span>
              <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">Confidence</span>
            </div>
          </div>
          <div className="p-4 bg-surface-container-highest/50 rounded-lg w-full italic">
            <p className="text-xs text-slate-400 leading-snug">"{stage4.confidence_explanation}"</p>
          </div>
        </motion.div>

        <div className="col-span-12 lg:col-span-6 flex flex-col gap-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Strategic Criticalities</h3>
          </div>
          <div className="space-y-3">
            {stage4.risks.map((risk: any, i: number) => (
              <div key={i} className="p-5 bg-surface-container rounded-xl flex items-center justify-between border-l-4 border-tertiary-container hover:bg-surface-container-high transition-colors">
                <div className="flex items-center gap-4">
                  <div className="bg-tertiary-container/10 p-2 rounded-lg">
                    <AlertTriangle className="text-tertiary-container" size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-200 uppercase tracking-tight">{risk.title}</h4>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest">Severity Assessment: High Accuracy</p>
                  </div>
                </div>
                <span className={cn(
                  "px-3 py-1 text-[9px] font-black rounded uppercase tracking-widest",
                  risk.severity === 'High' ? "bg-tertiary-container text-on-tertiary-container" : "bg-primary/20 text-primary border border-primary/40"
                )}>
                  {risk.severity}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-12 lg:col-span-6 bg-surface-container rounded-xl p-8 border border-outline-variant/5">
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-6 font-headline tracking-[0.2em]">Alternate Strategic Vector</h3>
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xl font-black text-slate-200 uppercase italic tracking-tight">{runnerUp?.name || 'N/A'}</span>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Contingency Option</span>
            </div>
          </div>
          <div className="bg-surface-container-low p-6 rounded-lg border-l-4 border-primary relative overflow-hidden">
            <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-4">The Pivot Logic</h4>
            <p className="text-sm text-slate-300 leading-relaxed italic">
              "{stage4.runner_up_conditions}"
            </p>
          </div>
        </div>

        <div className="col-span-12 mt-4">
          <div className="glass-panel rounded-2xl p-10 border border-outline-variant/10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12 border-b border-outline-variant/10 pb-10">
              <div>
                <h2 className="text-3xl font-black font-headline text-slate-50 tracking-tight uppercase italic">Synthesized Executive Summary</h2>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Strategic Narrative</h4>
                <p className="text-on-surface-variant font-light leading-loose text-lg italic pr-10">
                   "{stage4.executive_summary}"
                </p>
              </div>
              <div className="space-y-12">
                 <div className="space-y-6">
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">AI Auditor Verdict</h4>
                    <div className="p-6 bg-primary/5 rounded border border-primary/20 space-y-4">
                        <div className="flex items-center gap-4">
                            <BrainCircuit className="text-primary" />
                            <span className="text-sm font-bold text-slate-200 uppercase tracking-widest leading-none">Decision Robustness Verified</span>
                        </div>
                        <p className="text-xs text-on-surface-variant italic leading-relaxed">
                            "{stage5.decision_trace_summary}"
                        </p>
                    </div>
                 </div>
                 <div className="space-y-6">
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Potential Biases Filtered</h4>
                    <div className="flex flex-wrap gap-2">
                        {stage5.detected_biases?.map((bias: string, i: number) => (
                           <span key={i} className="px-3 py-1.5 bg-surface-container-highest rounded text-[10px] font-bold text-slate-400 uppercase tracking-widest border border-outline-variant/10">
                              {bias}
                           </span>
                        ))}
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
