export type Screen = 'input' | 'thinking' | 'explorer' | 'analysis' | 'recommendation' | 'audit' | 'error';

export interface Constraint {
  id: string;
  label: string;
}

export interface Objective {
  id: string;
  label: string;
  weight: number;
}

export interface DecisionData {
  scenario: string;
  constraints: Constraint[];
  objectives: Objective[];
}

export interface Option {
  id: string;
  title: string;
  description: string;
  effort: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  impact: 'MODERATE' | 'SIGNIFICANT' | 'CRITICAL' | 'TRANSFORMATIVE';
  benefit: string;
  risk: string;
  scores: {
    marketFit: number;
    devSpeed: number;
    marginImpact: number;
    scalability: number;
  };
  cohesion: number;
}
