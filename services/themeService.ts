export type ThemeColor = 'purple' | 'blue' | 'green' | 'orange' | 'pink';

export const THEMES: Record<ThemeColor, Record<string, string>> = {
  purple: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',
    600: '#9333ea',
    700: '#7e22ce',
    800: '#6b21a8',
    900: '#581c87',
    950: '#3b0764',
  },
  blue: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554',
  },
  green: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
    950: '#052e16',
  },
  orange: {
    50: '#fff7ed',
    100: '#ffedd5',
    200: '#fed7aa',
    300: '#fdba74',
    400: '#fb923c',
    500: '#f97316',
    600: '#ea580c',
    700: '#c2410c',
    800: '#9a3412',
    900: '#7c2d12',
    950: '#431407',
  },
  pink: {
    50: '#fdf2f8',
    100: '#fce7f3',
    200: '#fbcfe8',
    300: '#f9a8d4',
    400: '#f472b6',
    500: '#ec4899',
    600: '#db2777',
    700: '#be185d',
    800: '#9d174d',
    900: '#831843',
    950: '#500724',
  }
};

const THEME_KEY = 'aw_theme_color';
const MODE_KEY = 'aw_theme_mode';

export const setTheme = (color: ThemeColor) => {
  const root = document.documentElement;
  const palette = THEMES[color];

  if (!palette) return;

  Object.entries(palette).forEach(([key, value]) => {
    root.style.setProperty(`--color-primary-${key}`, value);
  });

  localStorage.setItem(THEME_KEY, color);
};

export const setMode = (mode: 'light' | 'dark') => {
  const root = document.documentElement;
  if (mode === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
  localStorage.setItem(MODE_KEY, mode);
};

export const toggleMode = () => {
  const current = localStorage.getItem(MODE_KEY) || 'dark';
  const next = current === 'dark' ? 'light' : 'dark';
  setMode(next);
  return next === 'dark'; // returns isDark
};

export const initTheme = () => {
  // Color init
  const savedColor = localStorage.getItem(THEME_KEY) as ThemeColor;
  setTheme(savedColor || 'purple');

  // Mode init
  const savedMode = localStorage.getItem(MODE_KEY);
  if (!savedMode || savedMode === 'dark') {
    setMode('dark');
  } else {
    setMode('light');
  }
};

export const getCurrentTheme = (): ThemeColor => {
  return (localStorage.getItem(THEME_KEY) as ThemeColor) || 'purple';
};

export const getCurrentMode = (): 'light' | 'dark' => {
  return (localStorage.getItem(MODE_KEY) as 'light' | 'dark') || 'dark';
};