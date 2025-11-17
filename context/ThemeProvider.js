import React, { createContext, useContext } from 'react';
import { useTheme } from '../hooks/useTheme';
import { ThemeProvider as NavThemeProvider } from '@react-navigation/native';
import { DarkTheme, DefaultTheme } from '@react-navigation/native';

const ThemeContext = createContext();

export const useThemeContext = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const { colorScheme, setTheme } = useTheme();
  const navigationTheme = colorScheme === 'dark' ? DarkTheme : DefaultTheme;

  return (
    <ThemeContext.Provider value={{ colorScheme, setTheme }}>
      <NavThemeProvider value={navigationTheme}>
        {children}
      </NavThemeProvider>
    </ThemeContext.Provider>
  );
};
