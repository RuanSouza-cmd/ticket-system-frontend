// src/contexts/ThemeContext.jsx

import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const THEMES = {
  light: { name: 'Light', value: 'light', icon: 'bx-sun' },
  dark: { name: 'Dark', value: 'dark', icon: 'bx-moon' },
  cupcake: { name: 'Cupcake', value: 'cupcake', icon: 'bx-cake' },
  bumblebee: { name: 'Bumblebee', value: 'bumblebee', icon: 'bx-bug' },
  emerald: { name: 'Emerald', value: 'emerald', icon: 'bx-leaf' },
  corporate: { name: 'Corporate', value: 'corporate', icon: 'bx-briefcase' },
  synthwave: { name: 'Synthwave', value: 'synthwave', icon: 'bx-music' },
  retro: { name: 'Retro', value: 'retro', icon: 'bx-time' },
  cyberpunk: { name: 'Cyberpunk', value: 'cyberpunk', icon: 'bx-chip' },
  valentine: { name: 'Valentine', value: 'valentine', icon: 'bx-heart' },
  halloween: { name: 'Halloween', value: 'halloween', icon: 'bx-ghost' },
  garden: { name: 'Garden', value: 'garden', icon: 'bx-leaf' },
  forest: { name: 'Forest', value: 'forest', icon: 'bx-tree' },
  aqua: { name: 'Aqua', value: 'aqua', icon: 'bx-water' },
  lofi: { name: 'Lo-Fi', value: 'lofi', icon: 'bx-headphone' },
  pastel: { name: 'Pastel', value: 'pastel', icon: 'bx-palette' },
  fantasy: { name: 'Fantasy', value: 'fantasy', icon: 'bx-star' },
  wireframe: { name: 'Wireframe', value: 'wireframe', icon: 'bx-grid' },
  black: { name: 'Black', value: 'black', icon: 'bx-moon' },
  luxury: { name: 'Luxury', value: 'luxury', icon: 'bx-diamond' },
  dracula: { name: 'Dracula', value: 'dracula', icon: 'bx-bat' },
  cmyk: { name: 'CMYK', value: 'cmyk', icon: 'bx-printer' },
  autumn: { name: 'Autumn', value: 'autumn', icon: 'bx-leaf' },
  business: { name: 'Business', value: 'business', icon: 'bx-building' },
  acid: { name: 'Acid', value: 'acid', icon: 'bx-test-tube' },
  lemonade: { name: 'Lemonade', value: 'lemonade', icon: 'bx-drink' },
  night: { name: 'Night', value: 'night', icon: 'bx-moon' },
  coffee: { name: 'Coffee', value: 'coffee', icon: 'bx-coffee' },
  winter: { name: 'Winter', value: 'winter', icon: 'bx-snowflake' },
  dim: { name: 'Dim', value: 'dim', icon: 'bx-adjust' },
  nord: { name: 'Nord', value: 'nord', icon: 'bx-compass' },
  sunset: { name: 'Sunset', value: 'sunset', icon: 'bx-sun' }
};

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');

  // Carrega tema salvo
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  // Salva e aplica tema
  const changeTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, changeTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme deve ser usado dentro de ThemeProvider');
  }
  return context;
}