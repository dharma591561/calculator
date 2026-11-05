import React, { useState } from 'react';
import { sound } from '../services/audioFeedback';
import { Delete } from 'lucide-react';

interface KeypadProps {
  onInsert: (val: string) => void;
  onClear: () => void;
  onClearEntry: () => void;
  onBackspace: () => void;
  onEvaluate: () => void;
  onToggleSign: () => void;
  onMemoryOp: (op: 'MC' | 'MR' | 'M+' | 'M-' | 'MS') => void;
  hasMemory: boolean;
  ansValue: string;
}

export const Keypad: React.FC<KeypadProps> = ({
  onInsert,
  onClear,
  onClearEntry,
  onBackspace,
  onEvaluate,
  onToggleSign,
  onMemoryOp,
  hasMemory,
  ansValue,
}) => {
  const [subMode, setSubMode] = useState<'scientific' | 'trig' | 'complex' | 'calculus'>('scientific');
  const [isSecond, setIsSecond] = useState(false);

  const handleKey = (val: string, type: 'number' | 'operator' | 'action' = 'number') => {
    sound.playKeyClick(type);
    onInsert(val);
  };

  const handleMem = (op: 'MC' | 'MR' | 'M+' | 'M-' | 'MS') => {
    sound.playKeyClick('action');
    onMemoryOp(op);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Memory Utility Strip */}
      <div className="grid grid-cols-6 gap-1 p-1 bg-axiom-sub rounded-sm border border-axiom-border text-[11px] font-mono transition-colors">
        <button
          onClick={() => handleMem('MC')}
          disabled={!hasMemory}
          className={`py-1.5 rounded-sm transition-colors text-center ${
            hasMemory
              ? 'hover:bg-axiom-surface text-axiom-primary font-medium'
              : 'text-axiom-secondary/40 cursor-not-allowed'
          }`}
        >
          MC
        </button>
        <button
          onClick={() => handleMem('MR')}
          disabled={!hasMemory}
          className={`py-1.5 rounded-sm transition-colors text-center ${
            hasMemory
              ? 'hover:bg-axiom-surface text-axiom-accent font-semibold'
              : 'text-axiom-secondary/40 cursor-not-allowed'
          }`}
        >
          MR
        </button>
        <button
          onClick={() => handleMem('M+')}
          className="py-1.5 rounded-sm text-center hover:bg-axiom-surface text-axiom-secondary hover:text-axiom-primary transition-colors"
        >
          M+
        </button>
        <button
          onClick={() => handleMem('M-')}
          className="py-1.5 rounded-sm text-center hover:bg-axiom-surface text-axiom-secondary hover:text-axiom-primary transition-colors"
        >
          M-
        </button>
        <button
          onClick={() => handleMem('MS')}
          className="py-1.5 rounded-sm text-center hover:bg-axiom-surface text-axiom-secondary hover:text-axiom-primary transition-colors"
        >
          MS
        </button>
        <button
          onClick={() => {
            if (ansValue) handleKey(ansValue, 'number');
            else handleKey('ans', 'number');
          }}
          className="py-1.5 rounded-sm text-center hover:bg-axiom-surface text-axiom-primary font-medium transition-colors"
          title={`Recall previous answer: ${ansValue || '0'}`}
        >
          Ans
        </button>
      </div>

      {/* Function Sub-mode Segmented Tabs */}
      <div className="flex items-center gap-1 p-1 bg-axiom-sub rounded-sm border border-axiom-border text-xs font-sans transition-colors">
        <button
          onClick={() => setSubMode('scientific')}
          className={`flex-1 py-1 px-2 rounded-sm transition-colors whitespace-nowrap text-center ${
            subMode === 'scientific'
              ? 'bg-axiom-surface text-axiom-primary font-semibold shadow-xs'
              : 'text-axiom-secondary hover:text-axiom-primary'
          }`}
        >
          Functions
        </button>
        <button
          onClick={() => setSubMode('trig')}
          className={`flex-1 py-1 px-2 rounded-sm transition-colors whitespace-nowrap text-center ${
            subMode === 'trig'
              ? 'bg-axiom-surface text-axiom-primary font-semibold shadow-xs'
              : 'text-axiom-secondary hover:text-axiom-primary'
          }`}
        >
          Trig & Hyper
        </button>
        <button
          onClick={() => setSubMode('complex')}
          className={`flex-1 py-1 px-2 rounded-sm transition-colors whitespace-nowrap text-center ${
            subMode === 'complex'
              ? 'bg-axiom-surface text-axiom-primary font-semibold shadow-xs'
              : 'text-axiom-secondary hover:text-axiom-primary'
          }`}
        >
          Complex
        </button>
        <button
          onClick={() => setSubMode('calculus')}
          className={`flex-1 py-1 px-2 rounded-sm transition-colors whitespace-nowrap text-center ${
            subMode === 'calculus'
              ? 'bg-axiom-surface text-axiom-primary font-semibold shadow-xs'
              : 'text-axiom-secondary hover:text-axiom-primary'
          }`}
        >
          Calculus & Vars
        </button>
      </div>

      {/* Secondary Drawer Keys */}
      <div className="grid grid-cols-5 gap-1.5 p-2 bg-axiom-bg rounded-sm border border-axiom-border text-xs font-mono transition-colors">
        {subMode === 'scientific' && (
          <>
            <button
              onClick={() => handleKey('^2', 'operator')}
              className="py-2 rounded-sm bg-axiom-surface hover:bg-axiom-sub text-axiom-primary border border-axiom-border font-medium transition-colors"
            >
              x²
            </button>
            <button
              onClick={() => handleKey('^', 'operator')}
              className="py-2 rounded-sm bg-axiom-surface hover:bg-axiom-sub text-axiom-primary border border-axiom-border font-medium transition-colors"
            >
              xʸ
            </button>
            <button
              onClick={() => handleKey('sqrt(', 'operator')}
              className="py-2 rounded-sm bg-axiom-surface hover:bg-axiom-sub text-axiom-primary border border-axiom-border font-medium transition-colors"
            >
              √x
            </button>
            <button
              onClick={() => handleKey('log10(', 'operator')}
              className="py-2 rounded-sm bg-axiom-surface hover:bg-axiom-sub text-axiom-primary border border-axiom-border font-medium transition-colors"
            >
              log₁₀
            </button>
            <button
              onClick={() => handleKey('ln(', 'operator')}
              className="py-2 rounded-sm bg-axiom-surface hover:bg-axiom-sub text-axiom-primary border border-axiom-border font-medium transition-colors"
            >
              ln
            </button>
            <button
              onClick={() => handleKey('exp(', 'operator')}
              className="py-2 rounded-sm bg-axiom-surface hover:bg-axiom-sub text-axiom-primary border border-axiom-border font-medium transition-colors"
            >
              eˣ
            </button>
            <button
              onClick={() => handleKey('1/(', 'operator')}
              className="py-2 rounded-sm bg-axiom-surface hover:bg-axiom-sub text-axiom-primary border border-axiom-border font-medium transition-colors"
            >
              1/x
            </button>
            <button
              onClick={() => handleKey('!', 'operator')}
              className="py-2 rounded-sm bg-axiom-surface hover:bg-axiom-sub text-axiom-primary border border-axiom-border font-medium transition-colors"
            >
              n!
            </button>
            <button
              onClick={() => handleKey('pi', 'number')}
              className="py-2 rounded-sm bg-axiom-surface hover:bg-axiom-sub text-axiom-primary border border-axiom-border font-semibold transition-colors"
            >
              π
            </button>
            <button
              onClick={() => handleKey('e', 'number')}
              className="py-2 rounded-sm bg-axiom-surface hover:bg-axiom-sub text-axiom-primary border border-axiom-border font-semibold transition-colors"
            >
              e
            </button>
          </>
        )}

        {subMode === 'trig' && (
          <>
            <button
              onClick={() => setIsSecond(!isSecond)}
              className={`py-2 rounded-sm border font-semibold transition-colors ${
                isSecond
                  ? 'bg-axiom-accent text-axiom-accent-text border-axiom-accent'
                  : 'bg-axiom-surface text-axiom-primary border-axiom-border'
              }`}
            >
              {isSecond ? '1st' : '2nd'}
            </button>
            <button
              onClick={() => handleKey(isSecond ? 'asin(' : 'sin(', 'operator')}
              className="py-2 rounded-sm bg-axiom-surface hover:bg-axiom-sub text-axiom-primary border border-axiom-border font-medium transition-colors"
            >
              {isSecond ? 'sin⁻¹' : 'sin'}
            </button>
            <button
              onClick={() => handleKey(isSecond ? 'acos(' : 'cos(', 'operator')}
              className="py-2 rounded-sm bg-axiom-surface hover:bg-axiom-sub text-axiom-primary border border-axiom-border font-medium transition-colors"
            >
              {isSecond ? 'cos⁻¹' : 'cos'}
            </button>
            <button
              onClick={() => handleKey(isSecond ? 'atan(' : 'tan(', 'operator')}
              className="py-2 rounded-sm bg-axiom-surface hover:bg-axiom-sub text-axiom-primary border border-axiom-border font-medium transition-colors"
            >
              {isSecond ? 'tan⁻¹' : 'tan'}
            </button>
            <button
              onClick={() => handleKey('cot(', 'operator')}
              className="py-2 rounded-sm bg-axiom-surface hover:bg-axiom-sub text-axiom-primary border border-axiom-border font-medium transition-colors"
            >
              cot
            </button>
            <button
              onClick={() => handleKey('sinh(', 'operator')}
              className="py-2 rounded-sm bg-axiom-surface hover:bg-axiom-sub text-axiom-primary border border-axiom-border font-medium transition-colors"
            >
              sinh
            </button>
            <button
              onClick={() => handleKey('cosh(', 'operator')}
              className="py-2 rounded-sm bg-axiom-surface hover:bg-axiom-sub text-axiom-primary border border-axiom-border font-medium transition-colors"
            >
              cosh
            </button>
            <button
              onClick={() => handleKey('tanh(', 'operator')}
              className="py-2 rounded-sm bg-axiom-surface hover:bg-axiom-sub text-axiom-primary border border-axiom-border font-medium transition-colors"
            >
              tanh
            </button>
            <button
              onClick={() => handleKey('sec(', 'operator')}
              className="py-2 rounded-sm bg-axiom-surface hover:bg-axiom-sub text-axiom-primary border border-axiom-border font-medium transition-colors"
            >
              sec
            </button>
            <button
              onClick={() => handleKey('csc(', 'operator')}
              className="py-2 rounded-sm bg-axiom-surface hover:bg-axiom-sub text-axiom-primary border border-axiom-border font-medium transition-colors"
            >
              csc
            </button>
          </>
        )}

        {subMode === 'complex' && (
          <>
            <button
              onClick={() => handleKey('i', 'number')}
              className="py-2 rounded-sm bg-axiom-surface hover:bg-axiom-sub text-axiom-primary border border-axiom-border font-bold transition-colors"
            >
              i
            </button>
            <button
              onClick={() => handleKey('re(', 'operator')}
              className="py-2 rounded-sm bg-axiom-surface hover:bg-axiom-sub text-axiom-primary border border-axiom-border font-medium transition-colors"
            >
              Re(z)
            </button>
            <button
              onClick={() => handleKey('im(', 'operator')}
              className="py-2 rounded-sm bg-axiom-surface hover:bg-axiom-sub text-axiom-primary border border-axiom-border font-medium transition-colors"
            >
              Im(z)
            </button>
            <button
              onClick={() => handleKey('conj(', 'operator')}
              className="py-2 rounded-sm bg-axiom-surface hover:bg-axiom-sub text-axiom-primary border border-axiom-border font-medium transition-colors"
            >
              z*
            </button>
            <button
              onClick={() => handleKey('abs(', 'operator')}
              className="py-2 rounded-sm bg-axiom-surface hover:bg-axiom-sub text-axiom-primary border border-axiom-border font-medium transition-colors"
            >
              |z|
            </button>
            <button
              onClick={() => handleKey('arg(', 'operator')}
              className="py-2 rounded-sm bg-axiom-surface hover:bg-axiom-sub text-axiom-primary border border-axiom-border font-medium transition-colors"
            >
              arg(z)
            </button>
            <button
              onClick={() => handleKey('combinations(', 'operator')}
              className="py-2 rounded-sm bg-axiom-surface hover:bg-axiom-sub text-axiom-primary border border-axiom-border font-medium transition-colors"
            >
              nCr
            </button>
            <button
              onClick={() => handleKey('permutations(', 'operator')}
              className="py-2 rounded-sm bg-axiom-surface hover:bg-axiom-sub text-axiom-primary border border-axiom-border font-medium transition-colors"
            >
              nPr
            </button>
            <button
              onClick={() => handleKey('gcd(', 'operator')}
              className="py-2 rounded-sm bg-axiom-surface hover:bg-axiom-sub text-axiom-primary border border-axiom-border font-medium transition-colors"
            >
              gcd
            </button>
            <button
              onClick={() => handleKey('lcm(', 'operator')}
              className="py-2 rounded-sm bg-axiom-surface hover:bg-axiom-sub text-axiom-primary border border-axiom-border font-medium transition-colors"
            >
              lcm
            </button>
          </>
        )}

        {subMode === 'calculus' && (
          <>
            <button
              onClick={() => handleKey('x', 'number')}
              className="py-2 rounded-sm bg-axiom-surface hover:bg-axiom-sub text-axiom-primary border border-axiom-border font-bold transition-colors"
            >
              x
            </button>
            <button
              onClick={() => handleKey('y', 'number')}
              className="py-2 rounded-sm bg-axiom-surface hover:bg-axiom-sub text-axiom-primary border border-axiom-border font-bold transition-colors"
            >
              y
            </button>
            <button
              onClick={() => handleKey('z', 'number')}
              className="py-2 rounded-sm bg-axiom-surface hover:bg-axiom-sub text-axiom-primary border border-axiom-border font-bold transition-colors"
            >
              z
            </button>
            <button
              onClick={() => handleKey('derivative(', 'operator')}
              className="py-2 rounded-sm bg-axiom-surface hover:bg-axiom-sub text-axiom-primary border border-axiom-border font-medium transition-colors"
            >
              d/dx
            </button>
            <button
              onClick={() => handleKey('floor(', 'operator')}
              className="py-2 rounded-sm bg-axiom-surface hover:bg-axiom-sub text-axiom-primary border border-axiom-border font-medium transition-colors"
            >
              floor
            </button>
            <button
              onClick={() => handleKey('ceil(', 'operator')}
              className="py-2 rounded-sm bg-axiom-surface hover:bg-axiom-sub text-axiom-primary border border-axiom-border font-medium transition-colors"
            >
              ceil
            </button>
            <button
              onClick={() => handleKey('round(', 'operator')}
              className="py-2 rounded-sm bg-axiom-surface hover:bg-axiom-sub text-axiom-primary border border-axiom-border font-medium transition-colors"
            >
              round
            </button>
            <button
              onClick={() => handleKey('mod(', 'operator')}
              className="py-2 rounded-sm bg-axiom-surface hover:bg-axiom-sub text-axiom-primary border border-axiom-border font-medium transition-colors"
            >
              mod
            </button>
            <button
              onClick={() => handleKey('log2(', 'operator')}
              className="py-2 rounded-sm bg-axiom-surface hover:bg-axiom-sub text-axiom-primary border border-axiom-border font-medium transition-colors"
            >
              log₂
            </button>
            <button
              onClick={() => handleKey('cbrt(', 'operator')}
              className="py-2 rounded-sm bg-axiom-surface hover:bg-axiom-sub text-axiom-primary border border-axiom-border font-medium transition-colors"
            >
              ∛x
            </button>
          </>
        )}
      </div>

      {/* Main Core 4x5 Keypad Grid */}
      <div className="grid grid-cols-4 gap-2 text-base font-mono">
        {/* Row 1: AC, CE, Backspace, Divide */}
        <button
          onClick={() => {
            sound.playKeyClick('clear');
            onClear();
          }}
          className="py-3 rounded-sm bg-axiom-sub hover:bg-axiom-border text-axiom-primary font-semibold border border-axiom-border transition-colors active:scale-[0.98]"
        >
          AC
        </button>
        <button
          onClick={() => {
            sound.playKeyClick('clear');
            onClearEntry();
          }}
          className="py-3 rounded-sm bg-axiom-sub hover:bg-axiom-border text-axiom-secondary font-medium border border-axiom-border transition-colors active:scale-[0.98]"
        >
          CE
        </button>
        <button
          onClick={() => {
            sound.playKeyClick('operator');
            onBackspace();
          }}
          className="py-3 rounded-sm flex items-center justify-center bg-axiom-sub hover:bg-axiom-border text-axiom-secondary border border-axiom-border transition-colors active:scale-[0.98]"
          aria-label="Backspace"
        >
          <Delete className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleKey(' / ', 'operator')}
          className="py-3 rounded-sm bg-axiom-sub hover:bg-axiom-border text-axiom-primary font-medium text-lg border border-axiom-border transition-colors active:scale-[0.98]"
        >
          ÷
        </button>

        {/* Row 2: 7, 8, 9, Multiply */}
        <button
          onClick={() => handleKey('7', 'number')}
          className="py-3 rounded-sm bg-axiom-surface hover:bg-axiom-sub text-axiom-primary font-normal text-lg border border-axiom-border transition-colors active:scale-[0.98]"
        >
          7
        </button>
        <button
          onClick={() => handleKey('8', 'number')}
          className="py-3 rounded-sm bg-axiom-surface hover:bg-axiom-sub text-axiom-primary font-normal text-lg border border-axiom-border transition-colors active:scale-[0.98]"
        >
          8
        </button>
        <button
          onClick={() => handleKey('9', 'number')}
          className="py-3 rounded-sm bg-axiom-surface hover:bg-axiom-sub text-axiom-primary font-normal text-lg border border-axiom-border transition-colors active:scale-[0.98]"
        >
          9
        </button>
        <button
          onClick={() => handleKey(' * ', 'operator')}
          className="py-3 rounded-sm bg-axiom-sub hover:bg-axiom-border text-axiom-primary font-medium text-lg border border-axiom-border transition-colors active:scale-[0.98]"
        >
          ×
        </button>

        {/* Row 3: 4, 5, 6, Subtract */}
        <button
          onClick={() => handleKey('4', 'number')}
          className="py-3 rounded-sm bg-axiom-surface hover:bg-axiom-sub text-axiom-primary font-normal text-lg border border-axiom-border transition-colors active:scale-[0.98]"
        >
          4
        </button>
        <button
          onClick={() => handleKey('5', 'number')}
          className="py-3 rounded-sm bg-axiom-surface hover:bg-axiom-sub text-axiom-primary font-normal text-lg border border-axiom-border transition-colors active:scale-[0.98]"
        >
          5
        </button>
        <button
          onClick={() => handleKey('6', 'number')}
          className="py-3 rounded-sm bg-axiom-surface hover:bg-axiom-sub text-axiom-primary font-normal text-lg border border-axiom-border transition-colors active:scale-[0.98]"
        >
          6
        </button>
        <button
          onClick={() => handleKey(' - ', 'operator')}
          className="py-3 rounded-sm bg-axiom-sub hover:bg-axiom-border text-axiom-primary font-medium text-lg border border-axiom-border transition-colors active:scale-[0.98]"
        >
          −
        </button>

        {/* Row 4: 1, 2, 3, Add */}
        <button
          onClick={() => handleKey('1', 'number')}
          className="py-3 rounded-sm bg-axiom-surface hover:bg-axiom-sub text-axiom-primary font-normal text-lg border border-axiom-border transition-colors active:scale-[0.98]"
        >
          1
        </button>
        <button
          onClick={() => handleKey('2', 'number')}
          className="py-3 rounded-sm bg-axiom-surface hover:bg-axiom-sub text-axiom-primary font-normal text-lg border border-axiom-border transition-colors active:scale-[0.98]"
        >
          2
        </button>
        <button
          onClick={() => handleKey('3', 'number')}
          className="py-3 rounded-sm bg-axiom-surface hover:bg-axiom-sub text-axiom-primary font-normal text-lg border border-axiom-border transition-colors active:scale-[0.98]"
        >
          3
        </button>
        <button
          onClick={() => handleKey(' + ', 'operator')}
          className="py-3 rounded-sm bg-axiom-sub hover:bg-axiom-border text-axiom-primary font-medium text-lg border border-axiom-border transition-colors active:scale-[0.98]"
        >
          +
        </button>

        {/* Row 5: ±, 0, ., Equals */}
        <button
          onClick={() => {
            sound.playKeyClick('operator');
            onToggleSign();
          }}
          className="py-3 rounded-sm bg-axiom-surface hover:bg-axiom-sub text-axiom-primary font-medium border border-axiom-border transition-colors active:scale-[0.98]"
        >
          ±
        </button>
        <button
          onClick={() => handleKey('0', 'number')}
          className="py-3 rounded-sm bg-axiom-surface hover:bg-axiom-sub text-axiom-primary font-normal text-lg border border-axiom-border transition-colors active:scale-[0.98]"
        >
          0
        </button>
        <button
          onClick={() => handleKey('.', 'number')}
          className="py-3 rounded-sm bg-axiom-surface hover:bg-axiom-sub text-axiom-primary font-medium text-lg border border-axiom-border transition-colors active:scale-[0.98]"
        >
          .
        </button>
        <button
          onClick={() => {
            sound.playKeyClick('action');
            onEvaluate();
          }}
          className="py-3 rounded-sm bg-axiom-accent hover:bg-axiom-accent-hover text-axiom-accent-text font-medium text-xl border border-axiom-accent transition-colors active:scale-[0.98]"
        >
          =
        </button>
      </div>

      {/* Grouping utility row */}
      <div className="grid grid-cols-4 gap-1.5 text-xs font-mono">
        <button
          onClick={() => handleKey('(', 'operator')}
          className="py-1.5 rounded-sm bg-axiom-surface hover:bg-axiom-sub text-axiom-primary font-medium transition-colors border border-axiom-border"
        >
          (
        </button>
        <button
          onClick={() => handleKey(')', 'operator')}
          className="py-1.5 rounded-sm bg-axiom-surface hover:bg-axiom-sub text-axiom-primary font-medium transition-colors border border-axiom-border"
        >
          )
        </button>
        <button
          onClick={() => handleKey('%', 'operator')}
          className="py-1.5 rounded-sm bg-axiom-surface hover:bg-axiom-sub text-axiom-primary font-medium transition-colors border border-axiom-border"
        >
          %
        </button>
        <button
          onClick={() => handleKey(',', 'operator')}
          className="py-1.5 rounded-sm bg-axiom-surface hover:bg-axiom-sub text-axiom-primary font-medium transition-colors border border-axiom-border"
        >
          ,
        </button>
      </div>
    </div>
  );
};
