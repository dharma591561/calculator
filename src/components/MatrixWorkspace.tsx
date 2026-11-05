import React, { useState } from 'react';
import { matrixEngine, MatrixAnalysis, LinearSystemResult } from '../services/matrixEngine';
import { sound } from '../services/audioFeedback';
import { ArrowLeftRight, Sparkles } from 'lucide-react';

export const MatrixWorkspace: React.FC = () => {
  // Matrix A state
  const [rowsA, setRowsA] = useState(3);
  const [colsA, setColsA] = useState(3);
  const [matA, setMatA] = useState<number[][]>([
    [1, 2, -1],
    [2, 0, 1],
    [1, -1, 1],
  ]);

  // Matrix B state
  const [rowsB, setRowsB] = useState(3);
  const [colsB, setColsB] = useState(3);
  const [matB, setMatB] = useState<number[][]>([
    [2, 1, 0],
    [0, 1, -1],
    [1, 0, 2],
  ]);

  // Scalar factor k
  const [scalarK, setScalarK] = useState(2);

  // Vector b for Ax = b
  const [vecB, setVecB] = useState<number[]>([4, 1, -1]);

  // 3D Vectors
  const [vecU, setVecU] = useState({ x: 1, y: 2, z: 3 });
  const [vecV, setVecV] = useState({ x: 4, y: 5, z: 6 });

  // Calculation output state
  const [activeTab, setActiveTab] = useState<'matrixOps' | 'systemSolver' | 'vectors'>('matrixOps');
  const [resultMatrix, setResultMatrix] = useState<number[][] | null>(null);
  const [resultLabel, setResultLabel] = useState<string>('');
  const [analysisA, setAnalysisA] = useState<MatrixAnalysis | null>(null);
  const [systemResult, setSystemResult] = useState<LinearSystemResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Cell change handlers
  const handleCellChangeA = (r: number, c: number, val: string) => {
    const num = parseFloat(val) || 0;
    const next = matA.map((row, i) =>
      row.map((cell, j) => (i === r && j === c ? num : cell))
    );
    setMatA(next);
  };

  const handleCellChangeB = (r: number, c: number, val: string) => {
    const num = parseFloat(val) || 0;
    const next = matB.map((row, i) =>
      row.map((cell, j) => (i === r && j === c ? num : cell))
    );
    setMatB(next);
  };

  // Resize Matrix A
  const handleResizeA = (newR: number, newC: number) => {
    setRowsA(newR);
    setColsA(newC);
    const next = matrixEngine.createEmpty(newR, newC);
    for (let i = 0; i < newR; i++) {
      for (let j = 0; j < newC; j++) {
        if (i < matA.length && j < matA[0].length) {
          next[i][j] = matA[i][j];
        }
      }
    }
    setMatA(next);
    if (vecB.length !== newR) {
      const nextB = Array.from({ length: newR }, (_, idx) => vecB[idx] || 0);
      setVecB(nextB);
    }
  };

  // Resize Matrix B
  const handleResizeB = (newR: number, newC: number) => {
    setRowsB(newR);
    setColsB(newC);
    const next = matrixEngine.createEmpty(newR, newC);
    for (let i = 0; i < newR; i++) {
      for (let j = 0; j < newC; j++) {
        if (i < matB.length && j < matB[0].length) {
          next[i][j] = matB[i][j];
        }
      }
    }
    setMatB(next);
  };

  // Presets
  const applyPresetA = (type: 'identity' | 'zero' | 'random' | 'symmetric') => {
    sound.playKeyClick('action');
    if (type === 'identity') {
      const n = Math.min(rowsA, colsA);
      setMatA(matrixEngine.createIdentity(n));
      setRowsA(n);
      setColsA(n);
    } else if (type === 'zero') {
      setMatA(matrixEngine.createEmpty(rowsA, colsA, 0));
    } else if (type === 'random') {
      const next = matA.map((row) =>
        row.map(() => Math.floor(Math.random() * 11) - 5)
      );
      setMatA(next);
    } else if (type === 'symmetric') {
      const n = Math.min(rowsA, colsA);
      const next = matrixEngine.createEmpty(n, n);
      for (let i = 0; i < n; i++) {
        for (let j = i; j < n; j++) {
          const val = Math.floor(Math.random() * 9) + 1;
          next[i][j] = val;
          next[j][i] = val;
        }
      }
      setMatA(next);
      setRowsA(n);
      setColsA(n);
    }
  };

  const handleSwapAB = () => {
    sound.playKeyClick('action');
    const tempMat = matA;
    const tempR = rowsA;
    const tempC = colsA;
    setMatA(matB);
    setRowsA(rowsB);
    setColsA(colsB);
    setMatB(tempMat);
    setRowsB(tempR);
    setColsB(tempC);
  };

  // Operations
  const runOperation = (op: 'add' | 'sub' | 'mul' | 'scalar' | 'detA' | 'invA' | 'transA' | 'rrefA' | 'traceA' | 'analyzeA') => {
    sound.playKeyClick('action');
    setErrorMessage(null);
    try {
      if (op === 'add') {
        const res = matrixEngine.add(matA, matB);
        setResultMatrix(res);
        setResultLabel('A + B');
      } else if (op === 'sub') {
        const res = matrixEngine.subtract(matA, matB);
        setResultMatrix(res);
        setResultLabel('A − B');
      } else if (op === 'mul') {
        const res = matrixEngine.multiply(matA, matB);
        setResultMatrix(res);
        setResultLabel('A × B');
      } else if (op === 'scalar') {
        const res = matrixEngine.scalarMultiply(scalarK, matA);
        setResultMatrix(res);
        setResultLabel(`${scalarK} · A`);
      } else if (op === 'transA') {
        const res = matrixEngine.transpose(matA);
        setResultMatrix(res);
        setResultLabel('Aᵀ');
      } else if (op === 'invA') {
        const res = matrixEngine.inverse(matA);
        if (!res) {
          setErrorMessage('Matrix A is singular (determinant = 0); non-invertible.');
        } else {
          setResultMatrix(res);
          setResultLabel('A⁻¹');
        }
      } else if (op === 'rrefA') {
        const { rref, rank } = matrixEngine.rrefAndRank(matA);
        setResultMatrix(rref);
        setResultLabel(`RREF(A) · Rank = ${rank}`);
      } else if (op === 'analyzeA') {
        const analysis = matrixEngine.analyzeMatrix(matA);
        setAnalysisA(analysis);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Operation failed');
    }
  };

  const handleSolveSystem = () => {
    sound.playKeyClick('action');
    setErrorMessage(null);
    try {
      const res = matrixEngine.solveLinearSystem(matA, vecB);
      setSystemResult(res);
    } catch (err: any) {
      setErrorMessage(err.message || 'Solver failed');
    }
  };

  const dotUV = matrixEngine.vectorDot(vecU, vecV);
  const crossUV = matrixEngine.vectorCross(vecU, vecV);
  const normU = matrixEngine.vectorNorm(vecU);
  const normV = matrixEngine.vectorNorm(vecV);
  const angleUV = matrixEngine.vectorAngleDeg(vecU, vecV);

  return (
    <div className="flex flex-col gap-5">
      {/* Workspace Segmented Tabs */}
      <div className="flex items-center gap-1 p-1 bg-axiom-sub rounded-sm border border-axiom-border text-xs font-sans w-fit transition-colors">
        <button
          onClick={() => setActiveTab('matrixOps')}
          className={`py-1 px-3 rounded-sm transition-colors ${
            activeTab === 'matrixOps'
              ? 'bg-axiom-surface text-axiom-primary font-semibold shadow-xs'
              : 'text-axiom-secondary hover:text-axiom-primary'
          }`}
        >
          Matrix Operations
        </button>
        <button
          onClick={() => setActiveTab('systemSolver')}
          className={`py-1 px-3 rounded-sm transition-colors ${
            activeTab === 'systemSolver'
              ? 'bg-axiom-surface text-axiom-primary font-semibold shadow-xs'
              : 'text-axiom-secondary hover:text-axiom-primary'
          }`}
        >
          Linear System (Ax = b)
        </button>
        <button
          onClick={() => setActiveTab('vectors')}
          className={`py-1 px-3 rounded-sm transition-colors ${
            activeTab === 'vectors'
              ? 'bg-axiom-surface text-axiom-primary font-semibold shadow-xs'
              : 'text-axiom-secondary hover:text-axiom-primary'
          }`}
        >
          Vector Algebra
        </button>
      </div>

      {/* MATRIX OPERATIONS TAB */}
      {activeTab === 'matrixOps' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* MATRIX A */}
          <div className="p-5 bg-axiom-surface rounded-sm border border-axiom-border flex flex-col gap-4 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-sans text-sm font-semibold text-axiom-primary">
                  Matrix A
                </span>
                <span className="text-[11px] font-mono text-axiom-secondary">
                  [{rowsA} × {colsA}]
                </span>
              </div>

              {/* Dimension Selector */}
              <div className="flex items-center gap-1.5 text-xs font-sans">
                <span className="text-axiom-secondary">Dimension:</span>
                <select
                  value={`${rowsA}x${colsA}`}
                  onChange={(e) => {
                    const [r, c] = e.target.value.split('x').map(Number);
                    handleResizeA(r, c);
                  }}
                  className="px-2 py-0.5 bg-axiom-bg border border-axiom-border rounded-sm text-axiom-primary text-xs font-mono transition-colors"
                >
                  <option value="2x2">2 × 2</option>
                  <option value="3x3">3 × 3</option>
                  <option value="4x4">4 × 4</option>
                  <option value="2x3">2 × 3</option>
                  <option value="3x2">3 × 2</option>
                </select>
              </div>
            </div>

            {/* Presets */}
            <div className="flex items-center gap-1 text-xs font-sans text-axiom-secondary">
              <span className="text-[11px] mr-1">Preset:</span>
              <button
                onClick={() => applyPresetA('identity')}
                className="px-2 py-0.5 rounded-sm border border-axiom-border bg-axiom-bg hover:bg-axiom-sub text-axiom-primary transition-colors"
              >
                Identity
              </button>
              <button
                onClick={() => applyPresetA('random')}
                className="px-2 py-0.5 rounded-sm border border-axiom-border bg-axiom-bg hover:bg-axiom-sub text-axiom-primary transition-colors"
              >
                Random
              </button>
              <button
                onClick={() => applyPresetA('symmetric')}
                className="px-2 py-0.5 rounded-sm border border-axiom-border bg-axiom-bg hover:bg-axiom-sub text-axiom-primary transition-colors"
              >
                Symmetric
              </button>
              <button
                onClick={() => applyPresetA('zero')}
                className="px-2 py-0.5 rounded-sm border border-axiom-border bg-axiom-bg hover:bg-axiom-sub text-axiom-secondary transition-colors"
              >
                Clear
              </button>
            </div>

            {/* Matrix A Grid Enclosure */}
            <div className="p-4 bg-axiom-bg rounded-sm border border-axiom-border flex items-center justify-center transition-colors">
              <div className="relative px-3 py-1 border-l-2 border-r-2 border-axiom-secondary">
                <div
                  className="grid gap-2"
                  style={{
                    gridTemplateColumns: `repeat(${colsA}, minmax(44px, 56px))`,
                  }}
                >
                  {matA.map((row, r) =>
                    row.map((cell, c) => (
                      <input
                        key={`A-${r}-${c}`}
                        type="number"
                        step="any"
                        value={cell}
                        onChange={(e) => handleCellChangeA(r, c, e.target.value)}
                        className="w-full text-center py-1.5 px-1 text-xs font-mono bg-axiom-surface border border-axiom-border rounded-sm text-axiom-primary font-medium focus:outline-none focus:border-axiom-accent transition-colors"
                      />
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Operations Toolbar */}
            <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-axiom-border text-xs font-mono">
              <button
                onClick={() => runOperation('detA')}
                className="px-2.5 py-1 rounded-sm bg-axiom-sub hover:bg-axiom-border text-axiom-primary border border-axiom-border font-medium transition-colors"
              >
                det(A)
              </button>
              <button
                onClick={() => runOperation('invA')}
                className="px-2.5 py-1 rounded-sm bg-axiom-sub hover:bg-axiom-border text-axiom-primary border border-axiom-border font-medium transition-colors"
              >
                A⁻¹
              </button>
              <button
                onClick={() => runOperation('transA')}
                className="px-2.5 py-1 rounded-sm bg-axiom-sub hover:bg-axiom-border text-axiom-primary border border-axiom-border font-medium transition-colors"
              >
                Aᵀ
              </button>
              <button
                onClick={() => runOperation('rrefA')}
                className="px-2.5 py-1 rounded-sm bg-axiom-sub hover:bg-axiom-border text-axiom-primary border border-axiom-border font-medium transition-colors"
              >
                RREF
              </button>
              <button
                onClick={() => runOperation('analyzeA')}
                className="px-2.5 py-1 rounded-sm bg-axiom-accent/15 text-axiom-accent hover:bg-axiom-accent/25 border border-axiom-accent/40 font-medium transition-colors ml-auto"
              >
                Diagnostics
              </button>
            </div>
          </div>

          {/* MATRIX B */}
          <div className="p-5 bg-axiom-surface rounded-sm border border-axiom-border flex flex-col gap-4 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-sans text-sm font-semibold text-axiom-primary">
                  Matrix B
                </span>
                <span className="text-[11px] font-mono text-axiom-secondary">
                  [{rowsB} × {colsB}]
                </span>
              </div>

              {/* Swap A and B */}
              <button
                onClick={handleSwapAB}
                title="Swap Matrix A and Matrix B"
                className="flex items-center gap-1 px-2.5 py-0.5 rounded-sm border border-axiom-border bg-axiom-bg hover:bg-axiom-sub text-axiom-primary text-xs font-sans transition-colors"
              >
                <ArrowLeftRight className="w-3 h-3 text-axiom-secondary" />
                <span>Swap A ↔ B</span>
              </button>
            </div>

            {/* Presets and Size for B */}
            <div className="flex items-center justify-between text-xs font-sans">
              <div className="flex items-center gap-1.5">
                <span className="text-axiom-secondary">Dimension:</span>
                <select
                  value={`${rowsB}x${colsB}`}
                  onChange={(e) => {
                    const [r, c] = e.target.value.split('x').map(Number);
                    handleResizeB(r, c);
                  }}
                  className="px-2 py-0.5 bg-axiom-bg border border-axiom-border rounded-sm text-axiom-primary text-xs font-mono transition-colors"
                >
                  <option value="2x2">2 × 2</option>
                  <option value="3x3">3 × 3</option>
                  <option value="4x4">4 × 4</option>
                  <option value="2x3">2 × 3</option>
                  <option value="3x2">3 × 2</option>
                </select>
              </div>

              <button
                onClick={() => setMatB(matrixEngine.createEmpty(rowsB, colsB, 0))}
                className="px-2 py-0.5 rounded-sm border border-axiom-border bg-axiom-bg text-axiom-secondary hover:text-axiom-primary transition-colors text-xs"
              >
                Clear B
              </button>
            </div>

            {/* Matrix B Grid Enclosure */}
            <div className="p-4 bg-axiom-bg rounded-sm border border-axiom-border flex items-center justify-center transition-colors">
              <div className="relative px-3 py-1 border-l-2 border-r-2 border-axiom-secondary">
                <div
                  className="grid gap-2"
                  style={{
                    gridTemplateColumns: `repeat(${colsB}, minmax(44px, 56px))`,
                  }}
                >
                  {matB.map((row, r) =>
                    row.map((cell, c) => (
                      <input
                        key={`B-${r}-${c}`}
                        type="number"
                        step="any"
                        value={cell}
                        onChange={(e) => handleCellChangeB(r, c, e.target.value)}
                        className="w-full text-center py-1.5 px-1 text-xs font-mono bg-axiom-surface border border-axiom-border rounded-sm text-axiom-primary font-medium focus:outline-none focus:border-axiom-accent transition-colors"
                      />
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Binary Matrix Operations Toolbar */}
            <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-axiom-border text-xs font-mono">
              <button
                onClick={() => runOperation('add')}
                className="px-3 py-1 rounded-sm bg-axiom-sub hover:bg-axiom-border text-axiom-primary font-medium border border-axiom-border transition-colors"
              >
                A + B
              </button>
              <button
                onClick={() => runOperation('sub')}
                className="px-3 py-1 rounded-sm bg-axiom-sub hover:bg-axiom-border text-axiom-primary font-medium border border-axiom-border transition-colors"
              >
                A − B
              </button>
              <button
                onClick={() => runOperation('mul')}
                className="px-3 py-1 rounded-sm bg-axiom-accent hover:bg-axiom-accent-hover text-axiom-accent-text font-medium border border-axiom-accent transition-colors"
              >
                A × B
              </button>

              <div className="flex items-center gap-1 ml-auto">
                <span className="text-axiom-secondary">k:</span>
                <input
                  type="number"
                  value={scalarK}
                  onChange={(e) => setScalarK(parseFloat(e.target.value) || 0)}
                  className="w-12 px-1 py-0.5 rounded-sm bg-axiom-bg border border-axiom-border text-center text-xs text-axiom-primary transition-colors"
                />
                <button
                  onClick={() => runOperation('scalar')}
                  className="px-2 py-0.5 rounded-sm border border-axiom-border bg-axiom-sub hover:bg-axiom-border text-axiom-primary font-medium transition-colors"
                >
                  k·A
                </button>
              </div>
            </div>
          </div>

          {/* ERROR ALERT */}
          {errorMessage && (
            <div className="lg:col-span-2 p-3 rounded-sm bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-mono">
              {errorMessage}
            </div>
          )}

          {/* RESULT MATRIX CARD */}
          {resultMatrix && (
            <div className="lg:col-span-2 p-5 bg-axiom-surface rounded-sm border border-axiom-border flex flex-col gap-3 transition-colors">
              <div className="flex items-center justify-between border-b border-axiom-border pb-2">
                <span className="font-sans text-xs font-semibold text-axiom-primary">
                  Output: {resultLabel}
                </span>
                <span className="text-[11px] font-mono text-axiom-secondary">
                  [{resultMatrix.length} × {resultMatrix[0].length}]
                </span>
              </div>

              <div className="flex items-center justify-center p-4 bg-axiom-bg rounded-sm border border-axiom-border transition-colors">
                <div className="relative px-3 py-1 border-l-2 border-r-2 border-axiom-secondary">
                  <div
                    className="grid gap-2"
                    style={{
                      gridTemplateColumns: `repeat(${resultMatrix[0].length}, minmax(50px, 64px))`,
                    }}
                  >
                    {resultMatrix.map((row, r) =>
                      row.map((cell, c) => (
                        <div
                          key={`res-${r}-${c}`}
                          className="py-1.5 px-1 text-center font-mono font-medium text-xs bg-axiom-surface border border-axiom-border rounded-sm text-axiom-primary select-text transition-colors"
                        >
                          {cell}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MATRIX A FULL DIAGNOSTICS */}
          {analysisA && (
            <div className="lg:col-span-2 p-5 bg-axiom-surface rounded-sm border border-axiom-border flex flex-col gap-4 transition-colors">
              <div className="flex items-center gap-2 border-b border-axiom-border pb-2">
                <Sparkles className="w-3.5 h-3.5 text-axiom-accent" />
                <span className="font-semibold text-xs text-axiom-primary font-sans">
                  Matrix A Analytical Diagnostics
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
                <div className="p-3 bg-axiom-bg rounded-sm border border-axiom-border transition-colors">
                  <div className="text-axiom-secondary text-[10px] uppercase mb-1">DETERMINANT</div>
                  <div className="text-base font-semibold text-axiom-primary">
                    {analysisA.determinant !== undefined ? analysisA.determinant : 'N/A'}
                  </div>
                </div>

                <div className="p-3 bg-axiom-bg rounded-sm border border-axiom-border transition-colors">
                  <div className="text-axiom-secondary text-[10px] uppercase mb-1">TRACE</div>
                  <div className="text-base font-semibold text-axiom-primary">
                    {analysisA.trace !== undefined ? analysisA.trace : 'N/A'}
                  </div>
                </div>

                <div className="p-3 bg-axiom-bg rounded-sm border border-axiom-border transition-colors">
                  <div className="text-axiom-secondary text-[10px] uppercase mb-1">RANK</div>
                  <div className="text-base font-semibold text-axiom-primary">
                    {analysisA.rank}
                  </div>
                </div>

                <div className="p-3 bg-axiom-bg rounded-sm border border-axiom-border transition-colors">
                  <div className="text-axiom-secondary text-[10px] uppercase mb-1">INVERTIBILITY</div>
                  <div className={`text-base font-semibold ${analysisA.isInvertible ? 'text-axiom-accent' : 'text-axiom-secondary'}`}>
                    {analysisA.isInvertible ? 'Invertible' : 'Singular'}
                  </div>
                </div>
              </div>

              {analysisA.eigenvalues && (
                <div className="p-2.5 bg-axiom-bg rounded-sm border border-axiom-border text-xs font-mono flex items-center justify-between transition-colors">
                  <span className="text-axiom-secondary text-[11px]">EIGENVALUES (λ):</span>
                  <span className="font-semibold text-axiom-primary">
                    {analysisA.eigenvalues.join(', ')}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* LINEAR SYSTEM SOLVER TAB */}
      {activeTab === 'systemSolver' && (
        <div className="p-5 bg-axiom-surface rounded-sm border border-axiom-border flex flex-col gap-5 transition-colors">
          <div className="border-b border-axiom-border pb-3">
            <h3 className="text-sm font-semibold text-axiom-primary font-sans">
              System of Linear Equations: A · x = b
            </h3>
            <p className="text-xs text-axiom-secondary mt-0.5">
              Gauss-Jordan resolution for simultaneous coordinate vector x.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 p-4 bg-axiom-bg rounded-sm border border-axiom-border transition-colors">
            {/* Matrix A visual */}
            <div className="flex flex-col items-center gap-1.5">
              <span className="text-[11px] font-sans text-axiom-secondary">Matrix A</span>
              <div className="relative px-2.5 py-1 border-l-2 border-r-2 border-axiom-secondary bg-axiom-surface rounded-sm">
                <div
                  className="grid gap-1.5"
                  style={{
                    gridTemplateColumns: `repeat(${colsA}, minmax(40px, 50px))`,
                  }}
                >
                  {matA.map((row, r) =>
                    row.map((cell, c) => (
                      <input
                        key={`sol-A-${r}-${c}`}
                        type="number"
                        step="any"
                        value={cell}
                        onChange={(e) => handleCellChangeA(r, c, e.target.value)}
                        className="w-full text-center py-1 text-xs font-mono bg-axiom-bg border border-axiom-border rounded-sm font-medium text-axiom-primary transition-colors"
                      />
                    ))
                  )}
                </div>
              </div>
            </div>

            <span className="font-mono text-base text-axiom-secondary">·</span>

            {/* Vector x */}
            <div className="flex flex-col items-center gap-1.5">
              <span className="text-[11px] font-sans text-axiom-secondary">Vector x</span>
              <div className="flex flex-col gap-1 px-2 py-1 border-l-2 border-r-2 border-axiom-secondary bg-axiom-sub rounded-sm">
                {Array.from({ length: rowsA }).map((_, i) => (
                  <div
                    key={`x-${i}`}
                    className="w-10 h-7 flex items-center justify-center font-mono text-xs text-axiom-secondary"
                  >
                    x_{i + 1}
                  </div>
                ))}
              </div>
            </div>

            <span className="font-mono text-base text-axiom-secondary">=</span>

            {/* Vector b */}
            <div className="flex flex-col items-center gap-1.5">
              <span className="text-[11px] font-sans text-axiom-secondary">Vector b</span>
              <div className="flex flex-col gap-1 px-2 py-1 border-l-2 border-r-2 border-axiom-secondary bg-axiom-surface rounded-sm">
                {vecB.map((val, i) => (
                  <input
                    key={`b-${i}`}
                    type="number"
                    step="any"
                    value={val}
                    onChange={(e) => {
                      const num = parseFloat(e.target.value) || 0;
                      const next = [...vecB];
                      next[i] = num;
                      setVecB(next);
                    }}
                    className="w-12 text-center py-1 text-xs font-mono bg-axiom-bg border border-axiom-border rounded-sm font-medium text-axiom-primary transition-colors"
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleSolveSystem}
              className="px-5 py-2 rounded-sm bg-axiom-accent hover:bg-axiom-accent-hover text-axiom-accent-text font-medium text-xs font-sans transition-colors"
            >
              Solve System
            </button>
          </div>

          {systemResult && (
            <div className="p-4 bg-axiom-bg rounded-sm border border-axiom-border flex flex-col gap-3 transition-colors">
              <div className="flex items-center justify-between border-b border-axiom-border pb-2">
                <span className="font-sans text-xs text-axiom-primary font-semibold">
                  Resolution Diagnostic
                </span>
                <span
                  className={`px-2 py-0.5 rounded-sm text-[10px] font-mono font-medium ${
                    systemResult.solutionType === 'unique'
                      ? 'bg-axiom-accent/15 text-axiom-accent border border-axiom-accent/40'
                      : 'bg-axiom-sub text-axiom-secondary border border-axiom-border'
                  }`}
                >
                  {systemResult.solutionType} Solution
                </span>
              </div>

              {systemResult.solution && (
                <div className="flex items-center justify-center p-3 bg-axiom-surface rounded-sm border border-axiom-border font-mono text-sm transition-colors">
                  <div className="flex items-center gap-5">
                    {systemResult.solution.map((val, idx) => (
                      <div key={idx} className="flex items-center gap-1.5">
                        <span className="text-axiom-secondary">x_{idx + 1} =</span>
                        <span className="font-semibold text-axiom-primary">
                          {val}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-1 text-xs font-mono text-axiom-secondary">
                {systemResult.steps.map((step, idx) => (
                  <div key={idx} className="p-1.5 rounded-sm bg-axiom-surface border border-axiom-border transition-colors">
                    {step}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3D VECTOR ALGEBRA TAB */}
      {activeTab === 'vectors' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Vector inputs */}
          <div className="p-5 bg-axiom-surface rounded-sm border border-axiom-border flex flex-col gap-4 transition-colors">
            <h3 className="font-sans text-xs font-semibold text-axiom-primary">
              3D Vector Definition
            </h3>

            {/* Vector u */}
            <div className="p-3 bg-axiom-bg rounded-sm border border-axiom-border flex items-center justify-between transition-colors">
              <span className="font-mono text-xs font-semibold text-axiom-primary">Vector u</span>
              <div className="flex items-center gap-1.5 font-mono text-xs">
                <span className="text-axiom-secondary">x:</span>
                <input
                  type="number"
                  value={vecU.x}
                  onChange={(e) => setVecU({ ...vecU, x: parseFloat(e.target.value) || 0 })}
                  className="w-12 py-1 bg-axiom-surface border border-axiom-border rounded-sm text-center text-axiom-primary transition-colors"
                />
                <span className="text-axiom-secondary">y:</span>
                <input
                  type="number"
                  value={vecU.y}
                  onChange={(e) => setVecU({ ...vecU, y: parseFloat(e.target.value) || 0 })}
                  className="w-12 py-1 bg-axiom-surface border border-axiom-border rounded-sm text-center text-axiom-primary transition-colors"
                />
                <span className="text-axiom-secondary">z:</span>
                <input
                  type="number"
                  value={vecU.z}
                  onChange={(e) => setVecU({ ...vecU, z: parseFloat(e.target.value) || 0 })}
                  className="w-12 py-1 bg-axiom-surface border border-axiom-border rounded-sm text-center text-axiom-primary transition-colors"
                />
              </div>
            </div>

            {/* Vector v */}
            <div className="p-3 bg-axiom-bg rounded-sm border border-axiom-border flex items-center justify-between transition-colors">
              <span className="font-mono text-xs font-semibold text-axiom-primary">Vector v</span>
              <div className="flex items-center gap-1.5 font-mono text-xs">
                <span className="text-axiom-secondary">x:</span>
                <input
                  type="number"
                  value={vecV.x}
                  onChange={(e) => setVecV({ ...vecV, x: parseFloat(e.target.value) || 0 })}
                  className="w-12 py-1 bg-axiom-surface border border-axiom-border rounded-sm text-center text-axiom-primary transition-colors"
                />
                <span className="text-axiom-secondary">y:</span>
                <input
                  type="number"
                  value={vecV.y}
                  onChange={(e) => setVecV({ ...vecV, y: parseFloat(e.target.value) || 0 })}
                  className="w-12 py-1 bg-axiom-surface border border-axiom-border rounded-sm text-center text-axiom-primary transition-colors"
                />
                <span className="text-axiom-secondary">z:</span>
                <input
                  type="number"
                  value={vecV.z}
                  onChange={(e) => setVecV({ ...vecV, z: parseFloat(e.target.value) || 0 })}
                  className="w-12 py-1 bg-axiom-surface border border-axiom-border rounded-sm text-center text-axiom-primary transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Vector Results */}
          <div className="p-5 bg-axiom-surface rounded-sm border border-axiom-border flex flex-col gap-3 font-mono text-xs transition-colors">
            <h3 className="font-sans text-xs font-semibold text-axiom-primary">
              Vector Algebra Products
            </h3>

            <div className="space-y-2">
              <div className="p-2.5 rounded-sm bg-axiom-bg border border-axiom-border flex items-center justify-between transition-colors">
                <span className="text-axiom-secondary">DOT PRODUCT (u · v)</span>
                <span className="font-semibold text-axiom-primary">{dotUV}</span>
              </div>

              <div className="p-2.5 rounded-sm bg-axiom-bg border border-axiom-border flex items-center justify-between transition-colors">
                <span className="text-axiom-secondary">CROSS PRODUCT (u × v)</span>
                <span className="font-semibold text-axiom-primary">
                  ({crossUV.x}, {crossUV.y}, {crossUV.z})
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-sm bg-axiom-bg border border-axiom-border transition-colors">
                  <div className="text-axiom-secondary text-[10px] mb-0.5">NORM ||u||</div>
                  <div className="font-semibold text-axiom-primary">{normU}</div>
                </div>

                <div className="p-2.5 rounded-sm bg-axiom-bg border border-axiom-border transition-colors">
                  <div className="text-axiom-secondary text-[10px] mb-0.5">NORM ||v||</div>
                  <div className="font-semibold text-axiom-primary">{normV}</div>
                </div>
              </div>

              <div className="p-2.5 rounded-sm bg-axiom-bg border border-axiom-border flex items-center justify-between transition-colors">
                <span className="text-axiom-secondary">ANGLE θ</span>
                <span className="font-semibold text-axiom-primary">
                  {angleUV}°
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
