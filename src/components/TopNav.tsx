import React, { useState, useRef, useEffect } from 'react';
import { CalculatorTab, ThemeId } from '../types';
import { useTheme } from '../context/ThemeContext';
import { Volume2, VolumeX, Sparkles, HelpCircle, Palette, Check, ChevronDown } from 'lucide-react';
import { sound } from '../services/audioFeedback';

interface TopNavProps {
  activeTab: CalculatorTab;
  onTabChange: (tab: CalculatorTab) => void;
  onOpenAiExplainer: () => void;
  onOpenKeyboardGuide: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeTab,
  onTabChange,
  onOpenAiExplainer,
  onOpenKeyboardGuide,
}) => {
  const { theme, currentTheme, setTheme, themes, soundEnabled, setSoundEnabled } = useTheme();
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const themeMenuRef = useRef<HTMLDivElement | null>(null);

  const handleSoundToggle = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sound.setEnabled(next);
    if (next) sound.playKeyClick('action');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (themeMenuRef.current && !themeMenuRef.current.contains(e.target as Node)) {
        setIsThemeOpen(false);
      }
    };
    if (isThemeOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isThemeOpen]);

  const navItems: { id: CalculatorTab; label: string }[] = [
    { id: 'workstation', label: 'Workstation' },
    { id: 'matrices', label: 'Linear Algebra' },
    { id: 'complex', label: 'Complex Analysis' },
    { id: 'calculus', label: 'Calculus Lab' },
    { id: 'constants', label: 'Constants' },
  ];

  return (
    <header className="h-14 px-6 border-b border-axiom-border bg-axiom-surface flex items-center justify-between gap-4 select-none shrink-0 transition-colors">
      {/* Zone 1: Swiss Editorial Brand Mark */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={() => onTabChange('workstation')}
          className="flex items-center gap-2.5 text-left group"
        >
          <div className="w-6 h-6 rounded-sm border border-axiom-border bg-axiom-sub flex items-center justify-center font-mono font-medium text-xs text-axiom-primary">
            ∑
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-semibold text-sm tracking-tight text-axiom-primary">
              AXIOM
            </span>
            <span className="text-xs text-axiom-secondary hidden sm:inline">
              / Scientific Workstation
            </span>
          </div>
        </button>
      </div>

      {/* Zone 2: Navigation Links (Clean Swiss Typography) */}
      <nav className="hidden md:flex items-center gap-6 text-xs font-medium">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                sound.playKeyClick('number');
                onTabChange(item.id);
              }}
              className={`py-1 transition-colors whitespace-nowrap relative ${
                isActive
                  ? 'text-axiom-primary font-semibold'
                  : 'text-axiom-secondary hover:text-axiom-primary'
              }`}
            >
              {item.label}
              {isActive && (
                <span className="absolute bottom-[-17px] left-0 right-0 h-[2px] bg-axiom-accent" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Zone 3: Utilities, Theme Selector & Derivations Button */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Theme Selector Dropdown */}
        <div className="relative" ref={themeMenuRef}>
          <button
            onClick={() => setIsThemeOpen(!isThemeOpen)}
            title="Select visual theme"
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-sm border border-axiom-border bg-axiom-surface hover:bg-axiom-sub text-xs font-sans text-axiom-primary transition-colors"
            aria-haspopup="true"
            aria-expanded={isThemeOpen}
          >
            {/* Color Swatch Dot Pair */}
            <span className="flex items-center -space-x-1">
              <span
                className="w-2.5 h-2.5 rounded-full border border-black/10 inline-block shadow-2xs"
                style={{ backgroundColor: currentTheme.bg }}
              />
              <span
                className="w-2.5 h-2.5 rounded-full border border-black/10 inline-block shadow-2xs"
                style={{ backgroundColor: currentTheme.accent }}
              />
            </span>
            <span className="font-medium hidden sm:inline">{currentTheme.name}</span>
            <ChevronDown className={`w-3 h-3 text-axiom-secondary transition-transform ${isThemeOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Theme Menu Dropdown Popover */}
          {isThemeOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-60 p-1.5 bg-axiom-surface rounded-sm border border-axiom-border shadow-lg z-50 flex flex-col gap-1">
              <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-axiom-secondary border-b border-axiom-border mb-0.5">
                Visual Themes
              </div>

              {themes.map((t) => {
                const isSelected = theme === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      sound.playKeyClick('action');
                      setTheme(t.id);
                      setIsThemeOpen(false);
                    }}
                    className={`flex items-center justify-between p-2 rounded-sm text-left transition-colors ${
                      isSelected
                        ? 'bg-axiom-sub text-axiom-primary font-medium'
                        : 'hover:bg-axiom-sub/70 text-axiom-primary'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {/* Theme Palette Swatch Preview */}
                      <div className="w-5 h-5 rounded-sm border border-axiom-border overflow-hidden flex flex-col shrink-0">
                        <div
                          className="w-full h-1/2"
                          style={{ backgroundColor: t.bg }}
                        />
                        <div className="w-full h-1/2 flex">
                          <div
                            className="w-1/2 h-full"
                            style={{ backgroundColor: t.surface }}
                          />
                          <div
                            className="w-1/2 h-full"
                            style={{ backgroundColor: t.accent }}
                          />
                        </div>
                      </div>

                      <div className="flex flex-col">
                        <span className="text-xs font-sans leading-tight">
                          {t.name}
                        </span>
                        <span className="text-[10px] text-axiom-secondary leading-tight">
                          {t.tagline}
                        </span>
                      </div>
                    </div>

                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-axiom-accent shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Audio feedback toggle */}
        <button
          onClick={handleSoundToggle}
          title={soundEnabled ? 'Keypad Audio: On' : 'Keypad Audio: Off'}
          className={`p-1.5 rounded-sm border transition-colors ${
            soundEnabled
              ? 'border-axiom-accent bg-axiom-sub text-axiom-accent'
              : 'border-axiom-border text-axiom-secondary hover:text-axiom-primary hover:bg-axiom-sub'
          }`}
          aria-label="Toggle audio feedback"
        >
          {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
        </button>

        {/* Shortcuts guide */}
        <button
          onClick={onOpenKeyboardGuide}
          title="Keyboard shortcuts (?)"
          className="p-1.5 rounded-sm border border-axiom-border text-axiom-secondary hover:text-axiom-primary hover:bg-axiom-sub transition-colors"
          aria-label="Keyboard shortcuts"
        >
          <HelpCircle className="w-3.5 h-3.5" />
        </button>

        {/* Mathematical Derivations Button */}
        <button
          onClick={() => {
            sound.playKeyClick('action');
            onOpenAiExplainer();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-axiom-accent-text bg-axiom-accent hover:bg-axiom-accent-hover rounded-sm transition-colors whitespace-nowrap"
        >
          <Sparkles className="w-3.5 h-3.5 opacity-90" />
          <span>Derivations</span>
        </button>
      </div>
    </header>
  );
};
