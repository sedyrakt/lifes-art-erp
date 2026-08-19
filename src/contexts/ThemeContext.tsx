import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// ============================================================
// TYPES
// ============================================================
interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  getThemeClass: (lightClass: string, darkClass: string) => string;
  getBgClass: (lightBg?: string, darkBg?: string) => string;
  getTextClass: (lightText?: string, darkText?: string) => string;
  getBorderClass: (lightBorder?: string, darkBorder?: string) => string;
}

interface ThemeProviderProps {
  children: ReactNode;
}

// ============================================================
// CONTEXT
// ============================================================
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// ============================================================
// PROVIDER
// ============================================================
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Initialiser le thème depuis localStorage ou préférence système
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('theme');
    if (saved) {
      return saved === 'dark';
    }
    // Vérifier la préférence système
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return true;
    }
    return false;
  });

  // Appliquer le thème au document
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  // Écouter les changements de préférence système
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      // Ne changer que si l'utilisateur n'a pas de préférence enregistrée
      if (!localStorage.getItem('theme')) {
        setIsDark(e.matches);
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Basculer entre light et dark
  const toggleTheme = (): void => {
    setIsDark((prev) => !prev);
  };

  // Définir le thème manuellement
  const setTheme = (theme: 'light' | 'dark'): void => {
    setIsDark(theme === 'dark');
  };

  // Obtenir la classe en fonction du thème
  const getThemeClass = (lightClass: string, darkClass: string): string => {
    return isDark ? darkClass : lightClass;
  };

  // Obtenir la classe de background
  const getBgClass = (lightBg: string = 'bg-white', darkBg: string = 'bg-gray-800'): string => {
    return isDark ? darkBg : lightBg;
  };

  // Obtenir la classe de texte
  const getTextClass = (lightText: string = 'text-gray-900', darkText: string = 'text-gray-100'): string => {
    return isDark ? darkText : lightText;
  };

  // Obtenir la classe de bordure
  const getBorderClass = (lightBorder: string = 'border-gray-200', darkBorder: string = 'border-gray-700'): string => {
    return isDark ? darkBorder : lightBorder;
  };

  // Valeurs du contexte
  const value: ThemeContextType = {
    isDark,
    toggleTheme,
    setTheme,
    getThemeClass,
    getBgClass,
    getTextClass,
    getBorderClass,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// ============================================================
// HOOK PERSONNALISÉ
// ============================================================
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};