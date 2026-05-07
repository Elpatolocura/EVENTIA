import { useEffect } from 'react';

export const ACCENT_COLORS = {
  indigo: '230 70% 50%',
  rose: '346 84% 61%',
  emerald: '160 84% 39%',
  amber: '38 92% 50%',
  violet: '262 83% 58%',
};

export const applyTheme = (color: string, style: string) => {
  const root = document.documentElement;
  
  // Apply Accent Color
  if (color && ACCENT_COLORS[color as keyof typeof ACCENT_COLORS]) {
    root.style.setProperty('--primary', ACCENT_COLORS[color as keyof typeof ACCENT_COLORS]);
    // Also update ring color if needed
    root.style.setProperty('--ring', ACCENT_COLORS[color as keyof typeof ACCENT_COLORS]);
  }

  // Apply Interface Style
  if (style === 'Minimalista') {
    root.classList.add('style-minimalist');
    root.classList.remove('style-modern');
  } else {
    root.classList.add('style-modern');
    root.classList.remove('style-minimalist');
  }

  // Save to localStorage
  localStorage.setItem('app-accent-color', color);
  localStorage.setItem('app-interface-style', style);
};
