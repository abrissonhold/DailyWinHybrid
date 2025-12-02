import React from 'react';
import { Text as PaperText, TextProps } from 'react-native-paper';
import { Platform, StyleSheet } from 'react-native';
import { useThemeContext } from '../context/ThemeProvider';

const ThemedText = (props: TextProps<any>) => {
    const { style, ...rest } = props;
    const { paperTheme } = useThemeContext();

    const webStyles = Platform.OS === 'web' ? { userSelect: 'none' } : {};

    return <PaperText style={[styles.text, { color: paperTheme.colors.text }, style, webStyles]} {...rest} />;
};

const styles = StyleSheet.create({
    text: {
    },
});

export default ThemedText;
