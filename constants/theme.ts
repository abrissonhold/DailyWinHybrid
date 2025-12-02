import { DarkTheme as NDarkTheme, DefaultTheme as NavDefaultTheme } from '@react-navigation/native';
import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';

export const baseColors = {
    primary: '#8a3cba',
    accent: '#f7c325',
    success: '#4CAF50',
    streak: '#FF6B6B',
    priorityHigh: '#E53935',
    priorityMedium: '#FB8C00',
    priorityLow: '#43A047',
};

export const lightThemeColors = {
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
    chartColors: [
        '#8a3cba', '#f7c325', '#4CAF50', '#FF6B6B', '#E53935', '#FB8C00'
    ]
};

export const darkThemeColors = {
    ...NDarkTheme.colors,
    ...MD3DarkTheme.colors,
    ...baseColors,
    background: '#1c1c1e',
    card: '#2c2c2e',
    text: '#ffffff',
    icon: '#c7c7cc',
    tabIconDefault: '#555',
    border: '#3a3a3c',
    notification: baseColors.primary,
    chartColors: [
        '#c792ea', '#ffd700', '#81c784', '#ef9a9a', '#ef5350', '#ffb74d'
    ]
};


export const Colors = {
    light: lightThemeColors,
    dark: darkThemeColors,
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

export const hexToRgba = (hex: string, opacity: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

export const getPriorityColor = (priority: any, theme: any) => {
    switch (priority) {
        case 'HIGH': return theme.colors.priorityHigh;
        case 'MEDIUM': return theme.colors.priorityMedium;
        case 'LOW': return theme.colors.priorityLow;
        default: return theme.colors.text;
    }
};
