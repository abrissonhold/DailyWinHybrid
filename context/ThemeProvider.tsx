import { Theme as NavTheme, ThemeProvider as NavThemeProvider } from '@react-navigation/native';
import React, { createContext, useContext, ReactNode } from 'react';
import { MD3Theme, Provider as PaperProvider } from 'react-native-paper';
import { NavLightTheme, NavDarkTheme, PaperLightTheme, PaperDarkTheme } from '../constants/theme';
import { useTheme } from '../hooks/useTheme';

interface ThemeContextType {
  colorScheme: string;
  setTheme: (theme: string) => void;
  navTheme: NavTheme;
  paperTheme: MD3Theme;
}

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

  const navTheme = activeScheme === 'dark' ? NavDarkTheme : NavLightTheme;
  const paperTheme = activeScheme === 'dark' ? PaperDarkTheme : PaperLightTheme;

  return (
    <ThemeContext.Provider value={{ colorScheme: activeScheme, setTheme, navTheme, paperTheme }}>
      <PaperProvider theme={paperTheme}>
        <NavThemeProvider value={navTheme}>
          {children}
        </NavThemeProvider>
      </PaperProvider>
    </ThemeContext.Provider>
  );
};
