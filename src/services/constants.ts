import { ConstantItem } from '../types';

export const SCIENTIFIC_CONSTANTS: ConstantItem[] = [
  {
    id: 'pi',
    symbol: 'π',
    name: 'Pi (Archimedes Constant)',
    value: Math.PI,
    latex: '\\pi \\approx 3.14159265',
    category: 'Universal',
    unit: 'dimensionless',
    description: 'Ratio of a circle’s circumference to its diameter.'
  },
  {
    id: 'e',
    symbol: 'e',
    name: 'Euler’s Number',
    value: Math.E,
    latex: 'e \\approx 2.71828182',
    category: 'Universal',
    unit: 'dimensionless',
    description: 'Base of natural logarithms and rate of continuous growth.'
  },
  {
    id: 'phi',
    symbol: 'ϕ',
    name: 'Golden Ratio',
    value: (1 + Math.sqrt(5)) / 2,
    latex: '\\phi = \\frac{1+\\sqrt{5}}{2} \\approx 1.61803398',
    category: 'Universal',
    unit: 'dimensionless',
    description: 'Divine proportion occurring frequently in geometry and nature.'
  },
  {
    id: 'c',
    symbol: 'c',
    name: 'Speed of Light in Vacuum',
    value: 299792458,
    latex: 'c = 2.99792458 \\times 10^8 \\text{ m/s}',
    category: 'Universal',
    unit: 'm / s',
    description: 'Universal physical constant defining spacetime causality speed.'
  },
  {
    id: 'h',
    symbol: 'h',
    name: 'Planck Constant',
    value: 6.62607015e-34,
    latex: 'h = 6.62607015 \\times 10^{-34} \\text{ J}\\cdot\\text{s}',
    category: 'Quantum',
    unit: 'J · s',
    description: 'Fundamental physical constant of quantum mechanics.'
  },
  {
    id: 'hbar',
    symbol: 'ℏ',
    name: 'Reduced Planck Constant',
    value: 1.054571817e-34,
    latex: '\\hbar = \\frac{h}{2\\pi} \\approx 1.0545718 \\times 10^{-34} \\text{ J}\\cdot\\text{s}',
    category: 'Quantum',
    unit: 'J · s',
    description: 'Dirac constant used in quantum angular momentum and uncertainty.'
  },
  {
    id: 'G',
    symbol: 'G',
    name: 'Gravitational Constant',
    value: 6.6743e-11,
    latex: 'G = 6.67430 \\times 10^{-11} \\text{ N}\\cdot\\text{m}^2/\\text{kg}^2',
    category: 'Astrophysics',
    unit: 'N · m² / kg²',
    description: 'Newtonian gravitational coupling constant.'
  },
  {
    id: 'kB',
    symbol: 'k_B',
    name: 'Boltzmann Constant',
    value: 1.380649e-23,
    latex: 'k_B = 1.380649 \\times 10^{-23} \\text{ J/K}',
    category: 'Thermodynamics',
    unit: 'J / K',
    description: 'Relates the average relative kinetic energy of gas particles with temperature.'
  },
  {
    id: 'NA',
    symbol: 'N_A',
    name: 'Avogadro Constant',
    value: 6.02214076e23,
    latex: 'N_A = 6.02214076 \\times 10^{23} \\text{ mol}^{-1}',
    category: 'Thermodynamics',
    unit: '1 / mol',
    description: 'Number of constituent particles per mole of substance.'
  },
  {
    id: 'R',
    symbol: 'R',
    name: 'Universal Gas Constant',
    value: 8.314462618,
    latex: 'R = N_A k_B \\approx 8.31446 \\text{ J}/(\\text{mol}\\cdot\\text{K})',
    category: 'Thermodynamics',
    unit: 'J / (mol · K)',
    description: 'Molar gas constant in the ideal gas law PV = nRT.'
  },
  {
    id: 'e_charge',
    symbol: 'q_e',
    name: 'Elementary Charge',
    value: 1.602176634e-19,
    latex: 'e = 1.602176634 \\times 10^{-19} \\text{ C}',
    category: 'Electromagnetism',
    unit: 'C',
    description: 'Electric charge carried by a single proton or electron magnitude.'
  },
  {
    id: 'epsilon_0',
    symbol: 'ε_0',
    name: 'Vacuum Permittivity',
    value: 8.8541878128e-12,
    latex: '\\varepsilon_0 \\approx 8.8541878 \\times 10^{-12} \\text{ F/m}',
    category: 'Electromagnetism',
    unit: 'F / m',
    description: 'Permittivity of free space / dielectric capability of vacuum.'
  },
  {
    id: 'mu_0',
    symbol: 'μ_0',
    name: 'Vacuum Permeability',
    value: 1.25663706212e-6,
    latex: '\\mu_0 \\approx 1.256637 \\times 10^{-6} \\text{ N/A}^2',
    category: 'Electromagnetism',
    unit: 'N / A²',
    description: 'Magnetic permeability of free space.'
  },
  {
    id: 'm_e',
    symbol: 'm_e',
    name: 'Electron Rest Mass',
    value: 9.1093837015e-31,
    latex: 'm_e \\approx 9.10938 \\times 10^{-31} \\text{ kg}',
    category: 'Quantum',
    unit: 'kg',
    description: 'Invariant mass of an electron at rest.'
  },
  {
    id: 'm_p',
    symbol: 'm_p',
    name: 'Proton Rest Mass',
    value: 1.67262192369e-27,
    latex: 'm_p \\approx 1.67262 \\times 10^{-27} \\text{ kg}',
    category: 'Quantum',
    unit: 'kg',
    description: 'Invariant mass of a proton at rest.'
  },
  {
    id: 'g',
    symbol: 'g_0',
    name: 'Standard Gravity',
    value: 9.80665,
    latex: 'g_0 = 9.80665 \\text{ m/s}^2',
    category: 'Astrophysics',
    unit: 'm / s²',
    description: 'Nominal gravitational acceleration at Earth’s surface.'
  }
];
