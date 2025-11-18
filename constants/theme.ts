import { DarkTheme as NDarkTheme, DefaultTheme as NavDefaultTheme } from '@react-navigation/native';
import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';

export const COLORS = {
    primary: '#7528a5ff',
    accent: '#f5ba0cff',

    light: {
        background: '#f5f5f5',
        card: '#ffffff',
        text: '#333333',
        icon: '#666666',
        tabIconDefault: '#ccc',
        border: '#e0e0e0',
    },
    dark: {
        background: '#121212',
        card: '#1e1e1e',
        text: '#ffffff',
        icon: '#aaaaaa',
        tabIconDefault: '#555',
        border: '#333333',
    },
};

export const FONT_SIZES = {
    title: 24,
    subtitle: 18,
    body: 16,
    caption: 12,
};

export const PaperLightTheme = {
    ...MD3LightTheme,
    colors: {
        ...MD3LightTheme.colors,
        background: COLORS.light.background,
        primary: COLORS.primary,
    },
};

export const PaperDarkTheme = {
    ...MD3DarkTheme,
    colors: {
        ...MD3DarkTheme.colors,
        background: COLORS.dark.background,
        primary: COLORS.primary,
    },
};

export const NavLightTheme = {
    ...NavDefaultTheme,
    colors: {
        ...NavDefaultTheme.colors,
        background: COLORS.light.background,
        card: COLORS.light.card,
        text: COLORS.light.text,
        primary: COLORS.primary,
        notification: COLORS.primary,
        border: COLORS.light.border,
    },
};

export const NavDarkTheme = {
    ...NDarkTheme,
    colors: {
        ...NDarkTheme.colors,
        background: COLORS.dark.background,
        card: COLORS.dark.card,
        text: COLORS.dark.text,
        primary: COLORS.primary,
        notification: COLORS.primary,
        border: COLORS.dark.border,
    },
};
