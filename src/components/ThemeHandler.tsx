import { useEffect } from 'react';

import {
  applyTheme,
  AccentColor,
  InterfaceStyle,
} from '@/lib/theme';

/**
 * ThemeHandler
 * Se encarga de:
 * - Aplicar tema claro/oscuro
 * - Aplicar color de acento
 * - Aplicar estilo de interfaz
 * - Escuchar cambios en localStorage
 * - Evitar errores si faltan valores
 */

const ThemeHandler = () => {
  useEffect(() => {
    const root = document.documentElement;

    const handleApply = () => {
      try {
        // =========================
        // Accent Color + UI Style
        // =========================
        const savedColor =
          (localStorage.getItem(
            'app-accent-color'
          ) as AccentColor) || 'indigo';

        const savedStyle =
          (localStorage.getItem(
            'app-interface-style'
          ) as InterfaceStyle) || 'Moderno';

        applyTheme(savedColor, savedStyle);

        // =========================
        // Dark / Light Theme
        // =========================
        const savedTheme =
          localStorage.getItem('app-theme') || 'light';

        root.classList.remove('light', 'dark');

        if (savedTheme === 'dark') {
          root.classList.add('dark');
        } else {
          root.classList.add('light');
        }

        // =========================
        // Save current theme
        // =========================
        root.setAttribute('data-theme', savedTheme);
      } catch (error) {
        console.error('ThemeHandler Error:', error);
      }
    };

    // =========================
    // Initial Apply
    // =========================
    handleApply();

    // =========================
    // Listen storage changes
    // =========================
    const storageListener = (e: StorageEvent) => {
      const themeKeys = [
        'app-theme',
        'app-accent-color',
        'app-interface-style',
      ];

      if (themeKeys.includes(e.key || '')) {
        handleApply();
      }
    };

    // =========================
    // Custom theme event
    // =========================
    const customListener = () => {
      handleApply();
    };

    window.addEventListener('storage', storageListener);

    window.addEventListener(
      'theme-change',
      customListener
    );

    return () => {
      window.removeEventListener(
        'storage',
        storageListener
      );

      window.removeEventListener(
        'theme-change',
        customListener
      );
    };
  }, []);

  return null;
};

export default ThemeHandler;