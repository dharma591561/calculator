import React, { useState } from 'react';
import { CalculationItem } from '../types';
import { Search, Star, Trash2, Download, Copy, Check, CornerDownLeft } from 'lucide-react';
import { sound } from '../services/audioFeedback';

interface HistoryTapeProps {
  items: CalculationItem[];
  onSelectItem: (item: CalculationItem) => void;
  onUseResult: (result: string) => void;
  onToggleStar: (id: string) => void;
  onClearHistory: () => void;
}

export const HistoryTape: React.FC<HistoryTapeProps> = ({
  items,
  onSelectItem,
  onUseResult,
  onToggleStar,
  onClearHistory,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStarredOnly, setFilterStarredOnly] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredItems = items.filter((item) => {
    if (filterStarredOnly && !item.starred) return false;
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      item.expression.toLowerCase().includes(term) ||
      item.result.toLowerCase().includes(term) ||
      (item.notes && item.notes.toLowerCase().includes(term))
    );
  });

  const handleCopy = (id: string, text: string) => {
    sound.playKeyClick('action');
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1600);
  };

  const exportAsJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(items, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `axiom_tape_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const exportAsCsv = () => {
    const header = 'Timestamp,Expression,Result,Type,AngleUnit\n';
    const rows = items
      .map(
        (it) =>
          `"${new Date(it.timestamp).toISOString()}","${it.expression.replace(/"/g, '""')}","${it.result.replace(
            /"/g,
            '""'
          )}","${it.type}","${it.angleUnit}"`
      )
      .join('\n');
    const dataStr = 'data:text/csv;charset=utf-8,' + encodeURIComponent(header + rows);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `axiom_tape_${Date.now()}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="flex flex-col h-full bg-axiom-surface rounded-sm border border-axiom-border overflow-hidden transition-colors">
      {/* Tape Header */}
      <div className="p-4 border-b border-axiom-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-xs text-axiom-primary tracking-normal font-sans">
            Calculation Tape
          </span>
          <span className="text-[11px] font-mono text-axiom-secondary">
            · {items.length} {items.length === 1 ? 'entry' : 'entries'}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {items.length > 0 && (
            <>
              <button
                onClick={exportAsCsv}
                title="Export tape to CSV"
                className="p-1 rounded-sm hover:bg-axiom-sub text-axiom-secondary hover:text-axiom-primary transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  if (confirm('Clear all calculation tape records?')) {
                    onClearHistory();
                  }
                }}
                title="Clear tape"
                className="p-1 rounded-sm hover:bg-axiom-sub text-axiom-secondary hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-2.5 border-b border-axiom-border flex items-center gap-2 bg-axiom-bg transition-colors">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-axiom-secondary" />
          <input
            type="text"
            placeholder="Filter tape records..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-2.5 py-1 text-xs rounded-sm bg-axiom-surface border border-axiom-border text-axiom-primary placeholder-axiom-secondary/70 focus:outline-none focus:border-axiom-accent font-mono transition-colors"
          />
        </div>

        <button
          onClick={() => setFilterStarredOnly(!filterStarredOnly)}
          title={filterStarredOnly ? 'Show all entries' : 'Show starred only'}
          className={`p-1.5 rounded-sm border text-xs flex items-center gap-1 transition-colors ${
            filterStarredOnly
              ? 'bg-axiom-accent/15 border-axiom-accent/40 text-axiom-accent'
              : 'bg-axiom-surface border-axiom-border text-axiom-secondary hover:text-axiom-primary'
          }`}
        >
          <Star className={`w-3 h-3 ${filterStarredOnly ? 'fill-current text-axiom-accent' : ''}`} />
        </button>
      </div>

      {/* Tape Item List */}
      <div className="flex-1 overflow-y-auto divide-y divide-axiom-border scrollbar-thin">
        {filteredItems.length === 0 ? (
          <div className="p-8 text-center text-axiom-secondary text-xs font-sans">
            {searchTerm || filterStarredOnly ? 'No matching calculations found.' : 'Tape is empty. Evaluated calculations will log here.'}
          </div>
        ) : (
          filteredItems.map((item) => {
            const isCopied = copiedId === item.id;
            return (
              <div
                key={item.id}
                className="group p-3 hover:bg-axiom-bg/60 transition-colors"
              >
                {/* Meta line */}
                <div className="flex items-center justify-between text-[11px] font-mono text-axiom-secondary mb-1">
                  <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })} · {item.angleUnit}</span>
                  <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onToggleStar(item.id)}
                      className={`p-1 rounded-sm hover:bg-axiom-sub transition-colors ${
                        item.starred ? 'text-axiom-accent' : 'text-axiom-secondary'
                      }`}
                      title={item.starred ? 'Unstar' : 'Star calculation'}
                    >
                      <Star className={`w-3 h-3 ${item.starred ? 'fill-current text-axiom-accent' : ''}`} />
                    </button>
                    <button
                      onClick={() => handleCopy(item.id, item.result)}
                      className="p-1 rounded-sm hover:bg-axiom-sub transition-colors text-axiom-secondary hover:text-axiom-primary"
                      title="Copy result"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5 text-axiom-accent" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Expression */}
                <button
                  onClick={() => {
                    sound.playKeyClick('number');
                    onSelectItem(item);
                  }}
                  className="w-full text-left font-mono text-xs text-axiom-secondary hover:text-axiom-primary transition-colors truncate"
                  title="Reload formula into input"
                >
                  {item.expression}
                </button>

                {/* Result line */}
                <div className="flex items-center justify-between mt-1">
                  <button
                    onClick={() => {
                      sound.playKeyClick('action');
                      onUseResult(item.result);
                    }}
                    className="font-mono text-sm font-semibold text-axiom-primary hover:text-axiom-accent flex items-center gap-1 transition-colors"
                    title="Append result into active input"
                  >
                    <span>= {item.result}</span>
                    <CornerDownLeft className="w-3 h-3 opacity-0 group-hover:opacity-100 text-axiom-accent" />
                  </button>

                  {item.type !== 'scalar' && (
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded-sm bg-axiom-sub text-axiom-secondary border border-axiom-border">
                      {item.type}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
