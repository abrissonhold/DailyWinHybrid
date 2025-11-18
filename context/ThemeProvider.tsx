import { DarkTheme, DefaultTheme, ThemeProvider as NavThemeProvider } from '@react-navigation/native';
import React, { createContext, useContext, ReactNode } from 'react';
import { COLORS } from '../constants/theme';
import { useTheme } from '../hooks/useTheme';

interface ThemeContextType {
  colorScheme: string;
  setTheme: (theme: string) => void;
  theme: typeof lightTheme;
}

const lightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: COLORS.light.background,
    card: COLORS.light.card,
    text: COLORS.light.text,
    primary: COLORS.primary,
  },
};

const darkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: COLORS.dark.background,
    card: COLORS.dark.card,
    text: COLORS.dark.text,
    primary: COLORS.primary,
  },
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const { colorScheme, setTheme } = useTheme();
  const activeScheme = colorScheme ?? 'light';
  const theme = activeScheme === 'dark' ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ colorScheme: activeScheme, setTheme, theme }}>
      <NavThemeProvider value={theme}>
        {children}
      </NavThemeProvider>
    </ThemeContext.Provider>
  );
};
