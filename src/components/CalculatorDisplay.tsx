import React, { useState } from 'react';
import { AngleUnit } from '../types';
import { MathView } from './MathView';
import { Copy, Check, Sparkles, Star, Code2, Eye } from 'lucide-react';
import { mathEngine } from '../services/mathEngine';
import { sound } from '../services/audioFeedback';

interface CalculatorDisplayProps {
  expression: string;
  evaluatedResult: string;
  latexPreview?: string;
  error?: string;
  angleUnit: AngleUnit;
  onCycleAngleUnit: () => void;
  precision: number;
  onCyclePrecision: () => void;
  hasMemory: boolean;
  onAiExplain: () => void;
  onStar?: () => void;
  isStarred?: boolean;
}

export const CalculatorDisplay: React.FC<CalculatorDisplayProps> = ({
  expression,
  evaluatedResult,
  latexPreview,
  error,
  angleUnit,
  onCycleAngleUnit,
  precision,
  onCyclePrecision,
  hasMemory,
  onAiExplain,
  onStar,
  isStarred,
}) => {
  const [copied, setCopied] = useState(false);
  const [showLatexView, setShowLatexView] = useState(false);

  const handleCopy = () => {
    sound.playKeyClick('action');
    const textToCopy = evaluatedResult && evaluatedResult !== 'Error' ? evaluatedResult : expression;
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const formattedLatex = latexPreview || mathEngine.expressionToLatex(expression);

  return (
    <div className="relative flex flex-col justify-between p-5 bg-axiom-surface border border-axiom-border rounded-sm transition-colors">
      {/* Top Telemetry Status Line */}
      <div className="flex items-center justify-between text-xs font-sans text-axiom-secondary pb-3 border-b border-axiom-border mb-3">
        <div className="flex items-center gap-3">
          {/* Angle Mode Selector */}
          <button
            onClick={() => {
              sound.playKeyClick('action');
              onCycleAngleUnit();
            }}
            title="Cycle angle unit (DEG, RAD, GRAD)"
            className="px-2 py-0.5 rounded-sm border border-axiom-border bg-axiom-sub text-axiom-primary font-mono font-medium hover:bg-axiom-border transition-colors"
          >
            {angleUnit}
          </button>

          {/* Precision Selector */}
          <button
            onClick={() => {
              sound.playKeyClick('action');
              onCyclePrecision();
            }}
            title="Cycle numerical precision"
            className="px-2 py-0.5 rounded-sm border border-axiom-border bg-axiom-surface text-axiom-secondary hover:text-axiom-primary font-mono text-[11px] transition-colors"
          >
            {precision} DIGITS
          </button>

          {/* Memory Flag */}
          {hasMemory && (
            <span className="px-1.5 py-0.5 rounded-sm border border-axiom-accent/40 bg-axiom-accent/15 text-axiom-accent font-mono font-bold text-[10px]">
              MEM
            </span>
          )}
        </div>

        {/* View toggle (Code vs LaTeX) */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              sound.playKeyClick('action');
              setShowLatexView(!showLatexView);
            }}
            title={showLatexView ? 'Switch to text view' : 'Switch to formatted LaTeX view'}
            className="flex items-center gap-1 px-2 py-0.5 rounded-sm border border-axiom-border text-axiom-secondary hover:text-axiom-primary hover:bg-axiom-sub transition-colors text-[11px]"
          >
            {showLatexView ? <Code2 className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            <span>{showLatexView ? 'Plain Code' : 'Typeset'}</span>
          </button>
        </div>
      </div>

      {/* Primary Mathematical Expression */}
      <div className="min-h-[52px] flex items-center justify-end overflow-x-auto py-1 scrollbar-none">
        {showLatexView ? (
          <div className="text-right text-lg text-axiom-primary font-normal select-text">
            <MathView latex={formattedLatex || '0'} displayMode={false} />
          </div>
        ) : (
          <div className="font-mono text-xl sm:text-2xl text-right text-axiom-primary tracking-tight break-all font-normal select-text">
            {expression || <span className="text-axiom-secondary/50">0</span>}
            <span className="inline-block w-[1.5px] h-5 bg-axiom-accent ml-1 align-middle" />
          </div>
        )}
      </div>

      {/* Mathematical Evaluated Result */}
      <div className="flex items-end justify-between pt-3 border-t border-axiom-border mt-2">
        <div className="flex items-center gap-1.5 text-axiom-secondary">
          {/* Mathematical derivation button */}
          {expression && evaluatedResult && evaluatedResult !== 'Error' && (
            <button
              onClick={() => {
                sound.playKeyClick('action');
                onAiExplain();
              }}
              title="Show step-by-step derivation"
              className="flex items-center gap-1 px-2 py-1 text-xs font-mono text-axiom-accent bg-axiom-sub border border-axiom-border rounded-sm hover:bg-axiom-border transition-colors"
            >
              <Sparkles className="w-3 h-3" />
              <span>Derivation</span>
            </button>
          )}

          {/* Star/Bookmark */}
          {onStar && (
            <button
              onClick={() => {
                sound.playKeyClick('action');
                onStar();
              }}
              title="Save to history favorites"
              className={`p-1.5 rounded-sm hover:bg-axiom-sub transition-colors ${
                isStarred ? 'text-axiom-accent' : 'text-axiom-secondary hover:text-axiom-primary'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${isStarred ? 'fill-current text-axiom-accent' : ''}`} />
            </button>
          )}

          {/* Copy button */}
          <button
            onClick={handleCopy}
            title="Copy result to clipboard"
            className="p-1.5 rounded-sm hover:bg-axiom-sub text-axiom-secondary hover:text-axiom-primary transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-axiom-accent" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Big Calculated Number / Error Output */}
        <div className="text-right">
          {error ? (
            <span className="text-xs font-mono text-red-500 font-medium">{error}</span>
          ) : (
            <div className="font-mono text-2xl sm:text-3xl font-semibold tracking-tight text-axiom-primary tabular-nums select-text">
              {evaluatedResult ? `= ${evaluatedResult}` : ''}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
