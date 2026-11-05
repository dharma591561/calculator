import React, { useState, useEffect } from 'react';
import { AiExplanation } from '../types';
import { MathView } from './MathView';
import { X, Sparkles, Send, BookOpen, Lightbulb } from 'lucide-react';
import { sound } from '../services/audioFeedback';

interface AiExplainerModalProps {
  isOpen: boolean;
  onClose: () => void;
  expression: string;
  result: string;
}

export const AiExplainerModal: React.FC<AiExplainerModalProps> = ({
  isOpen,
  onClose,
  expression,
  result,
}) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AiExplanation | null>(null);
  const [customQuery, setCustomQuery] = useState('');
  const [followupLoading, setFollowupLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const fetchExplanation = async () => {
      setLoading(true);
      try {
        const resp = await fetch('/api/ai-explain', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            expression: expression || 'Euler identity',
            result: result || '0',
            mode: 'explain',
          }),
        });
        const resData = await resp.json();
        setData(resData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchExplanation();
  }, [isOpen, expression, result]);

  const handleFollowupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuery.trim()) return;

    sound.playKeyClick('action');
    setFollowupLoading(true);
    try {
      const resp = await fetch('/api/ai-explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expression,
          result,
          customQuestion: customQuery,
        }),
      });
      const resData = await resp.json();
      setData(resData);
      setCustomQuery('');
    } catch (err) {
      console.error(err);
    } finally {
      setFollowupLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xs">
      <div className="relative w-full max-w-xl max-h-[85vh] bg-axiom-surface rounded-sm border border-axiom-border shadow-md flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-100 transition-colors">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-axiom-border bg-axiom-bg transition-colors">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-sm border border-axiom-border bg-axiom-surface flex items-center justify-center text-axiom-accent">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="font-semibold text-xs tracking-tight uppercase font-sans text-axiom-primary">
                Mathematical Derivation & Proof
              </h3>
              <p className="text-[11px] text-axiom-secondary font-mono">
                {expression ? `${expression} = ${result}` : 'Analytical Breakdown'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playKeyClick('action');
              onClose();
            }}
            className="p-1 rounded-sm text-axiom-secondary hover:text-axiom-primary hover:bg-axiom-sub transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs scrollbar-thin">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2 text-axiom-secondary text-xs font-sans">
              <div className="w-5 h-5 border-2 border-axiom-accent border-t-transparent rounded-full animate-spin" />
              <span>Synthesizing mathematical derivation...</span>
            </div>
          ) : data ? (
            <>
              {/* Formula Block */}
              {data.latex && (
                <div className="p-3.5 rounded-sm bg-axiom-bg border border-axiom-border text-center text-axiom-primary text-sm font-mono transition-colors">
                  <MathView latex={data.latex} displayMode={true} />
                </div>
              )}

              {/* Core Insight */}
              <div>
                <span className="text-[10px] text-axiom-secondary uppercase tracking-wider block mb-1 font-sans font-medium">
                  Analytical Summary
                </span>
                <p className="font-sans text-xs text-axiom-primary leading-relaxed">
                  {data.summary}
                </p>
              </div>

              {/* Derivation Steps */}
              {data.steps && data.steps.length > 0 && (
                <div>
                  <span className="text-[10px] text-axiom-secondary uppercase tracking-wider block mb-1.5 flex items-center gap-1 font-sans font-medium">
                    <BookOpen className="w-3 h-3 text-axiom-accent" />
                    <span>Derivation Sequence</span>
                  </span>
                  <div className="space-y-1.5">
                    {data.steps.map((step, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-sm bg-axiom-bg border border-axiom-border text-[11px] font-mono text-axiom-primary leading-relaxed transition-colors"
                      >
                        {step}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Geometric Intuition */}
              {data.intuition && (
                <div className="p-3 rounded-sm bg-axiom-bg border border-axiom-border text-xs flex items-start gap-2 transition-colors">
                  <Lightbulb className="w-3.5 h-3.5 text-axiom-accent shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-[10px] uppercase text-axiom-secondary block mb-0.5 font-sans">
                      Geometric Intuition
                    </span>
                    <p className="font-sans text-[11px] text-axiom-primary leading-relaxed">
                      {data.intuition}
                    </p>
                  </div>
                </div>
              )}

              {/* Key Identities */}
              {data.keyIdentities && data.keyIdentities.length > 0 && (
                <div>
                  <span className="text-[10px] text-axiom-secondary uppercase tracking-wider block mb-1 font-sans font-medium">
                    Governing Identities
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {data.keyIdentities.map((idKey, idx) => (
                      <div
                        key={idx}
                        className="px-2.5 py-1 rounded-sm bg-axiom-sub text-xs font-mono text-axiom-primary border border-axiom-border transition-colors"
                      >
                        <MathView latex={idKey} displayMode={false} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-10 text-axiom-secondary text-xs font-sans">
              Derivation unavailable.
            </div>
          )}
        </div>

        {/* Follow-up question input */}
        <form
          onSubmit={handleFollowupSubmit}
          className="p-3 border-t border-axiom-border bg-axiom-bg flex items-center gap-2 transition-colors"
        >
          <input
            type="text"
            placeholder="Ask follow-up question (e.g. 'Show trigonometric steps', 'Explain singularity')..."
            value={customQuery}
            onChange={(e) => setCustomQuery(e.target.value)}
            disabled={followupLoading}
            className="flex-1 px-3 py-1.5 text-xs rounded-sm bg-axiom-surface border border-axiom-border text-axiom-primary placeholder-axiom-secondary/70 focus:outline-none focus:border-axiom-accent font-sans transition-colors"
          />
          <button
            type="submit"
            disabled={followupLoading || !customQuery.trim()}
            className="px-3 py-1.5 rounded-sm bg-axiom-accent hover:bg-axiom-accent-hover text-axiom-accent-text font-medium text-xs font-sans transition-opacity disabled:opacity-40 flex items-center gap-1 shrink-0"
          >
            {followupLoading ? (
              <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-3 h-3" />
            )}
            <span>Query</span>
          </button>
        </form>
      </div>
    </div>
  );
};
