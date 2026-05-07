export const ACCENT_COLORS = {
  indigo: '230 70% 50%',
  rose: '346 84% 61%',
  emerald: '160 84% 39%',
  amber: '38 92% 50%',
  violet: '262 83% 58%',
};

export type AccentColor = keyof typeof ACCENT_COLORS;

export type InterfaceStyle = 'Moderno' | 'Minimalista';

/**
 * Obtiene valores guardados del tema
 */
export const getSavedThemeConfig = () => {
  return {
    color:
      (localStorage.getItem('app-accent-color') as AccentColor) || 'indigo',

    style:
      (localStorage.getItem(
        'app-interface-style'
      ) as InterfaceStyle) || 'Moderno',

    theme: localStorage.getItem('app-theme') || 'light',
  };
};

/**
 * Aplica colores, estilos y tema visual
 */
export const applyTheme = (
  color: AccentColor = 'indigo',
  style: InterfaceStyle = 'Moderno'
) => {
  const root = document.documentElement;

  // =========================
  // APPLY ACCENT COLOR
  // =========================
  const selectedColor =
    ACCENT_COLORS[color] || ACCENT_COLORS.indigo;

  root.style.setProperty('--primary', selectedColor);
  root.style.setProperty('--ring', selectedColor);

  // Extra variables opcionales
  root.style.setProperty('--accent', selectedColor);

  // =========================
  // APPLY INTERFACE STYLE
  // =========================
  root.classList.remove(
    'style-modern',
    'style-minimalist'
  );

  if (style === 'Minimalista') {
    root.classList.add('style-minimalist');
  } else {
    root.classList.add('style-modern');
  }

  // =========================
  // SAVE SETTINGS
  // =========================
  localStorage.setItem('app-accent-color', color);
  localStorage.setItem('app-interface-style', style);

  // =========================
  // DISPATCH CUSTOM EVENT
  // =========================
  window.dispatchEvent(new Event('theme-change'));
};

/**
 * Aplica dark mode / light mode
 */
export const applyColorMode = (
  theme: 'light' | 'dark'
) => {
  const root = document.documentElement;

  root.classList.remove('light', 'dark');

  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.add('light');
  }

  root.setAttribute('data-theme', theme);

  localStorage.setItem('app-theme', theme);

  window.dispatchEvent(new Event('theme-change'));
};

/**
 * Toggle automático del tema
 */
export const toggleTheme = () => {
  const current =
    localStorage.getItem('app-theme') || 'light';

  applyColorMode(
    current === 'dark' ? 'light' : 'dark'
  );
};