import React, { useState } from 'react';
import { SCIENTIFIC_CONSTANTS } from '../services/constants';
import { ConstantItem } from '../types';
import { MathView } from './MathView';
import { Search, Copy, Check, Plus } from 'lucide-react';
import { sound } from '../services/audioFeedback';

interface ConstantsCatalogProps {
  onInsertConstant: (symbolOrVal: string) => void;
}

export const ConstantsCatalog: React.FC<ConstantsCatalogProps> = ({ onInsertConstant }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = ['All', 'Universal', 'Quantum', 'Electromagnetism', 'Thermodynamics', 'Astrophysics'];

  const filtered = SCIENTIFIC_CONSTANTS.filter((c) => {
    if (selectedCategory !== 'All' && c.category !== selectedCategory) return false;
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      c.name.toLowerCase().includes(term) ||
      c.symbol.toLowerCase().includes(term) ||
      c.description.toLowerCase().includes(term)
    );
  });

  const handleCopy = (id: string, val: number) => {
    sound.playKeyClick('action');
    navigator.clipboard.writeText(val.toString());
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1600);
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Search and Category Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-axiom-surface rounded-sm border border-axiom-border transition-colors">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-axiom-secondary" />
          <input
            type="text"
            placeholder="Search constants (e.g. Planck, c, G)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-sm bg-axiom-bg border border-axiom-border text-axiom-primary placeholder-axiom-secondary/70 focus:outline-none focus:border-axiom-accent font-mono transition-colors"
          />
        </div>

        {/* Category tabs */}
        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto p-1 bg-axiom-sub rounded-sm border border-axiom-border text-xs font-sans scrollbar-none transition-colors">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`py-1 px-2.5 rounded-sm transition-colors whitespace-nowrap text-[11px] ${
                selectedCategory === cat
                  ? 'bg-axiom-surface text-axiom-primary font-semibold shadow-xs'
                  : 'text-axiom-secondary hover:text-axiom-primary'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Constants */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filtered.map((item: ConstantItem) => {
          const isCopied = copiedId === item.id;
          return (
            <div
              key={item.id}
              className="p-4 bg-axiom-surface rounded-sm border border-axiom-border hover:border-axiom-accent/50 transition-colors flex flex-col justify-between gap-3 group"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-base font-semibold text-axiom-primary">
                    {item.symbol}
                  </span>
                  <span className="text-[10px] font-sans text-axiom-secondary uppercase">
                    · {item.category}
                  </span>
                </div>

                <h4 className="font-medium text-xs text-axiom-primary font-sans">
                  {item.name}
                </h4>

                <p className="text-[11px] text-axiom-secondary mt-1 line-clamp-2 leading-relaxed font-sans">
                  {item.description}
                </p>
              </div>

              <div className="pt-2 border-t border-axiom-border flex flex-col gap-2">
                <div className="font-mono text-xs text-axiom-primary truncate select-text">
                  <MathView latex={item.latex} displayMode={false} />
                </div>

                <div className="flex items-center justify-between pt-0.5 text-[11px] font-mono text-axiom-secondary">
                  <span>Unit: {item.unit}</span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleCopy(item.id, item.value)}
                      title="Copy decimal value"
                      className="p-1 rounded-sm hover:bg-axiom-sub text-axiom-secondary hover:text-axiom-primary transition-colors"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5 text-axiom-accent" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => {
                        sound.playKeyClick('action');
                        onInsertConstant(item.value.toString());
                      }}
                      className="flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-sans font-medium rounded-sm border border-axiom-accent bg-axiom-accent text-axiom-accent-text hover:bg-axiom-accent-hover transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Insert</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
