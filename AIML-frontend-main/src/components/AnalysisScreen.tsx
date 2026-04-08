import React from 'react';
import { Rocket, List, ArrowRight, AlertTriangle, BrainCircuit } from 'lucide-react';
import { motion } from 'motion/react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { cn } from '../lib/utils';

interface AnalysisScreenProps {
  data: any;
  onNextScreen?: () => void;
}

export default function AnalysisScreen({ data, onNextScreen }: AnalysisScreenProps) {
  const stage1 = data?.stages?.stage1 || {};
  const stage2 = data?.stages?.stage2 || [];
  const stage3 = data?.stages?.stage3 || { scores: {}, reasoning: {}, constraint_violations: {} };
  const computedScores = data?.metadata?.computed_scores || {};
  
  const objectives = stage1.objectives || [];
  
  // Transform data for Recharts Radar
  const radarData = objectives.map((obj: any) => {
    const entry: any = { subject: typeof obj === 'string' ? obj : obj.name };
    stage2.forEach((opt: any, idx: number) => {
      const key = String.fromCharCode(65 + idx); // A, B, C...
      entry[key] = stage3.scores[opt.id]?.[entry.subject] * 10 || 0; // Scale 1-10 to 1-100
    });
    return entry;
  });

  const recommendedId = data?.stages?.stage4?.recommended_option_id;

  return (
    <div className="max-w-7xl mx-auto space-y-8 py-8">
      <div className="flex justify-between items-end">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h2 className="text-4xl font-extrabold font-headline tracking-tighter text-on-surface uppercase italic">Trade-off Intelligence</h2>
          <p className="text-on-surface-variant font-headline tracking-wide uppercase text-xs mt-2">Comparative Matrix & Hybrid Neural Synthesis</p>
        </motion.div>
        <button 
          onClick={onNextScreen}
          className="kinetic-gradient text-on-primary px-6 py-3 rounded-lg font-bold text-sm flex items-center gap-2 forge-glow hover:opacity-90 transition-all uppercase tracking-widest italic"
        >
          <span>View Recommendation</span>
          <ArrowRight size={16} />
        </button>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="col-span-12 lg:col-span-8 bg-surface-container rounded-xl overflow-hidden border border-outline-variant/10"
        >
          <div className="p-8 border-b border-outline-variant/10 flex justify-between items-center">
            <h3 className="font-headline font-bold text-lg tracking-tight uppercase">Option Viability Matrix</h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_8px_rgba(78,222,163,0.5)]"></div>
                <span className="text-[10px] font-headline uppercase text-on-surface-variant">Top Tier</span>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low/50">
                  <th className="px-8 py-5 text-[10px] font-headline uppercase tracking-widest text-on-surface-variant">Strategic Option</th>
                  {objectives.map((obj: any, i: number) => (
                    <th key={i} className="px-6 py-5 text-[10px] font-headline uppercase tracking-widest text-on-surface-variant whitespace-nowrap">
                       {typeof obj === 'string' ? obj : obj.name}
                    </th>
                  ))}
                  <th className="px-6 py-5 text-[10px] font-headline uppercase tracking-widest text-primary italic">Hybrid Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {stage2.map((option: any) => (
                  <tr key={option.id} className={cn("group hover:bg-surface-container-high/50 transition-colors relative", recommendedId === option.id && "bg-primary/5")}>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className={cn("p-2 rounded-lg", recommendedId === option.id ? "bg-primary/20" : "bg-surface-container-highest")}>
                          {recommendedId === option.id ? <Rocket size={18} className="text-primary" /> : <List size={18} className="text-on-surface-variant" />}
                        </div>
                        <div>
                          <p className="font-bold text-on-surface uppercase tracking-tight">{option.name}</p>
                          {recommendedId === option.id && <p className="text-[9px] text-secondary font-black tracking-widest">FORGE RECOMMENDED</p>}
                        </div>
                      </div>
                      {recommendedId === option.id && <div className="absolute inset-y-0 left-0 w-1 kinetic-gradient"></div>}
                    </td>
                    {objectives.map((obj: any, i: number) => {
                       const score = stage3.scores[option.id]?.[typeof obj === 'string' ? obj : obj.name] || 0;
                       return (
                        <td key={i} className="px-6 py-6">
                          <div className={cn("w-10 h-10 rounded-xl border flex items-center justify-center font-bold text-sm transition-all group-hover:scale-110", 
                            score >= 8 ? "border-secondary/30 text-secondary bg-secondary/10 shadow-[0_0_10px_rgba(78,222,163,0.2)]" : 
                            score <= 4 ? "border-error/30 text-error bg-error/10" : 
                            "border-primary/30 text-primary bg-primary/10")}>
                            {score}
                          </div>
                        </td>
                       );
                    })}
                    <td className="px-6 py-6">
                       <span className="text-lg font-black text-white font-mono">{computedScores[option.id] || 0}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="col-span-12 lg:col-span-4 glass-panel rounded-xl border border-outline-variant/10 p-8 flex flex-col items-center justify-center relative overflow-hidden"
        >
          <div className="absolute inset-0 opacity-10 [background-image:radial-gradient(circle,#464554_1px,transparent_1px)] [background-size:30px_30px]"></div>
          <div className="relative z-10 w-full text-center space-y-6">
            <h3 className="font-headline font-bold text-lg tracking-tight uppercase">Equilibrium Analysis</h3>
            
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="#464554" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#908fa0', fontSize: 10 }} />
                  {stage2.map((opt: any, i: number) => (
                    <Radar 
                      key={opt.id}
                      name={opt.name} 
                      dataKey={String.fromCharCode(65 + i)} 
                      stroke={i === 0 ? "#c0c1ff" : i === 1 ? "#4edea3" : "#ff516a"} 
                      fill={i === 0 ? "#c0c1ff" : i === 1 ? "#4edea3" : "#ff516a"} 
                      fillOpacity={0.2} 
                    />
                  ))}
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 gap-2 text-left">
              {stage2.map((opt: any, i: number) => (
                <div key={opt.id} className="flex items-center justify-between p-2.5 bg-surface-container-high/50 rounded border border-outline-variant/10">
                  <div className="flex items-center gap-2">
                    <div className={cn("w-2 h-2 rounded-sm", i === 0 ? "bg-primary" : i === 1 ? "bg-secondary" : "bg-error")}></div>
                    <span className="text-[10px] font-bold text-on-surface uppercase truncate max-w-[120px]">{opt.name}</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-on-surface-variant truncate ml-2">SCORE: {computedScores[opt.id] || 0}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="col-span-12 lg:col-span-12 bg-surface-container rounded-xl p-10 flex flex-col md:flex-row gap-12 border border-outline-variant/5"
        >
          <div className="md:w-1/3 space-y-4">
            <h4 className="font-headline font-bold text-xl uppercase italic tracking-tighter">Strategic Context</h4>
            <p className="text-on-surface-variant leading-relaxed text-sm italic">
              Integrating multi-variant simulations and stakeholder weights into a cohesive trade-off map. Systemic risks highlighted per strategy trajectory.
            </p>
          </div>
          <div className="md:w-2/3 grid grid-cols-2 gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-primary">
                <AlertTriangle size={16} />
                <span className="text-[10px] font-headline uppercase tracking-widest font-black">Identified Gaps</span>
              </div>
              <ul className="space-y-2">
                 {data?.stages?.stage5?.missing_considerations?.slice(0, 2).map((gap: string, i: number) => (
                   <li key={i} className="flex items-center justify-between text-xs p-3 bg-surface-container-low rounded">
                     <span className="text-on-surface-variant italic">"{gap}"</span>
                   </li>
                 ))}
              </ul>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-secondary">
                <BrainCircuit size={16} />
                <span className="text-[10px] font-headline uppercase tracking-widest font-black">AI Audit Insight</span>
              </div>
              <div className="p-4 bg-surface-container-low rounded italic text-xs text-on-surface-variant leading-relaxed border-l-2 border-secondary/30">
                "{data?.stages?.stage5?.robustness_analysis}"
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
