import { create, all } from 'mathjs';
import { AngleUnit, ComplexAnalysis } from '../types';

// Create a configured mathjs instance
const math = create(all, {
  number: 'number',
  precision: 64,
});

export interface EvalResult {
  success: boolean;
  raw: any;
  formatted: string;
  latex?: string;
  type: 'scalar' | 'complex' | 'matrix' | 'calculus';
  error?: string;
  complexDetails?: ComplexAnalysis;
}

export class MathEngineService {
  /**
   * Preprocess an expression string to handle user-friendly syntax
   * such as implicit multiplication, angle mode trig substitutions, percentage, and constants.
   */
  public preprocess(expr: string, angleUnit: AngleUnit): string {
    let s = expr.trim();
    if (!s) return '0';

    // Replace display symbols with mathjs equivalents
    s = s.replace(/×/g, '*');
    s = s.replace(/÷/g, '/');
    s = s.replace(/−/g, '-');
    s = s.replace(/π/g, 'pi');
    s = s.replace(/√\(/g, 'sqrt(');
    s = s.replace(/√([0-9a-zA-Z.]+)/g, 'sqrt($1)');
    s = s.replace(/e\^/g, 'exp');

    // Handle percentage (e.g. 50% -> (50/100))
    s = s.replace(/([0-9.]+)\s*%/g, '($1/100)');

    // Handle factorial syntax: 5! -> factorial(5)
    s = s.replace(/([0-9a-zA-Z._]+)!/g, 'factorial($1)');

    // Angle mode adjustments for trig functions
    if (angleUnit === 'DEG') {
      // sin(x) -> sin((x) * (pi / 180))
      // asin(x) -> (asin(x) * (180 / pi))
      s = s.replace(/\basin\(([^)]+)\)/g, '(asin($1) * 180 / pi)');
      s = s.replace(/\bacos\(([^)]+)\)/g, '(acos($1) * 180 / pi)');
      s = s.replace(/\batan\(([^)]+)\)/g, '(atan($1) * 180 / pi)');
      s = s.replace(/\bsin\(([^)]+)\)/g, 'sin(($1) * pi / 180)');
      s = s.replace(/\bcos\(([^)]+)\)/g, 'cos(($1) * pi / 180)');
      s = s.replace(/\btan\(([^)]+)\)/g, 'tan(($1) * pi / 180)');
      s = s.replace(/\bsec\(([^)]+)\)/g, 'sec(($1) * pi / 180)');
      s = s.replace(/\bcsc\(([^)]+)\)/g, 'csc(($1) * pi / 180)');
      s = s.replace(/\bcot\(([^)]+)\)/g, 'cot(($1) * pi / 180)');
    } else if (angleUnit === 'GRAD') {
      s = s.replace(/\basin\(([^)]+)\)/g, '(asin($1) * 200 / pi)');
      s = s.replace(/\bacos\(([^)]+)\)/g, '(acos($1) * 200 / pi)');
      s = s.replace(/\batan\(([^)]+)\)/g, '(atan($1) * 200 / pi)');
      s = s.replace(/\bsin\(([^)]+)\)/g, 'sin(($1) * pi / 200)');
      s = s.replace(/\bcos\(([^)]+)\)/g, 'cos(($1) * pi / 200)');
      s = s.replace(/\btan\(([^)]+)\)/g, 'tan(($1) * pi / 200)');
    }

    // Support sqrt of negative numbers without throwing domain error
    // replace sqrt(...) with sqrt(complex(...))
    s = s.replace(/\bsqrt\(([^)]+)\)/g, 'sqrt(complex($1))');

    return s;
  }

  /**
   * Evaluate mathematical expression string safely with scope variables
   */
  public evaluate(
    expression: string,
    angleUnit: AngleUnit = 'DEG',
    precision: number = 8,
    scope: Record<string, any> = {}
  ): EvalResult {
    try {
      const cleanExpr = expression.trim();
      if (!cleanExpr) {
        return {
          success: true,
          raw: 0,
          formatted: '0',
          latex: '0',
          type: 'scalar',
        };
      }

      // Check for variable assignments like x = 12
      const assignMatch = cleanExpr.match(/^([a-zA-Z][a-zA-Z0-9_]*)\s*=\s*(.+)$/);
      if (assignMatch) {
        const varName = assignMatch[1];
        const valExpr = assignMatch[2];
        const evaluatedSub = this.evaluate(valExpr, angleUnit, precision, scope);
        if (!evaluatedSub.success) {
          return evaluatedSub;
        }
        scope[varName] = evaluatedSub.raw;
        return {
          success: true,
          raw: evaluatedSub.raw,
          formatted: `${varName} = ${evaluatedSub.formatted}`,
          latex: `${varName} = ${evaluatedSub.latex || evaluatedSub.formatted}`,
          type: evaluatedSub.type,
        };
      }

      const parsedExpr = this.preprocess(cleanExpr, angleUnit);
      const evalScope = {
        ...scope,
        i: math.complex(0, 1),
      };

      const rawResult = math.evaluate(parsedExpr, evalScope);

      // Check if result is a complex number
      if (rawResult && (rawResult.isComplex || typeof rawResult.im === 'number')) {
        const re = Number(rawResult.re);
        const im = Number(rawResult.im);
        const complexDetails = this.analyzeComplex(re, im, precision);

        const formatted = this.formatComplex(re, im, precision);
        const latex = this.toComplexLatex(re, im, precision);

        return {
          success: true,
          raw: rawResult,
          formatted,
          latex,
          type: 'complex',
          complexDetails,
        };
      }

      // Check if matrix
      if (rawResult && (rawResult.isMatrix || Array.isArray(rawResult))) {
        const matrixArray = rawResult.toArray ? rawResult.toArray() : rawResult;
        const formatted = JSON.stringify(matrixArray);
        const latex = this.matrixToLatex(matrixArray);

        return {
          success: true,
          raw: matrixArray,
          formatted,
          latex,
          type: 'matrix',
        };
      }

      // Scalar number
      if (typeof rawResult === 'number') {
        // Correct tiny floating errors like 1e-16 for sin(pi)
        let num = rawResult;
        if (Math.abs(num) < 1e-15) num = 0;

        const formatted = this.formatNumber(num, precision);
        return {
          success: true,
          raw: num,
          formatted,
          latex: formatted,
          type: 'scalar',
        };
      }

      // Boolean or other object
      const formatted = String(rawResult);
      return {
        success: true,
        raw: rawResult,
        formatted,
        latex: formatted,
        type: 'scalar',
      };
    } catch (err: any) {
      return {
        success: false,
        raw: null,
        formatted: 'Error',
        error: err.message || 'Syntax Error',
        type: 'scalar',
      };
    }
  }

  /**
   * Formats a floating point number according to desired precision, avoiding exponential slop
   */
  public formatNumber(val: number, precision: number = 8): string {
    if (isNaN(val)) return 'NaN';
    if (!isFinite(val)) return val > 0 ? 'Infinity' : '-Infinity';
    if (val === 0) return '0';

    const absVal = Math.abs(val);

    // If extremely large or tiny, use scientific notation
    if (absVal >= 1e12 || (absVal < 1e-5 && absVal > 0)) {
      return val.toExponential(Math.min(precision, 6));
    }

    // Clean rounding
    const rounded = Number(val.toPrecision(precision));
    // Remove trailing decimal zeroes
    return rounded.toString();
  }

  public analyzeComplex(re: number, im: number, precision: number = 6): ComplexAnalysis {
    let cleanRe = Math.abs(re) < 1e-15 ? 0 : re;
    let cleanIm = Math.abs(im) < 1e-15 ? 0 : im;

    const modulus = Math.sqrt(cleanRe * cleanRe + cleanIm * cleanIm);
    const argumentRad = Math.atan2(cleanIm, cleanRe);
    const argumentDeg = (argumentRad * 180) / Math.PI;

    const rStr = this.formatNumber(modulus, precision);
    const degStr = this.formatNumber(argumentDeg, precision);
    const radStr = this.formatNumber(argumentRad, precision);

    const polarStr = `${rStr} ∠ ${degStr}°`;
    const expStr = `${rStr} e^{${radStr}i}`;
    const conjugateStr = this.formatComplex(cleanRe, -cleanIm, precision);

    return {
      re: cleanRe,
      im: cleanIm,
      modulus,
      argumentRad,
      argumentDeg,
      polarStr,
      expStr,
      conjugateStr,
    };
  }

  public formatComplex(re: number, im: number, precision: number = 6): string {
    const cleanRe = Math.abs(re) < 1e-14 ? 0 : re;
    const cleanIm = Math.abs(im) < 1e-14 ? 0 : im;

    if (cleanIm === 0) return this.formatNumber(cleanRe, precision);
    if (cleanRe === 0) {
      if (cleanIm === 1) return 'i';
      if (cleanIm === -1) return '-i';
      return `${this.formatNumber(cleanIm, precision)}i`;
    }

    const reStr = this.formatNumber(cleanRe, precision);
    const sign = cleanIm > 0 ? '+' : '-';
    const absIm = Math.abs(cleanIm);
    const imStr = absIm === 1 ? 'i' : `${this.formatNumber(absIm, precision)}i`;

    return `${reStr} ${sign} ${imStr}`;
  }

  public toComplexLatex(re: number, im: number, precision: number = 6): string {
    const cleanRe = Math.abs(re) < 1e-14 ? 0 : re;
    const cleanIm = Math.abs(im) < 1e-14 ? 0 : im;

    if (cleanIm === 0) return this.formatNumber(cleanRe, precision);
    if (cleanRe === 0) {
      if (cleanIm === 1) return 'i';
      if (cleanIm === -1) return '-i';
      return `${this.formatNumber(cleanIm, precision)}i`;
    }

    const reStr = this.formatNumber(cleanRe, precision);
    const sign = cleanIm > 0 ? '+' : '-';
    const absIm = Math.abs(cleanIm);
    const imStr = absIm === 1 ? 'i' : `${this.formatNumber(absIm, precision)}i`;

    return `${reStr} ${sign} ${imStr}`;
  }

  public matrixToLatex(matrix: number[][]): string {
    if (!Array.isArray(matrix) || !matrix.length) return '\\begin{pmatrix}\\end{pmatrix}';
    const rows = matrix.map((row) =>
      Array.isArray(row) ? row.map((v) => this.formatNumber(v, 4)).join(' & ') : this.formatNumber(row, 4)
    );
    return `\\begin{pmatrix} ${rows.join(' \\\\ ')} \\end{pmatrix}`;
  }

  /**
   * Numerical derivative: f'(x) using 5-point central stencil
   */
  public numericalDerivative(
    funcExpr: string,
    x0: number,
    angleUnit: AngleUnit = 'RAD',
    h: number = 1e-5
  ): { value: number; latex: string } {
    const f = (xVal: number): number => {
      const res = this.evaluate(funcExpr, angleUnit, 10, { x: xVal });
      if (!res.success || typeof res.raw !== 'number') {
        throw new Error(`Evaluation failed at x = ${xVal}`);
      }
      return res.raw;
    };

    // 5-point central difference formula:
    // f'(x) = (-f(x + 2h) + 8f(x + h) - 8f(x - h) + f(x - 2h)) / (12h)
    const f_plus_2h = f(x0 + 2 * h);
    const f_plus_h = f(x0 + h);
    const f_minus_h = f(x0 - h);
    const f_minus_2h = f(x0 - 2 * h);

    const deriv = (-f_plus_2h + 8 * f_plus_h - 8 * f_minus_h + f_minus_2h) / (12 * h);
    const cleanDeriv = Math.abs(deriv) < 1e-12 ? 0 : Number(deriv.toPrecision(8));

    return {
      value: cleanDeriv,
      latex: `\\left.\\frac{d}{dx}\\left(${funcExpr}\\right)\\right|_{x=${x0}} = ${cleanDeriv}`,
    };
  }

  /**
   * Numerical Definite Integral using Composite Simpson's 3/8 Rule
   */
  public numericalIntegral(
    funcExpr: string,
    a: number,
    b: number,
    angleUnit: AngleUnit = 'RAD',
    subdivisions: number = 300
  ): { value: number; latex: string } {
    if (a === b) {
      return { value: 0, latex: `\\int_{${a}}^{${b}} (${funcExpr}) \\, dx = 0` };
    }

    const n = Math.ceil(subdivisions / 3) * 3; // Ensure n is divisible by 3
    const h = (b - a) / n;

    const f = (xVal: number): number => {
      const res = this.evaluate(funcExpr, angleUnit, 10, { x: xVal });
      if (!res.success || typeof res.raw !== 'number') {
        throw new Error(`Integral evaluation failed at x = ${xVal}`);
      }
      return res.raw;
    };

    let sum = f(a) + f(b);

    for (let i = 1; i < n; i++) {
      const x = a + i * h;
      if (i % 3 === 0) {
        sum += 2 * f(x);
      } else {
        sum += 3 * f(x);
      }
    }

    const integral = ((3 * h) / 8) * sum;
    const cleanInt = Math.abs(integral) < 1e-12 ? 0 : Number(integral.toPrecision(8));

    return {
      value: cleanInt,
      latex: `\\int_{${a}}^{${b}} \\left(${funcExpr}\\right) \\, dx = ${cleanInt}`,
    };
  }

  /**
   * Combinatorics helpers: nPr and nCr
   */
  public nPr(n: number, r: number): number {
    if (r < 0 || r > n) return 0;
    let res = 1;
    for (let i = 0; i < r; i++) {
      res *= n - i;
    }
    return res;
  }

  public nCr(n: number, r: number): number {
    if (r < 0 || r > n) return 0;
    if (r === 0 || r === n) return 1;
    if (r > n / 2) r = n - r;
    let res = 1;
    for (let i = 1; i <= r; i++) {
      res = (res * (n - i + 1)) / i;
    }
    return Math.round(res);
  }

  /**
   * Convert common text expressions to clean KaTeX LaTeX
   */
  public expressionToLatex(expr: string): string {
    let s = expr.trim();
    if (!s) return '';

    // Replace basic operations
    s = s.replace(/\*/g, ' \\times ');
    s = s.replace(/\//g, ' \\div ');
    s = s.replace(/pi/g, '\\pi');
    s = s.replace(/sqrt\(([^)]+)\)/g, '\\sqrt{$1}');
    s = s.replace(/sin\(/g, '\\sin(');
    s = s.replace(/cos\(/g, '\\cos(');
    s = s.replace(/tan\(/g, '\\tan(');
    s = s.replace(/ln\(/g, '\\ln(');
    s = s.replace(/log10\(/g, '\\log_{10}(');
    s = s.replace(/log\(/g, '\\log(');
    s = s.replace(/exp\(([^)]+)\)/g, 'e^{$1}');
    s = s.replace(/\^([0-9a-zA-Z.]+)/g, '^{$1}');

    return s;
  }
}

export const mathEngine = new MathEngineService();
