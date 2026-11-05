import React, { useState, useRef, useEffect, useCallback } from 'react';
import { mathEngine } from '../services/mathEngine';
import { ComplexAnalysis } from '../types';
import { useTheme } from '../context/ThemeContext';
import { sound } from '../services/audioFeedback';

export const ComplexWorkspace: React.FC = () => {
  const { currentTheme } = useTheme();
  const [realPart, setRealPart] = useState<number>(3);
  const [imagPart, setImagPart] = useState<number>(4);
  const [powersN, setPowersN] = useState<number>(4);
  const [rootsN, setRootsN] = useState<number>(5);
  const [viewMode, setViewMode] = useState<'standard' | 'powers' | 'roots'>('standard');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDraggingRef = useRef<boolean>(false);

  // Compute analysis
  const analysis: ComplexAnalysis = mathEngine.analyzeComplex(realPart, imagPart, 6);

  // Canvas drawing adapting dynamically to current active theme
  const drawArgand = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;

    const maxCoord = Math.max(Math.abs(realPart), Math.abs(imagPart), 4);
    const scale = (Math.min(width, height) * 0.4) / maxCoord;

    // Background: Surface of current theme
    ctx.fillStyle = currentTheme.surface;
    ctx.fillRect(0, 0, width, height);

    // Subtle grid using borders color
    ctx.strokeStyle = currentTheme.borders;
    ctx.lineWidth = 1;

    const step = 1;
    for (let x = -10; x <= 10; x += step) {
      const px = centerX + x * scale;
      if (px >= 0 && px <= width) {
        ctx.beginPath();
        ctx.moveTo(px, 0);
        ctx.lineTo(px, height);
        ctx.stroke();
      }
    }
    for (let y = -10; y <= 10; y += step) {
      const py = centerY - y * scale;
      if (py >= 0 && py <= height) {
        ctx.beginPath();
        ctx.moveTo(0, py);
        ctx.lineTo(width, py);
        ctx.stroke();
      }
    }

    // Unit circle (reference)
    ctx.beginPath();
    ctx.arc(centerX, centerY, 1 * scale, 0, Math.PI * 2);
    ctx.strokeStyle = currentTheme.borders;
    ctx.setLineDash([2, 3]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Axes
    ctx.strokeStyle = currentTheme.secondaryText;
    ctx.lineWidth = 1.25;

    // Real Axis
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.stroke();

    // Imaginary Axis
    ctx.beginPath();
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, height);
    ctx.stroke();

    // Axis Labels
    ctx.fillStyle = currentTheme.secondaryText;
    ctx.font = '10px JetBrains Mono, monospace';
    ctx.fillText('Re', width - 22, centerY - 6);
    ctx.fillText('Im', centerX + 6, 15);

    const px = centerX + realPart * scale;
    const py = centerY - imagPart * scale;

    if (viewMode === 'standard') {
      // Orthogonal drop lines
      ctx.strokeStyle = currentTheme.secondaryText;
      ctx.setLineDash([2, 2]);

      ctx.beginPath();
      ctx.moveTo(px, centerY);
      ctx.lineTo(px, py);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(centerX, py);
      ctx.lineTo(px, py);
      ctx.stroke();
      ctx.setLineDash([]);

      // Conjugate vector (dashed secondary color)
      const conjPy = centerY - -imagPart * scale;
      ctx.strokeStyle = currentTheme.secondaryText;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(px, conjPy);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = currentTheme.secondaryText;
      ctx.beginPath();
      ctx.arc(px, conjPy, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillText('z*', px + 6, conjPy + 4);

      // Angle arc
      const radius = Math.min(26, analysis.modulus * scale * 0.4);
      if (radius > 8) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, -analysis.argumentRad, imagPart < 0);
        ctx.strokeStyle = currentTheme.accent;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Primary vector z (Theme Accent)
      ctx.strokeStyle = currentTheme.accent;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(px, py);
      ctx.stroke();

      // Point circle
      ctx.fillStyle = currentTheme.accent;
      ctx.beginPath();
      ctx.arc(px, py, 4, 0, Math.PI * 2);
      ctx.fill();

      // Label z
      ctx.fillStyle = currentTheme.primaryText;
      ctx.font = '600 11px JetBrains Mono, monospace';
      ctx.fillText(`z (${realPart}, ${imagPart})`, px + 8, py - 6);
    } else if (viewMode === 'powers') {
      const r = analysis.modulus;
      const theta = analysis.argumentRad;

      ctx.strokeStyle = currentTheme.borders;
      ctx.beginPath();

      for (let k = 1; k <= powersN; k++) {
        const pkR = Math.pow(r, k);
        const pkTheta = theta * k;
        const pX = centerX + pkR * Math.cos(pkTheta) * (scale / Math.max(1, pkR / maxCoord));
        const pY = centerY - pkR * Math.sin(pkTheta) * (scale / Math.max(1, pkR / maxCoord));

        if (k === 1) ctx.moveTo(pX, pY);
        else ctx.lineTo(pX, pY);

        ctx.fillStyle = k === 1 ? currentTheme.accent : currentTheme.secondaryText;
        ctx.beginPath();
        ctx.arc(pX, pY, 3.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = '10px JetBrains Mono, monospace';
        ctx.fillText(`z^${k}`, pX + 6, pY + 3);
      }
      ctx.stroke();
    } else if (viewMode === 'roots') {
      ctx.strokeStyle = currentTheme.borders;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 1.5 * scale, 0, Math.PI * 2);
      ctx.stroke();

      for (let k = 0; k < rootsN; k++) {
        const angle = (2 * Math.PI * k) / rootsN;
        const rx = centerX + 1.5 * scale * Math.cos(angle);
        const ry = centerY - 1.5 * scale * Math.sin(angle);

        ctx.strokeStyle = currentTheme.borders;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(rx, ry);
        ctx.stroke();

        ctx.fillStyle = currentTheme.accent;
        ctx.beginPath();
        ctx.arc(rx, ry, 3.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = currentTheme.secondaryText;
        ctx.font = '10px JetBrains Mono, monospace';
        ctx.fillText(`ω_${k}`, rx + 5, ry + 3);
      }
    }
  }, [realPart, imagPart, analysis, viewMode, powersN, rootsN, currentTheme]);

  useEffect(() => {
    drawArgand();
  }, [drawArgand]);

  const handleCanvasInteraction = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const maxCoord = Math.max(Math.abs(realPart), Math.abs(imagPart), 4);
    const scale = (Math.min(canvas.width, canvas.height) * 0.4) / maxCoord;

    const newRe = Math.round(((x - centerX) / scale) * 10) / 10;
    const newIm = Math.round(((centerY - y) / scale) * 10) / 10;

    setRealPart(newRe);
    setImagPart(newIm);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* Analytical Controls */}
      <div className="lg:col-span-5 flex flex-col gap-4">
        {/* Controls Card */}
        <div className="p-5 bg-axiom-surface rounded-sm border border-axiom-border flex flex-col gap-4 transition-colors">
          <div className="flex items-center justify-between border-b border-axiom-border pb-2.5">
            <span className="font-sans text-xs font-semibold text-axiom-primary">
              Complex Coordinates
            </span>
            <span className="text-xs font-mono text-axiom-secondary">
              z = a + bi
            </span>
          </div>

          {/* Coordinates inputs */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-sans text-axiom-secondary">Re(z)</label>
              <input
                type="number"
                step="0.1"
                value={realPart}
                onChange={(e) => setRealPart(parseFloat(e.target.value) || 0)}
                className="p-1.5 text-xs font-mono bg-axiom-bg border border-axiom-border rounded-sm text-axiom-primary text-center font-medium transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-sans text-axiom-secondary">Im(z)</label>
              <input
                type="number"
                step="0.1"
                value={imagPart}
                onChange={(e) => setImagPart(parseFloat(e.target.value) || 0)}
                className="p-1.5 text-xs font-mono bg-axiom-bg border border-axiom-border rounded-sm text-axiom-primary text-center font-medium transition-colors"
              />
            </div>
          </div>

          {/* Presets */}
          <div className="flex items-center gap-1 text-xs font-sans text-axiom-secondary pt-1">
            <span className="text-[11px] mr-1">Presets:</span>
            <button
              onClick={() => {
                sound.playKeyClick('action');
                setRealPart(0);
                setImagPart(1);
              }}
              className="px-2 py-0.5 rounded-sm border border-axiom-border bg-axiom-bg hover:bg-axiom-sub text-axiom-primary transition-colors"
            >
              i
            </button>
            <button
              onClick={() => {
                sound.playKeyClick('action');
                setRealPart(1);
                setImagPart(1);
              }}
              className="px-2 py-0.5 rounded-sm border border-axiom-border bg-axiom-bg hover:bg-axiom-sub text-axiom-primary transition-colors"
            >
              1 + i
            </button>
            <button
              onClick={() => {
                sound.playKeyClick('action');
                setRealPart(0.5);
                setImagPart(0.866);
              }}
              className="px-2 py-0.5 rounded-sm border border-axiom-border bg-axiom-bg hover:bg-axiom-sub text-axiom-primary transition-colors"
            >
              e^(iπ/3)
            </button>
            <button
              onClick={() => {
                sound.playKeyClick('action');
                setRealPart(-1);
                setImagPart(0);
              }}
              className="px-2 py-0.5 rounded-sm border border-axiom-border bg-axiom-bg hover:bg-axiom-sub text-axiom-primary transition-colors"
            >
              -1
            </button>
          </div>
        </div>

        {/* Analytical Decomposition */}
        <div className="p-5 bg-axiom-surface rounded-sm border border-axiom-border flex flex-col gap-2.5 font-mono text-xs transition-colors">
          <span className="font-sans text-xs font-semibold text-axiom-primary border-b border-axiom-border pb-2">
            Polar & Exponential Form
          </span>

          <div className="p-2.5 rounded-sm bg-axiom-bg border border-axiom-border flex items-center justify-between transition-colors">
            <span className="text-axiom-secondary font-sans">Polar (r ∠ θ)</span>
            <span className="font-semibold text-axiom-primary">
              {analysis.polarStr}
            </span>
          </div>

          <div className="p-2.5 rounded-sm bg-axiom-bg border border-axiom-border flex items-center justify-between transition-colors">
            <span className="text-axiom-secondary font-sans">Exponential (r e^iθ)</span>
            <span className="font-semibold text-axiom-primary">
              {analysis.expStr}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="p-2.5 rounded-sm bg-axiom-bg border border-axiom-border transition-colors">
              <div className="text-axiom-secondary font-sans text-[10px] mb-0.5">MODULUS |z|</div>
              <div className="font-semibold text-axiom-primary">
                {analysis.modulus.toFixed(4)}
              </div>
            </div>
            <div className="p-2.5 rounded-sm bg-axiom-bg border border-axiom-border transition-colors">
              <div className="text-axiom-secondary font-sans text-[10px] mb-0.5">ARGUMENT θ</div>
              <div className="font-semibold text-axiom-primary">
                {analysis.argumentRad.toFixed(4)} rad
              </div>
            </div>
          </div>

          <div className="p-2.5 rounded-sm bg-axiom-bg border border-axiom-border flex items-center justify-between transition-colors">
            <span className="text-axiom-secondary font-sans">Conjugate z*</span>
            <span className="font-semibold text-axiom-primary">
              {analysis.conjugateStr}
            </span>
          </div>
        </div>
      </div>

      {/* Argand Plane Canvas Stage */}
      <div className="lg:col-span-7 flex flex-col gap-4">
        <div className="p-5 bg-axiom-surface rounded-sm border border-axiom-border flex flex-col gap-4 transition-colors">
          <div className="flex items-center justify-between">
            <span className="font-sans text-xs font-semibold text-axiom-primary">
              Argand Diagram
            </span>

            {/* View mode toggle */}
            <div className="flex items-center gap-1 text-xs font-sans">
              <button
                onClick={() => setViewMode('standard')}
                className={`px-2.5 py-0.5 rounded-sm transition-colors ${
                  viewMode === 'standard'
                    ? 'bg-axiom-accent text-axiom-accent-text font-medium'
                    : 'bg-axiom-sub text-axiom-secondary'
                }`}
              >
                Vector
              </button>
              <button
                onClick={() => setViewMode('powers')}
                className={`px-2.5 py-0.5 rounded-sm transition-colors ${
                  viewMode === 'powers'
                    ? 'bg-axiom-accent text-axiom-accent-text font-medium'
                    : 'bg-axiom-sub text-axiom-secondary'
                }`}
              >
                Powers
              </button>
              <button
                onClick={() => setViewMode('roots')}
                className={`px-2.5 py-0.5 rounded-sm transition-colors ${
                  viewMode === 'roots'
                    ? 'bg-axiom-accent text-axiom-accent-text font-medium'
                    : 'bg-axiom-sub text-axiom-secondary'
                }`}
              >
                Roots
              </button>
            </div>
          </div>

          {/* Canvas Viewport */}
          <div className="relative w-full aspect-square max-h-[440px] bg-axiom-surface rounded-sm overflow-hidden border border-axiom-border flex items-center justify-center transition-colors">
            <canvas
              ref={canvasRef}
              width={520}
              height={520}
              onMouseDown={(e) => {
                isDraggingRef.current = true;
                handleCanvasInteraction(e);
              }}
              onMouseMove={(e) => {
                if (isDraggingRef.current) handleCanvasInteraction(e);
              }}
              onMouseUp={() => {
                isDraggingRef.current = false;
              }}
              onMouseLeave={() => {
                isDraggingRef.current = false;
              }}
              className="w-full h-full cursor-crosshair"
            />
          </div>

          {/* Slider controls */}
          {viewMode === 'powers' && (
            <div className="flex items-center justify-between text-xs font-sans p-2 bg-axiom-bg rounded-sm border border-axiom-border transition-colors">
              <span className="text-axiom-secondary">Powers to track (n = 1 .. {powersN}):</span>
              <input
                type="range"
                min="2"
                max="8"
                value={powersN}
                onChange={(e) => setPowersN(parseInt(e.target.value))}
                className="w-32 accent-axiom-accent"
              />
            </div>
          )}

          {viewMode === 'roots' && (
            <div className="flex items-center justify-between text-xs font-sans p-2 bg-axiom-bg rounded-sm border border-axiom-border transition-colors">
              <span className="text-axiom-secondary">Roots of Unity Order (n = {rootsN}):</span>
              <input
                type="range"
                min="3"
                max="12"
                value={rootsN}
                onChange={(e) => setRootsN(parseInt(e.target.value))}
                className="w-32 accent-axiom-accent"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
