import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeId, ThemeInfo } from '../types';

export const THEMES: Record<ThemeId, ThemeInfo> = {
  'ivory-graphite': {
    id: 'ivory-graphite',
    name: 'Ivory & Graphite',
    tagline: 'Default Swiss Editorial',
    bg: '#F4F2ED',
    surface: '#FFFFFF',
    surfaceSecondary: '#ECEAE4',
    primaryText: '#25282B',
    secondaryText: '#777A78',
    borders: '#E3E0D9',
    accent: '#526B61',
    accentHover: '#435850',
    accentText: '#FFFFFF',
    canvasFill: 'rgba(82, 107, 97, 0.16)',
  },
  'graphite-noir': {
    id: 'graphite-noir',
    name: 'Graphite Noir',
    tagline: 'Technical Precision Dark',
    bg: '#202225',
    surface: '#292D31',
    surfaceSecondary: '#30353A',
    primaryText: '#ECEDEB',
    secondaryText: '#A5AAA8',
    borders: '#41464A',
    accent: '#B4BBB5',
    accentHover: '#C5CCC6',
    accentText: '#202225',
    canvasFill: 'rgba(180, 187, 181, 0.18)',
  },
  midnight: {
    id: 'midnight',
    name: 'Midnight',
    tagline: 'Deep Slate & Steel',
    bg: '#171F2B',
    surface: '#202B3A',
    surfaceSecondary: '#263448',
    primaryText: '#E8EDF3',
    secondaryText: '#A3B0C0',
    borders: '#344458',
    accent: '#829BB7',
    accentHover: '#97B0CD',
    accentText: '#171F2B',
    canvasFill: 'rgba(130, 155, 183, 0.18)',
  },
  'forest-slate': {
    id: 'forest-slate',
    name: 'Forest Slate',
    tagline: 'Deep Pine & Sage',
    bg: '#202824',
    surface: '#29332E',
    surfaceSecondary: '#313D36',
    primaryText: '#E8EDE8',
    secondaryText: '#A7B2A9',
    borders: '#414F46',
    accent: '#9BAF9D',
    accentHover: '#ADC2AF',
    accentText: '#202824',
    canvasFill: 'rgba(155, 175, 157, 0.18)',
  },
  'paper-ink': {
    id: 'paper-ink',
    name: 'Paper & Ink',
    tagline: 'Warm Sepia & Umber',
    bg: '#EAE4D9',
    surface: '#F7F3EA',
    surfaceSecondary: '#EDE7DC',
    primaryText: '#332F29',
    secondaryText: '#81796D',
    borders: '#D8D0C3',
    accent: '#947653',
    accentHover: '#7E6445',
    accentText: '#FFFFFF',
    canvasFill: 'rgba(148, 118, 83, 0.18)',
  },
};

export const THEME_LIST: ThemeInfo[] = [
  THEMES['ivory-graphite'],
  THEMES['graphite-noir'],
  THEMES['midnight'],
  THEMES['forest-slate'],
  THEMES['paper-ink'],
];

interface ThemeContextType {
  theme: ThemeId;
  currentTheme: ThemeInfo;
  setTheme: (theme: ThemeId) => void;
  themes: ThemeInfo[];
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeId>(() => {
    const saved = localStorage.getItem('axiom_active_theme') as ThemeId | null;
    if (saved && saved in THEMES) {
      return saved;
    }
    return 'ivory-graphite';
  });

  const [soundEnabled, setSoundEnabledState] = useState<boolean>(() => {
    return localStorage.getItem('axiom_sound_enabled') === 'true';
  });

  const currentTheme = THEMES[theme] || THEMES['ivory-graphite'];

  const setTheme = (t: ThemeId) => {
    if (THEMES[t]) {
      setThemeState(t);
      localStorage.setItem('axiom_active_theme', t);
    }
  };

  const setSoundEnabled = (v: boolean) => {
    setSoundEnabledState(v);
    localStorage.setItem('axiom_sound_enabled', String(v));
  };

  // Sync theme to root DOM and CSS variables
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);

    // Apply CSS custom properties dynamically
    root.style.setProperty('--axiom-bg', currentTheme.bg);
    root.style.setProperty('--axiom-surface', currentTheme.surface);
    root.style.setProperty('--axiom-surface-sub', currentTheme.surfaceSecondary);
    root.style.setProperty('--axiom-primary', currentTheme.primaryText);
    root.style.setProperty('--axiom-secondary', currentTheme.secondaryText);
    root.style.setProperty('--axiom-border', currentTheme.borders);
    root.style.setProperty('--axiom-accent', currentTheme.accent);
    root.style.setProperty('--axiom-accent-hover', currentTheme.accentHover);
    root.style.setProperty('--axiom-accent-text', currentTheme.accentText);
    root.style.setProperty('--axiom-canvas-fill', currentTheme.canvasFill);

    // Synchronize HTML body background color
    document.body.style.backgroundColor = currentTheme.bg;
    document.body.style.color = currentTheme.primaryText;
  }, [theme, currentTheme]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        currentTheme,
        setTheme,
        themes: THEME_LIST,
        soundEnabled,
        setSoundEnabled,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
