import React from 'react';
import { X, Command } from 'lucide-react';
import { sound } from '../services/audioFeedback';

interface KeyboardGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardGuideModal: React.FC<KeyboardGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: '0 – 9', desc: 'Numeric digit entry' },
    { key: '+ , - , * , /', desc: 'Arithmetic operators' },
    { key: '^', desc: 'Exponentiation (xʸ)' },
    { key: 'Enter or =', desc: 'Evaluate expression' },
    { key: 'Backspace', desc: 'Delete preceding character' },
    { key: 'Escape', desc: 'Clear all (AC)' },
    { key: '( and )', desc: 'Parentheses grouping' },
    { key: 'p', desc: 'Archimedes Constant π' },
    { key: 'e', desc: 'Euler’s Number e' },
    { key: 'i', desc: 'Imaginary unit i' },
    { key: 's', desc: 'Trigonometric sin(' },
    { key: 'c', desc: 'Trigonometric cos(' },
    { key: 't', desc: 'Trigonometric tan(' },
    { key: 'l', desc: 'Natural logarithm ln(' },
    { key: '?', desc: 'Toggle keyboard guide' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xs">
      <div className="relative w-full max-w-md bg-axiom-surface rounded-sm border border-axiom-border shadow-md overflow-hidden animate-in fade-in zoom-in-95 duration-100 transition-colors">
        <div className="flex items-center justify-between p-4 border-b border-axiom-border bg-axiom-bg transition-colors">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-sm border border-axiom-border bg-axiom-surface flex items-center justify-center text-axiom-accent">
              <Command className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="font-semibold text-xs uppercase font-sans tracking-tight text-axiom-primary">
                Hardware Shortcuts
              </h3>
              <p className="text-[11px] text-axiom-secondary font-mono">
                Direct physical keyboard navigation
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

        <div className="p-4 max-h-[60vh] overflow-y-auto divide-y divide-axiom-border">
          {shortcuts.map((sc, idx) => (
            <div key={idx} className="py-2 flex items-center justify-between text-xs">
              <kbd className="px-2 py-0.5 rounded-sm bg-axiom-sub border border-axiom-border text-axiom-primary font-mono text-[11px]">
                {sc.key}
              </kbd>
              <span className="text-[11px] text-axiom-secondary font-sans">
                {sc.desc}
              </span>
            </div>
          ))}
        </div>

        <div className="p-3 border-t border-axiom-border bg-axiom-bg text-center font-sans text-[11px] text-axiom-secondary transition-colors">
          Press <kbd className="px-1 py-0.2 rounded-sm border border-axiom-border bg-axiom-surface font-mono text-[10px] text-axiom-primary">Esc</kbd> to close
        </div>
      </div>
    </div>
  );
};
