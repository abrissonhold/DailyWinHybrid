import React from 'react';
import { Text as PaperText, TextProps } from 'react-native-paper';
import { Platform, StyleSheet } from 'react-native';

const ThemedText = (props: TextProps<any>) => {
    const { style, ...rest } = props;

    const webStyles = Platform.OS === 'web' ? { userSelect: 'none' } : {};

    return <PaperText style={[styles.text, style, webStyles]} {...rest} />;
};

const styles = StyleSheet.create({
    text: {
    },
});

export default ThemedText;
