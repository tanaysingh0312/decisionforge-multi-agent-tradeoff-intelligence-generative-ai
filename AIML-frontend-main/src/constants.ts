import { Option, Constraint, Objective } from './types';

export const INITIAL_CONSTRAINTS: Constraint[] = [
  { id: '1', label: 'Budget under $50k' },
  { id: '2', label: 'Launch within 3 months' },
  { id: '3', label: 'No additional hiring' },
  { id: '4', label: 'High security compliance' },
];

export const INITIAL_OBJECTIVES: Objective[] = [
  { id: '1', label: 'Speed to Market', weight: 40 },
  { id: '2', label: 'Customer NPS', weight: 30 },
  { id: '3', label: 'Operational Risk', weight: 30 },
];

export const OPTIONS: Option[] = [
  {
    id: '1',
    title: 'Aggressive Expansion',
    description: 'Deploy maximum capital into untapped emerging markets while accelerating R&D for next-gen integration protocols.',
    effort: 'HIGH',
    impact: 'CRITICAL',
    benefit: 'First-mover dominance in 3 key APAC regions with 40% projected CAGR.',
    risk: 'Capital depletion if regional regulatory hurdles exceed 18 months.',
    scores: { marketFit: 9, devSpeed: 7, marginImpact: 9, scalability: 10 },
    cohesion: 0.92,
  },
  {
    id: '2',
    title: 'Core Optimization',
    description: 'Refine internal operational efficiencies and reduce technical debt to increase margins on established product lines.',
    effort: 'LOW',
    impact: 'MODERATE',
    benefit: 'Immediate 12% reduction in operational overhead and improved system uptime.',
    risk: 'Opportunity cost of stagnation while competitors innovate externally.',
    scores: { marketFit: 5, devSpeed: 3, marginImpact: 6, scalability: 4 },
    cohesion: 0.45,
  },
  {
    id: '3',
    title: 'Strategic Alliance',
    description: 'Leverage a joint venture with Tier-1 infrastructure providers to offset capital expenditure and risk.',
    effort: 'MEDIUM',
    impact: 'SIGNIFICANT',
    benefit: 'Access to proprietary distribution networks and shared R&D costs.',
    risk: 'Dilution of brand autonomy and potential integration complexities.',
    scores: { marketFit: 8, devSpeed: 9, marginImpact: 2, scalability: 9 },
    cohesion: 0.68,
  },
  {
    id: '4',
    title: 'SaaS Transition',
    description: 'Migrate legacy on-premise solutions to a fully multi-tenant cloud-native platform architecture.',
    effort: 'CRITICAL',
    impact: 'TRANSFORMATIVE',
    benefit: 'Scalable recurring revenue and 90% reduction in client-side maintenance.',
    risk: 'Complex migration of high-security governmental client datasets.',
    scores: { marketFit: 7, devSpeed: 5, marginImpact: 8, scalability: 9 },
    cohesion: 0.85,
  },
];
