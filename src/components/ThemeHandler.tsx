import { useEffect } from 'react';
import { ACCENT_COLORS, applyTheme } from '@/lib/theme';

const ThemeHandler = () => {
  useEffect(() => {
    const handleApply = () => {
      // 1. Apply Accent Color and Style
      const savedColor = localStorage.getItem('app-accent-color') || 'indigo';
      const savedStyle = localStorage.getItem('app-interface-style') || 'Moderno';
      applyTheme(savedColor, savedStyle);

      // 2. Apply Dark Mode
      const savedTheme = localStorage.getItem('app-theme') || 'light';
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    handleApply();

    const storageListener = (e: StorageEvent) => {
      if (['app-theme', 'app-accent-color', 'app-interface-style'].includes(e.key || '')) {
        handleApply();
      }
    };

    // Listen for changes from other tabs
    window.addEventListener('storage', storageListener);

    return () => window.removeEventListener('storage', storageListener);
  }, []);

  return null;
};

export default ThemeHandler;
