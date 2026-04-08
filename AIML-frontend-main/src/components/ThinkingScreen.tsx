import React, { useEffect, useState, useRef } from 'react';
import { CheckCircle2, BrainCircuit, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { startAnalysis, getStatus } from '../lib/api';
import { DecisionData } from '../types';

interface ThinkingScreenProps {
  decisionData: DecisionData | null;
  onComplete: (result: any) => void;
  onSessionStart: (sessionId: string) => void;
}

export default function ThinkingScreen({ decisionData, onComplete, onSessionStart }: ThinkingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('Initializing...');
  const [error, setError] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(1);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Use a ref for progress to avoid stale closure issues in the setInterval
  const progressRef = useRef(0);
  const startedRef = useRef(false);

  useEffect(() => {
    let isMounted = true;
    if (!decisionData || startedRef.current) return;
    startedRef.current = true;

    const runForge = async () => {
      try {
        const payload = {
          scenario: decisionData.scenario,
          constraints: decisionData.constraints.map(c => c.label),
          objectives: decisionData.objectives.map(o => ({
            name: o.label,
            weight: o.weight / 100 
          }))
        };

        const { session_id } = await startAnalysis(payload);
        if (!isMounted) return; // Discard if unmounted during await
        
        onSessionStart(session_id);

        let finished = false;
        pollingRef.current = setInterval(async () => {
          if (finished || !isMounted) return;
          try {
            const data = await getStatus(session_id);
            if (finished || !isMounted) return;

            // Only update if progress is strictly increasing
            if (data.progress > progressRef.current) {
              progressRef.current = data.progress;
              setProgress(data.progress);
            }
            
            setStatus(data.current_stage || 'Processing...');

            if (data.progress > 75) setActiveStep(4);
            else if (data.progress > 50) setActiveStep(3);
            else if (data.progress > 25) setActiveStep(2);

            if (data.status === 'completed') {
              finished = true;
              if (pollingRef.current) clearInterval(pollingRef.current);
              setTimeout(() => { if (isMounted) onComplete(data); }, 1000);
            } else if (data.status === 'failed') {
              finished = true;
              if (pollingRef.current) clearInterval(pollingRef.current);
              if (isMounted) setError(data.error || 'The Forge process failed.');
            }
          } catch (err: any) {
            console.error("Polling error:", err);
            finished = true;
            if (pollingRef.current) clearInterval(pollingRef.current);
            if (isMounted) setError(err.message || 'Connection lost to the Forge engine.');
          }
        }, 1500);

      } catch (err: any) {
        if (!isMounted) return;
        setError(err.message || 'Could not connect to the Forge engine.');
      }
    };

    runForge();

    return () => {
      isMounted = false;
      startedRef.current = false;
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [decisionData]);

  const steps = [
    { id: 1, title: 'Decomposing Problem', status: activeStep > 1 ? 'complete' : 'active', desc: 'Identifying core variables and mapping stakeholders.' },
    { id: 2, title: 'Generating Strategies', status: activeStep > 2 ? 'complete' : activeStep === 2 ? 'active' : 'queued', desc: 'Synthesizing strategic options via neural pathways...' },
    { id: 3, title: 'Evaluating Trade-offs', status: activeStep > 3 ? 'complete' : activeStep === 3 ? 'active' : 'queued', desc: 'Modeling multidimensional risk and ROI vectors.' },
    { id: 4, title: 'Synthesizing Recommendation', status: activeStep === 4 ? 'active' : 'queued', desc: 'Compiling the final Executive Decision Report.' },
  ];

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-6">
        <div className="p-4 bg-error/10 rounded-full">
          <AlertCircle size={48} className="text-error" />
        </div>
        <h2 className="text-3xl font-headline font-bold text-slate-50 uppercase">Forge Failure</h2>
        <p className="text-on-surface-variant max-w-md">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-8 py-3 bg-primary text-on-primary rounded font-headline font-bold uppercase tracking-widest hover:scale-105 transition-transform"
        >
          Retry Engine
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8">
      <div className="mb-12 max-w-5xl">
        <span className="text-primary font-headline text-xs tracking-[0.2em] uppercase">Phase: Strategy Synthesis</span>
        <h2 className="text-5xl font-headline font-extrabold text-on-surface mt-2 tracking-tight leading-tight uppercase">
          Architecting Your <br/><span className="text-transparent bg-clip-text kinetic-gradient">Strategic Framework</span>
        </h2>
        <p className="text-on-surface-variant text-lg mt-6 max-w-2xl leading-relaxed italic border-l-2 border-primary/20 pl-6">
          "Current Activity: {status}"
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-1 mb-16">
        {steps.map((step) => (
          <div 
            key={step.id} 
            className={cn(
              "relative p-6 border-r border-outline-variant/10 transition-all duration-500",
              step.status === 'queued' ? "bg-surface-container-low opacity-50" : "bg-surface-container-high"
            )}
          >
            <div className="flex items-center gap-3 mb-4">
              {step.status === 'complete' ? (
                <CheckCircle2 size={16} className="text-secondary fill-secondary/20" />
              ) : step.status === 'active' ? (
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(128,131,255,1)]" />
              ) : (
                <div className="w-2 h-2 rounded-full bg-outline-variant" />
              )}
              <span className={cn(
                "text-[9px] font-headline tracking-[0.2em] uppercase",
                step.status === 'complete' ? "text-secondary" : step.status === 'active' ? "text-primary" : "text-outline-variant"
              )}>
                {step.status}
              </span>
            </div>
            <h4 className={cn("font-headline text-lg font-bold tracking-tight uppercase", step.status === 'active' ? "text-primary" : "text-on-surface")}>
              0{step.id}. {step.title}
            </h4>
            <p className="text-[11px] text-on-surface-variant mt-3 leading-relaxed">{step.desc}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-6 items-start">
        <div className="col-span-12 lg:col-span-8 glass-panel rounded-xl overflow-hidden min-h-[400px] relative flex items-center justify-center border border-outline-variant/10">
          <div className="absolute inset-0 bg-[radial-gradient(#2f2ebe_1px,transparent_1px)] [background-size:40px_40px] opacity-10"></div>
          
          <div className="relative z-10 text-center space-y-8">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 relative"
            >
              <div className="absolute inset-0 rounded-full border border-primary opacity-20 animate-ping" />
              <BrainCircuit size={40} className="text-primary" />
            </motion.div>
            
            <div className="space-y-2">
              <div className="text-[10px] font-headline uppercase tracking-[0.4em] text-primary">Forge-Engine Latency</div>
              <div className="text-3xl font-headline font-black text-white italic">0.24ms</div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 glass-panel p-6 border-t border-outline-variant/10">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-headline uppercase text-primary tracking-widest">Real-time Reasoning Stream</span>
              <span className="text-[10px] font-headline text-on-surface-variant uppercase tracking-tighter">Status: {status}</span>
            </div>
            <p className="text-xs text-on-surface-variant italic font-sans max-w-xl">
              Analyzing multidimensional trade-offs under user-defined constraints. Hybrid intelligence scoring engine active...
            </p>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 glass-panel p-8 rounded-xl border-l-4 border-primary">
            <h5 className="text-[10px] font-headline uppercase tracking-widest text-on-surface-variant mb-6">Neural Engine Load</h5>
            <div className="space-y-8">
              <div>
                <div className="flex justify-between text-[11px] mb-3 uppercase tracking-widest">
                  <span className="text-on-surface">Cognitive Throughput</span>
                  <span className="text-primary font-bold">{progress}%</span>
                </div>
                <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-primary shadow-[0_0_15px_rgba(128,131,255,0.5)]"
                  />
                </div>
              </div>
              <div className="p-4 bg-primary/5 rounded border border-primary/10 italic text-xs text-on-surface-variant">
                "The system is currently simulating your specific constraints against the Q3-Q4 strategic horizon."
              </div>
            </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-72 right-0 glass-panel border-t border-outline-variant/10 px-8 py-4 flex items-center gap-8 z-30">
        <div className="flex items-center gap-4 min-w-max">
          <span className="text-[10px] font-headline uppercase tracking-[0.2em] text-primary">Forge Progression</span>
          <span className="text-xs font-bold text-on-surface">{progress}%</span>
        </div>
        <div className="flex-1 h-1 bg-surface-container-highest rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full kinetic-gradient" 
          />
        </div>
      </div>
    </div>
  );
}
