import { DarkTheme as NavDarkTheme, DefaultTheme as NavDefaultTheme } from '@react-navigation/native';
import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';
import { COLORS } from './theme';

export const AppLightTheme = {
    ...NavDefaultTheme,
    ...MD3LightTheme,
    colors: {
        ...NavDefaultTheme.colors,
        ...MD3LightTheme.colors,
        background: COLORS.light.background,
        card: COLORS.light.card,
        text: COLORS.light.text,
        primary: COLORS.primary,
        notification: COLORS.primary,
        border: COLORS.light.border,
    },
};

export const AppDarkTheme = {
    ...NavDarkTheme,
    ...MD3DarkTheme,
    colors: {
        ...NavDarkTheme.colors,
        ...MD3DarkTheme.colors,
        background: COLORS.dark.background,
        card: COLORS.dark.card,
        text: COLORS.dark.text,
        primary: COLORS.primary,
        notification: COLORS.primary,
        border: COLORS.dark.border,
    },
};
