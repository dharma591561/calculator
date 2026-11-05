import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AngleUnit, CalculatorTab, CalculationItem, MemoryState } from './types';
import { mathEngine, EvalResult } from './services/mathEngine';
import { sound } from './services/audioFeedback';
import { ThemeProvider } from './context/ThemeContext';
import { TopNav } from './components/TopNav';
import { CalculatorDisplay } from './components/CalculatorDisplay';
import { Keypad } from './components/Keypad';
import { HistoryTape } from './components/HistoryTape';
import { MatrixWorkspace } from './components/MatrixWorkspace';
import { ComplexWorkspace } from './components/ComplexWorkspace';
import { CalculusWorkspace } from './components/CalculusWorkspace';
import { ConstantsCatalog } from './components/ConstantsCatalog';
import { AiExplainerModal } from './components/AiExplainerModal';
import { KeyboardGuideModal } from './components/KeyboardGuideModal';

export default function App() {
  return (
    <ThemeProvider>
      <AxiomCalculatorApp />
    </ThemeProvider>
  );
}

function AxiomCalculatorApp() {
  const [activeTab, setActiveTab] = useState<CalculatorTab>('workstation');
  const [expression, setExpression] = useState<string>('cos(45) * sqrt(16)');
  const [angleUnit, setAngleUnit] = useState<AngleUnit>(() => {
    return (localStorage.getItem('axiom_angle_unit') as AngleUnit) || 'DEG';
  });
  const [precision, setPrecision] = useState<number>(() => {
    return parseInt(localStorage.getItem('axiom_precision') || '8', 10);
  });

  // Memory registers
  const [memory, setMemory] = useState<MemoryState>(() => {
    const saved = localStorage.getItem('axiom_memory');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return { M: 0, x: 0, y: 0, z: 0, ans: '0' };
  });

  // Calculation History
  const [historyItems, setHistoryItems] = useState<CalculationItem[]>(() => {
    const saved = localStorage.getItem('axiom_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return [
      {
        id: 'init-1',
        timestamp: Date.now() - 1000 * 60 * 12,
        expression: 'e^(i * pi) + 1',
        result: '0',
        latex: 'e^{i\\pi} + 1 = 0',
        type: 'complex',
        starred: true,
        angleUnit: 'RAD',
      },
      {
        id: 'init-2',
        timestamp: Date.now() - 1000 * 60 * 5,
        expression: 'sqrt(-16)',
        result: '4i',
        latex: '\\sqrt{-16} = 4i',
        type: 'complex',
        starred: false,
        angleUnit: 'DEG',
      },
    ];
  });

  // Modals state
  const [isAiExplainerOpen, setIsAiExplainerOpen] = useState(false);
  const [isKeyboardGuideOpen, setIsKeyboardGuideOpen] = useState(false);

  // Live evaluation memo
  const liveEvaluation: EvalResult = useMemo(() => {
    if (!expression.trim()) {
      return {
        success: true,
        raw: 0,
        formatted: '0',
        type: 'scalar',
      };
    }
    return mathEngine.evaluate(expression, angleUnit, precision, {
      ans: memory.ans,
      M: memory.M,
      x: memory.x,
      y: memory.y,
      z: memory.z,
    });
  }, [expression, angleUnit, precision, memory]);

  // Persist settings
  useEffect(() => {
    localStorage.setItem('axiom_angle_unit', angleUnit);
  }, [angleUnit]);

  useEffect(() => {
    localStorage.setItem('axiom_precision', precision.toString());
  }, [precision]);

  useEffect(() => {
    localStorage.setItem('axiom_memory', JSON.stringify(memory));
  }, [memory]);

  useEffect(() => {
    localStorage.setItem('axiom_history', JSON.stringify(historyItems));
  }, [historyItems]);

  // Cycle angle unit
  const handleCycleAngleUnit = useCallback(() => {
    sound.playKeyClick('action');
    setAngleUnit((curr) => {
      if (curr === 'DEG') return 'RAD';
      if (curr === 'RAD') return 'GRAD';
      return 'DEG';
    });
  }, []);

  // Cycle precision
  const handleCyclePrecision = useCallback(() => {
    sound.playKeyClick('action');
    setPrecision((curr) => {
      if (curr === 4) return 8;
      if (curr === 8) return 12;
      if (curr === 12) return 16;
      return 4;
    });
  }, []);

  // Insert token into expression
  const handleInsert = useCallback((val: string) => {
    setExpression((prev) => {
      if (prev === '0' && val !== '.') {
        return val;
      }
      return prev + val;
    });
  }, []);

  // Clear All
  const handleClear = useCallback(() => {
    setExpression('');
  }, []);

  // Clear Entry (last term)
  const handleClearEntry = useCallback(() => {
    setExpression((prev) => {
      const trimmed = prev.trimEnd();
      const lastSpace = trimmed.lastIndexOf(' ');
      if (lastSpace >= 0) {
        return trimmed.slice(0, lastSpace).trimEnd();
      }
      return '';
    });
  }, []);

  // Backspace
  const handleBackspace = useCallback(() => {
    setExpression((prev) => {
      if (prev.endsWith(' ')) return prev.slice(0, -3);
      return prev.slice(0, -1);
    });
  }, []);

  // Toggle Sign
  const handleToggleSign = useCallback(() => {
    setExpression((prev) => {
      if (!prev) return '-';
      if (prev.startsWith('-(') && prev.endsWith(')')) {
        return prev.slice(2, -1);
      }
      return `-(${prev})`;
    });
  }, []);

  // Evaluate Expression
  const handleEvaluate = useCallback(() => {
    if (!expression.trim()) return;

    const res = mathEngine.evaluate(expression, angleUnit, precision, {
      ans: memory.ans,
      M: memory.M,
      x: memory.x,
      y: memory.y,
      z: memory.z,
    });

    if (res.success && res.formatted !== 'Error') {
      const newItem: CalculationItem = {
        id: `calc-${Date.now()}`,
        timestamp: Date.now(),
        expression,
        result: res.formatted,
        latex: res.latex,
        type: res.type,
        starred: false,
        angleUnit,
        precision,
      };

      setHistoryItems((prev) => [newItem, ...prev.slice(0, 199)]);
      setMemory((prev) => ({
        ...prev,
        ans: res.formatted,
      }));
    }
  }, [expression, angleUnit, precision, memory]);

  // Memory Operations
  const handleMemoryOp = useCallback((op: 'MC' | 'MR' | 'M+' | 'M-' | 'MS') => {
    if (op === 'MC') {
      setMemory((prev) => ({ ...prev, M: 0 }));
    } else if (op === 'MR') {
      setExpression((prev) => prev + String(memory.M));
    } else if (op === 'MS') {
      const currentNum = parseFloat(liveEvaluation.formatted) || 0;
      setMemory((prev) => ({ ...prev, M: currentNum }));
    } else if (op === 'M+') {
      const currentNum = parseFloat(liveEvaluation.formatted) || 0;
      setMemory((prev) => ({ ...prev, M: prev.M + currentNum }));
    } else if (op === 'M-') {
      const currentNum = parseFloat(liveEvaluation.formatted) || 0;
      setMemory((prev) => ({ ...prev, M: prev.M - currentNum }));
    }
  }, [memory.M, liveEvaluation.formatted]);

  // History Actions
  const handleSelectItem = useCallback((item: CalculationItem) => {
    setExpression(item.expression);
  }, []);

  const handleUseResult = useCallback((res: string) => {
    setExpression((prev) => prev + res);
  }, []);

  const handleToggleStar = useCallback((id: string) => {
    setHistoryItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, starred: !it.starred } : it))
    );
  }, []);

  const handleClearHistory = useCallback(() => {
    setHistoryItems([]);
  }, []);

  // Global Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is inside an input or textarea
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT')) {
        return;
      }

      if (e.key >= '0' && e.key <= '9') {
        sound.playKeyClick('number');
        handleInsert(e.key);
      } else if (e.key === '.') {
        sound.playKeyClick('number');
        handleInsert('.');
      } else if (e.key === '+') {
        sound.playKeyClick('operator');
        handleInsert(' + ');
      } else if (e.key === '-') {
        sound.playKeyClick('operator');
        handleInsert(' - ');
      } else if (e.key === '*') {
        sound.playKeyClick('operator');
        handleInsert(' * ');
      } else if (e.key === '/') {
        e.preventDefault();
        sound.playKeyClick('operator');
        handleInsert(' / ');
      } else if (e.key === '^') {
        sound.playKeyClick('operator');
        handleInsert('^');
      } else if (e.key === '(' || e.key === ')') {
        sound.playKeyClick('operator');
        handleInsert(e.key);
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        sound.playKeyClick('action');
        handleEvaluate();
      } else if (e.key === 'Backspace') {
        sound.playKeyClick('operator');
        handleBackspace();
      } else if (e.key === 'Escape') {
        sound.playKeyClick('clear');
        handleClear();
      } else if (e.key === 'p' || e.key === 'P') {
        sound.playKeyClick('number');
        handleInsert('pi');
      } else if (e.key === 'e' || e.key === 'E') {
        sound.playKeyClick('number');
        handleInsert('e');
      } else if (e.key === 'i') {
        sound.playKeyClick('number');
        handleInsert('i');
      } else if (e.key === 's') {
        sound.playKeyClick('operator');
        handleInsert('sin(');
      } else if (e.key === 'c') {
        sound.playKeyClick('operator');
        handleInsert('cos(');
      } else if (e.key === 't') {
        sound.playKeyClick('operator');
        handleInsert('tan(');
      } else if (e.key === 'l') {
        sound.playKeyClick('operator');
        handleInsert('ln(');
      } else if (e.key === '?') {
        setIsKeyboardGuideOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleInsert, handleEvaluate, handleBackspace, handleClear]);

  return (
    <div className="min-h-screen flex flex-col bg-axiom-bg text-axiom-primary transition-colors">
      {/* Top Header */}
      <TopNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenAiExplainer={() => setIsAiExplainerOpen(true)}
        onOpenKeyboardGuide={() => setIsKeyboardGuideOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-[1380px] mx-auto p-4 sm:p-6 flex flex-col gap-5">
        {/* TAB 1: WORKSTATION */}
        {activeTab === 'workstation' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Calculator Column (7 Cols on desktop) */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              {/* Display Box */}
              <CalculatorDisplay
                expression={expression}
                evaluatedResult={liveEvaluation.formatted}
                latexPreview={liveEvaluation.latex}
                error={liveEvaluation.error}
                angleUnit={angleUnit}
                onCycleAngleUnit={handleCycleAngleUnit}
                precision={precision}
                onCyclePrecision={handleCyclePrecision}
                hasMemory={memory.M !== 0}
                onAiExplain={() => setIsAiExplainerOpen(true)}
              />

              {/* Workstation Keypad */}
              <div className="p-4 sm:p-5 bg-axiom-surface rounded-md border border-axiom-border transition-colors">
                <Keypad
                  onInsert={handleInsert}
                  onClear={handleClear}
                  onClearEntry={handleClearEntry}
                  onBackspace={handleBackspace}
                  onEvaluate={handleEvaluate}
                  onToggleSign={handleToggleSign}
                  onMemoryOp={handleMemoryOp}
                  hasMemory={memory.M !== 0}
                  ansValue={memory.ans}
                />
              </div>
            </div>

            {/* Tape History Column (5 Cols on desktop) */}
            <div className="lg:col-span-5 h-[590px]">
              <HistoryTape
                items={historyItems}
                onSelectItem={handleSelectItem}
                onUseResult={handleUseResult}
                onToggleStar={handleToggleStar}
                onClearHistory={handleClearHistory}
              />
            </div>
          </div>
        )}

        {/* TAB 2: MATRICES & VECTORS */}
        {activeTab === 'matrices' && <MatrixWorkspace />}

        {/* TAB 3: COMPLEX & ARGAND PLANE */}
        {activeTab === 'complex' && <ComplexWorkspace />}

        {/* TAB 4: CALCULUS LAB */}
        {activeTab === 'calculus' && <CalculusWorkspace />}

        {/* TAB 5: PHYSICAL & MATHEMATICAL CONSTANTS */}
        {activeTab === 'constants' && (
          <ConstantsCatalog
            onInsertConstant={(val) => {
              setActiveTab('workstation');
              handleInsert(val);
            }}
          />
        )}
      </main>

      {/* AI Explainer Modal */}
      <AiExplainerModal
        isOpen={isAiExplainerOpen}
        onClose={() => setIsAiExplainerOpen(false)}
        expression={expression}
        result={liveEvaluation.formatted}
      />

      {/* Keyboard Shortcuts Modal */}
      <KeyboardGuideModal
        isOpen={isKeyboardGuideOpen}
        onClose={() => setIsKeyboardGuideOpen(false)}
      />

      {/* Minimalist Engineering Footer */}
      <footer className="py-3 px-6 border-t border-axiom-border bg-axiom-surface/50 text-center text-[11px] text-axiom-secondary flex items-center justify-center gap-2 transition-colors">
        <span className="font-medium tracking-wide">Axiom Math Studio · Precision Scientific Engine</span>
        <span>·</span>
        <span>Press <kbd className="px-1.5 py-0.5 rounded border border-axiom-border bg-axiom-sub text-axiom-primary font-mono text-[10px]">?</kbd> for hardware shortcuts</span>
      </footer>
    </div>
  );
}
