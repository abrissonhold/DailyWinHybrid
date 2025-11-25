import { DarkTheme as NDarkTheme, DefaultTheme as NavDefaultTheme } from '@react-navigation/native';
import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';

const baseColors = {
    primary: '#7528a5ff',
    accent: '#f5ba0cff',
};

const lightThemeColors = {
    ...NavDefaultTheme.colors,
    ...MD3LightTheme.colors,
    ...baseColors,
    background: '#f5f5f5',
    card: '#ffffff',
    text: '#333333',
    icon: '#666666',
    tabIconDefault: '#ccc',
    border: '#e0e0e0',
    notification: baseColors.primary,
};

const darkThemeColors = {
    ...NDarkTheme.colors,
    ...MD3DarkTheme.colors,
    ...baseColors,
    background: '#121212',
    card: '#1e1e1e',
    text: '#ffffff',
    icon: '#aaaaaa',
    tabIconDefault: '#555',
    border: '#333333',
    notification: baseColors.primary,
};

export const FONT_SIZES = {
    title: 24,
    subtitle: 18,
    body: 16,
    caption: 12,
};

export const PaperLightTheme = {
    ...MD3LightTheme,
    colors: lightThemeColors,
};

export const PaperDarkTheme = {
    ...MD3DarkTheme,
    colors: darkThemeColors,
};

export const NavLightTheme = {
    ...NavDefaultTheme,
    colors: lightThemeColors,
};

export const NavDarkTheme = {
    ...NDarkTheme,
    colors: darkThemeColors,
};
