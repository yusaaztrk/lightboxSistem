export type ThemeMode = 'dark' | 'light';

const STORAGE_KEY = 'themeMode';
const LIGHT_CLASS = 'theme-light';

type Listener = () => void;
const listeners = new Set<Listener>();

export const getThemeMode = (): ThemeMode => {
  if (typeof window === 'undefined') return 'dark';
  const v = localStorage.getItem(STORAGE_KEY);
  return v === 'light' ? 'light' : 'dark';
};

export const applyThemeMode = (mode: ThemeMode) => {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (mode === 'light') root.classList.add(LIGHT_CLASS);
  else root.classList.remove(LIGHT_CLASS);
};

export const setThemeMode = (mode: ThemeMode) => {
  if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, mode);
  applyThemeMode(mode);
  listeners.forEach(l => l());
};

export const toggleThemeMode = () => {
  const next: ThemeMode = getThemeMode() === 'light' ? 'dark' : 'light';
  setThemeMode(next);
  return next;
};

export const initThemeMode = () => {
  const current = getThemeMode();
  applyThemeMode(current);
};

export const subscribeThemeMode = (listener: Listener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
