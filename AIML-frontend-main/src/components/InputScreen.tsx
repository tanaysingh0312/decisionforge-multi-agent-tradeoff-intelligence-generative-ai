import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  X, 
  Zap, 
  Target, 
  Shield, 
  Clock, 
  ArrowRight,
  Info
} from 'lucide-react';
import { Constraint, Objective, DecisionData } from '../types';
import { INITIAL_CONSTRAINTS, INITIAL_OBJECTIVES } from '../constants';
import { cn } from '../lib/utils';

interface InputScreenProps {
  onForge: (data: DecisionData) => void;
}

export default function InputScreen({ onForge }: InputScreenProps) {
  const [scenario, setScenario] = useState('');
  const [constraints, setConstraints] = useState<Constraint[]>(INITIAL_CONSTRAINTS);
  const [objectives, setObjectives] = useState<Objective[]>(INITIAL_OBJECTIVES);

  const totalWeight = objectives.reduce((acc, obj) => acc + obj.weight, 0);

  const handleWeightChange = (id: string, value: number) => {
    setObjectives(prev => prev.map(obj => 
      obj.id === id ? { ...obj, weight: value } : obj
    ));
  };

  const removeConstraint = (id: string) => {
    setConstraints(prev => prev.filter(c => c.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (scenario.trim()) {
      onForge({ scenario, constraints, objectives });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20">
      {/* Hero Section */}
      <div className="space-y-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center space-x-3 text-secondary"
        >
          <div className="w-12 h-[1px] bg-secondary/50"></div>
          <span className="font-headline text-xs uppercase tracking-[0.3em]">Intelligence Input Phase</span>
        </motion.div>
        <h1 className="text-5xl font-headline font-bold leading-tight tracking-tight">
          Define the <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Strategic Frontier</span>
        </h1>
        <p className="text-outline-variant text-lg max-w-2xl">
          Input your product scenario, constraints, and objectives. DecisionForge will synthesize 
          optimal paths through multi-dimensional trade-off analysis.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        {/* Scenario Input */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-2 text-sm font-headline uppercase tracking-widest text-outline-variant">
              <Zap className="w-4 h-4 text-primary" />
              <span>Decision Scenario</span>
            </label>
            <span className="text-[10px] text-outline-variant/50 uppercase tracking-tighter">Contextual Depth: High</span>
          </div>
          <div className="relative group">
            <textarea
              value={scenario}
              onChange={(e) => setScenario(e.target.value)}
              placeholder="Describe the product trade-off or strategic decision you're facing..."
              className="w-full h-48 bg-surface/50 border border-outline-variant/20 rounded-2xl p-6 text-on-surface placeholder:text-outline-variant/30 focus:outline-none focus:border-primary/50 transition-all resize-none glass-panel"
            />
            <div className="absolute bottom-4 right-4 text-[10px] text-outline-variant/30 font-mono">
              {scenario.length} CHARS
            </div>
          </div>
        </section>

        {/* Constraints & Objectives Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Strategic Constraints */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 text-sm font-headline uppercase tracking-widest text-outline-variant">
                <Shield className="w-4 h-4 text-secondary" />
                <span>Strategic Constraints</span>
              </label>
              <button type="button" className="p-1 hover:bg-white/5 rounded-full transition-colors">
                <Plus className="w-4 h-4 text-outline-variant" />
              </button>
            </div>
            <div className="flex flex-wrap gap-3">
              <AnimatePresence mode="popLayout">
                {constraints.map((constraint) => (
                  <motion.div
                    key={constraint.id}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex items-center space-x-2 px-4 py-2 bg-surface/30 border border-outline-variant/10 rounded-full group hover:border-secondary/30 transition-colors"
                  >
                    <span className="text-xs font-medium">{constraint.label}</span>
                    <button
                      type="button"
                      onClick={() => removeConstraint(constraint.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3 text-outline-variant hover:text-error" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </section>

          {/* Objectives & Weights */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 text-sm font-headline uppercase tracking-widest text-outline-variant">
                <Target className="w-4 h-4 text-primary" />
                <span>Objectives & Weights</span>
              </label>
              <div className={cn(
                "text-xs font-mono px-2 py-1 rounded",
                totalWeight === 100 ? "text-secondary bg-secondary/10" : "text-error bg-error/10"
              )}>
                TOTAL: {totalWeight}%
              </div>
            </div>
            <div className="space-y-6">
              {objectives.map((obj) => (
                <div key={obj.id} className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-on-surface/70">{obj.label}</span>
                    <span className="font-mono text-primary">{obj.weight}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={obj.weight}
                    onChange={(e) => handleWeightChange(obj.id, parseInt(e.target.value))}
                    className="w-full h-1 bg-surface/50 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Submit Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={!scenario.trim() || totalWeight !== 100}
          className="w-full py-6 bg-gradient-to-r from-primary to-secondary rounded-2xl font-headline font-bold uppercase tracking-[0.2em] text-background shadow-[0_0_30px_rgba(128,131,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all flex items-center justify-center space-x-3 group"
        >
          <span>Forge Intelligence</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </motion.button>
      </form>

      {/* Footer Info */}
      <div className="flex items-center justify-center space-x-8 text-[10px] text-outline-variant uppercase tracking-widest pt-10">
        <div className="flex items-center space-x-2">
          <Clock className="w-3 h-3" />
          <span>Est. Analysis Time: 12.4s</span>
        </div>
        <div className="flex items-center space-x-2">
          <Info className="w-3 h-3" />
          <span>Powered by Forge-1 Neural Engine</span>
        </div>
      </div>
    </div>
  );
}
