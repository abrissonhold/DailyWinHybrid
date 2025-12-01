import { DarkTheme as NavDarkTheme, DefaultTheme as NavDefaultTheme } from '@react-navigation/native';
import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';
import { Colors, baseColors } from './theme';

export const AppLightTheme = {
    ...NavDefaultTheme,
    ...MD3LightTheme,
    colors: {
        ...NavDefaultTheme.colors,
        ...MD3LightTheme.colors,
        background: Colors.light.background,
        card: Colors.light.card,
        text: Colors.light.text,
        primary: baseColors.primary,
        notification: baseColors.primary,
        border: Colors.light.border,
    },
};

export const AppDarkTheme = {
    ...NavDarkTheme,
    ...MD3DarkTheme,
    colors: {
        ...NavDarkTheme.colors,
        ...MD3DarkTheme.colors,
        background: Colors.dark.background,
        card: Colors.dark.card,
        text: Colors.dark.text,
        primary: baseColors.primary,
        notification: baseColors.primary,
        border: Colors.dark.border,
    },
};
