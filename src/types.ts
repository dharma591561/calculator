export type AngleUnit = 'DEG' | 'RAD' | 'GRAD';
export type NotationMode = 'auto' | 'fixed' | 'exponential' | 'engineering';
export type CalculatorTab = 'workstation' | 'matrices' | 'complex' | 'calculus' | 'constants';

export type ThemeId =
  | 'ivory-graphite'
  | 'graphite-noir'
  | 'midnight'
  | 'forest-slate'
  | 'paper-ink';

export interface ThemeInfo {
  id: ThemeId;
  name: string;
  tagline: string;
  bg: string;
  surface: string;
  surfaceSecondary: string;
  primaryText: string;
  secondaryText: string;
  borders: string;
  accent: string;
  accentHover: string;
  accentText: string;
  canvasFill: string;
}

export interface CalculationItem {
  id: string;
  timestamp: number;
  expression: string;
  result: string;
  latex?: string;
  type: 'scalar' | 'complex' | 'matrix' | 'calculus';
  starred?: boolean;
  angleUnit: AngleUnit;
  precision?: number;
  notes?: string;
}

export interface MatrixData {
  id: string;
  name: string;
  rows: number;
  cols: number;
  values: number[][];
}

export interface ComplexAnalysis {
  re: number;
  im: number;
  modulus: number;
  argumentRad: number;
  argumentDeg: number;
  polarStr: string;
  expStr: string;
  conjugateStr: string;
}

export interface ConstantItem {
  id: string;
  symbol: string;
  name: string;
  value: number;
  latex: string;
  category: 'Universal' | 'Electromagnetism' | 'Quantum' | 'Astrophysics' | 'Thermodynamics';
  unit: string;
  description: string;
}

export interface MemoryState {
  M: number;
  x: number;
  y: number;
  z: number;
  ans: string;
}

export interface AiExplanation {
  title: string;
  summary: string;
  steps: string[];
  intuition: string;
  keyIdentities: string[];
  latex: string;
}
