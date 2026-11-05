import React, { useState, useRef, useEffect, useCallback } from 'react';
import { mathEngine } from '../services/mathEngine';
import { MathView } from './MathView';
import { useTheme } from '../context/ThemeContext';
import { sound } from '../services/audioFeedback';

export const CalculusWorkspace: React.FC = () => {
  const { currentTheme } = useTheme();
  const [funcExpr, setFuncExpr] = useState<string>('sin(x) * exp(-x/5)');
  const [x0, setX0] = useState<number>(1.5);
  const [lowerBound, setLowerBound] = useState<number>(0);
  const [upperBound, setUpperBound] = useState<number>(3.14159);
  const [mode, setMode] = useState<'integral' | 'derivative'>('integral');

  const [derivResult, setDerivResult] = useState<{ value: number; latex: string } | null>(null);
  const [integralResult, setIntegralResult] = useState<{ value: number; latex: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const computeCalculus = useCallback(() => {
    setErrorMsg(null);
    try {
      const d = mathEngine.numericalDerivative(funcExpr, x0, 'RAD');
      setDerivResult(d);

      const i = mathEngine.numericalIntegral(funcExpr, lowerBound, upperBound, 'RAD');
      setIntegralResult(i);
    } catch (err: any) {
      setErrorMsg(err.message || 'Calculus calculation error');
    }
  }, [funcExpr, x0, lowerBound, upperBound]);

  useEffect(() => {
    computeCalculus();
  }, [computeCalculus]);

  // Draw Function Curve Canvas adapting to currentTheme
  const drawCurve = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Canvas background adapting to active theme
    ctx.fillStyle = currentTheme.surface;
    ctx.fillRect(0, 0, width, height);

    const xMin = -3;
    const xMax = 8;
    const yMin = -2.5;
    const yMax = 2.5;

    const toScreenX = (x: number) => ((x - xMin) / (xMax - xMin)) * width;
    const toScreenY = (y: number) => height - ((y - yMin) / (yMax - yMin)) * height;

    // Subtle technical grid
    ctx.strokeStyle = currentTheme.borders;
    ctx.lineWidth = 1;

    for (let x = Math.ceil(xMin); x <= xMax; x++) {
      const sx = toScreenX(x);
      ctx.beginPath();
      ctx.moveTo(sx, 0);
      ctx.lineTo(sx, height);
      ctx.stroke();
    }
    for (let y = Math.ceil(yMin); y <= yMax; y++) {
      const sy = toScreenY(y);
      ctx.beginPath();
      ctx.moveTo(0, sy);
      ctx.lineTo(width, sy);
      ctx.stroke();
    }

    // Axes
    const origX = toScreenX(0);
    const origY = toScreenY(0);

    ctx.strokeStyle = currentTheme.secondaryText;
    ctx.lineWidth = 1.25;

    // X Axis
    ctx.beginPath();
    ctx.moveTo(0, origY);
    ctx.lineTo(width, origY);
    ctx.stroke();

    // Y Axis
    ctx.beginPath();
    ctx.moveTo(origX, 0);
    ctx.lineTo(origX, height);
    ctx.stroke();

    // Labels
    ctx.fillStyle = currentTheme.secondaryText;
    ctx.font = '10px JetBrains Mono, monospace';
    ctx.fillText('x', width - 14, origY - 6);
    ctx.fillText('y', origX + 6, 14);

    const evalY = (xVal: number): number | null => {
      try {
        const res = mathEngine.evaluate(funcExpr, 'RAD', 6, { x: xVal });
        if (res.success && typeof res.raw === 'number' && !isNaN(res.raw)) {
          return res.raw;
        }
      } catch {
        return null;
      }
      return null;
    };

    // Shaded Area for Definite Integral
    if (mode === 'integral' && lowerBound < upperBound) {
      ctx.fillStyle = currentTheme.canvasFill;
      ctx.beginPath();
      const sxStart = toScreenX(lowerBound);
      const sxEnd = toScreenX(upperBound);
      ctx.moveTo(sxStart, origY);

      const stepPx = 2;
      for (let px = sxStart; px <= sxEnd; px += stepPx) {
        const xVal = xMin + (px / width) * (xMax - xMin);
        const yVal = evalY(xVal);
        if (yVal !== null) {
          ctx.lineTo(px, toScreenY(yVal));
        }
      }
      ctx.lineTo(sxEnd, origY);
      ctx.closePath();
      ctx.fill();

      // Bound boundaries
      ctx.strokeStyle = currentTheme.accent;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(sxStart, 0);
      ctx.lineTo(sxStart, height);
      ctx.moveTo(sxEnd, 0);
      ctx.lineTo(sxEnd, height);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw Function Curve with theme accent
    ctx.strokeStyle = currentTheme.accent;
    ctx.lineWidth = 2;
    ctx.beginPath();

    let started = false;
    const pxStep = 2;
    for (let px = 0; px <= width; px += pxStep) {
      const xVal = xMin + (px / width) * (xMax - xMin);
      const yVal = evalY(xVal);
      if (yVal !== null && !isNaN(yVal) && isFinite(yVal)) {
        const py = toScreenY(yVal);
        if (!started) {
          ctx.moveTo(px, py);
          started = true;
        } else {
          ctx.lineTo(px, py);
        }
      } else {
        started = false;
      }
    }
    ctx.stroke();

    // Tangent line for derivative
    if (mode === 'derivative' && derivResult) {
      const y0 = evalY(x0);
      if (y0 !== null) {
        const slope = derivResult.value;
        const sx0 = toScreenX(x0);
        const sy0 = toScreenY(y0);

        // Point on curve
        ctx.fillStyle = currentTheme.primaryText;
        ctx.beginPath();
        ctx.arc(sx0, sy0, 4, 0, Math.PI * 2);
        ctx.fill();

        // Tangent line
        const tLen = 2.5;
        const xA = x0 - tLen;
        const yA = y0 - slope * tLen;
        const xB = x0 + tLen;
        const yB = y0 + slope * tLen;

        ctx.strokeStyle = currentTheme.secondaryText;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(toScreenX(xA), toScreenY(yA));
        ctx.lineTo(toScreenX(xB), toScreenY(yB));
        ctx.stroke();
      }
    }
  }, [funcExpr, x0, lowerBound, upperBound, mode, derivResult, currentTheme]);

  useEffect(() => {
    drawCurve();
  }, [drawCurve]);

  const presets = [
    { label: 'Oscillator: sin(x)·e^(-x/5)', expr: 'sin(x) * exp(-x/5)', a: 0, b: 3.14159, x0: 1.5 },
    { label: 'Gaussian: exp(-x²)', expr: 'exp(-x^2)', a: -2, b: 2, x0: 0.5 },
    { label: 'Cubic: x³ - 3x', expr: 'x^3 - 3*x', a: -1, b: 2, x0: 1 },
    { label: 'Log: ln(x² + 1)', expr: 'ln(x^2 + 1)', a: 0, b: 4, x0: 2 },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* Parameters Panel */}
      <div className="lg:col-span-5 flex flex-col gap-4">
        <div className="p-5 bg-axiom-surface rounded-sm border border-axiom-border flex flex-col gap-4 transition-colors">
          <div className="flex items-center justify-between border-b border-axiom-border pb-2.5">
            <span className="font-sans text-xs font-semibold text-axiom-primary">
              Function Definition
            </span>
            <span className="text-xs font-mono text-axiom-secondary">
              y = f(x)
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-sans text-axiom-secondary">Expression f(x)</label>
            <input
              type="text"
              value={funcExpr}
              onChange={(e) => setFuncExpr(e.target.value)}
              className="p-2 text-xs font-mono bg-axiom-bg border border-axiom-border rounded-sm text-axiom-primary font-medium transition-colors"
            />
          </div>

          {/* Presets */}
          <div className="flex flex-col gap-1 text-xs font-sans">
            <span className="text-[11px] text-axiom-secondary">Presets:</span>
            <div className="grid grid-cols-2 gap-1.5">
              {presets.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    sound.playKeyClick('action');
                    setFuncExpr(p.expr);
                    setLowerBound(p.a);
                    setUpperBound(p.b);
                    setX0(p.x0);
                  }}
                  className="p-1.5 rounded-sm border border-axiom-border bg-axiom-bg hover:bg-axiom-sub text-left text-axiom-primary truncate transition-colors text-[11px]"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Toggle Mode */}
          <div className="flex items-center gap-1.5 pt-2 border-t border-axiom-border">
            <button
              onClick={() => setMode('integral')}
              className={`flex-1 py-1.5 text-xs font-sans rounded-sm transition-colors ${
                mode === 'integral'
                  ? 'bg-axiom-accent text-axiom-accent-text font-medium'
                  : 'bg-axiom-sub text-axiom-secondary'
              }`}
            >
              Definite Integral ∫
            </button>
            <button
              onClick={() => setMode('derivative')}
              className={`flex-1 py-1.5 text-xs font-sans rounded-sm transition-colors ${
                mode === 'derivative'
                  ? 'bg-axiom-accent text-axiom-accent-text font-medium'
                  : 'bg-axiom-sub text-axiom-secondary'
              }`}
            >
              Derivative d/dx
            </button>
          </div>

          {/* Parameters for Integral */}
          {mode === 'integral' && (
            <div className="grid grid-cols-2 gap-3 p-3 bg-axiom-bg rounded-sm border border-axiom-border text-xs font-sans transition-colors">
              <div className="flex flex-col gap-1">
                <span className="text-[11px] text-axiom-secondary">Lower Bound (a):</span>
                <input
                  type="number"
                  step="0.1"
                  value={lowerBound}
                  onChange={(e) => setLowerBound(parseFloat(e.target.value) || 0)}
                  className="p-1.5 bg-axiom-surface border border-axiom-border rounded-sm text-center font-mono text-xs text-axiom-primary transition-colors"
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[11px] text-axiom-secondary">Upper Bound (b):</span>
                <input
                  type="number"
                  step="0.1"
                  value={upperBound}
                  onChange={(e) => setUpperBound(parseFloat(e.target.value) || 0)}
                  className="p-1.5 bg-axiom-surface border border-axiom-border rounded-sm text-center font-mono text-xs text-axiom-primary transition-colors"
                />
              </div>
            </div>
          )}

          {/* Parameters for Derivative */}
          {mode === 'derivative' && (
            <div className="p-3 bg-axiom-bg rounded-sm border border-axiom-border text-xs font-sans flex items-center justify-between transition-colors">
              <span className="text-[11px] text-axiom-secondary">Evaluation Point x₀:</span>
              <input
                type="number"
                step="0.1"
                value={x0}
                onChange={(e) => setX0(parseFloat(e.target.value) || 0)}
                className="w-24 p-1.5 bg-axiom-surface border border-axiom-border rounded-sm text-center font-mono text-xs text-axiom-primary transition-colors"
              />
            </div>
          )}
        </div>

        {/* Results Box */}
        {errorMsg ? (
          <div className="p-3.5 rounded-sm bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-mono">
            {errorMsg}
          </div>
        ) : (
          <div className="p-4 bg-axiom-surface rounded-sm border border-axiom-border flex flex-col gap-2 transition-colors">
            <span className="text-[10px] font-sans uppercase tracking-wider text-axiom-secondary">
              {mode === 'integral' ? 'Definite Integral Result' : 'Tangent Slope & Derivative'}
            </span>
            <div className="font-mono text-base font-medium text-axiom-primary">
              {mode === 'integral' && integralResult && (
                <MathView latex={integralResult.latex} displayMode={true} />
              )}
              {mode === 'derivative' && derivResult && (
                <MathView latex={derivResult.latex} displayMode={true} />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Curve Canvas */}
      <div className="lg:col-span-7 flex flex-col gap-4">
        <div className="p-5 bg-axiom-surface rounded-sm border border-axiom-border flex flex-col gap-4 transition-colors">
          <div className="flex items-center justify-between">
            <span className="font-sans text-xs font-semibold text-axiom-primary">
              Function Trace & Area
            </span>
            <span className="text-[11px] font-mono text-axiom-secondary">
              {mode === 'integral' ? 'Area = ∫ f(x) dx' : 'Tangent at x₀'}
            </span>
          </div>

          <div className="relative w-full aspect-video max-h-[440px] bg-axiom-surface rounded-sm overflow-hidden border border-axiom-border flex items-center justify-center transition-colors">
            <canvas ref={canvasRef} width={640} height={380} className="w-full h-full" />
          </div>
        </div>
      </div>
    </div>
  );
};
