import React from 'react';
import { StyleSheet } from 'react-native';
import { Button, Card, Modal, Portal } from 'react-native-paper';
import { useThemeContext } from '../context/ThemeProvider';
import ThemedText from './ThemedText';

interface AlertButton {
    text: string;
    onPress: () => void;
    style?: 'cancel' | 'destructive' | 'default';
}

interface CustomAlertProps {
    visible: boolean;
    title: string;
    message: string;
    buttons: AlertButton[];
    onDismiss: () => void;
}

const CustomAlert = ({
    visible,
    title,
    message,
    buttons,
    onDismiss,
}: CustomAlertProps) => {
    const { paperTheme } = useThemeContext();
    const styles = themedStyles(paperTheme);

    return (
        <Portal>
            <Modal
                visible={visible}
                onDismiss={onDismiss}
                contentContainerStyle={styles.container}
            >
                <Card>
                    <Card.Content>
                        <ThemedText style={styles.title}>{title}</ThemedText>
                        <ThemedText style={styles.message}>{message}</ThemedText>
                    </Card.Content>
                    <Card.Actions>
                        {buttons.map((button, index) => (
                            <Button
                                key={index}
                                onPress={button.onPress}
                                textColor={
                                    button.style === 'destructive'
                                        ? paperTheme.colors.error
                                        : paperTheme.colors.primary
                                }
                            >
                                {button.text}
                            </Button>
                        ))}
                    </Card.Actions>
                </Card>
            </Modal>
        </Portal>
    );
};

const themedStyles = (theme: any) =>
    StyleSheet.create({
        container: {
            padding: 20,
            margin: 20,
            borderRadius: 10,
        },
        title: {
            fontSize: 18,
            fontWeight: 'bold',
            marginBottom: 10,
            color: theme.colors.text,
        },
        message: {
            fontSize: 16,
            marginBottom: 20,
            color: theme.colors.text,
        },
    });

export default CustomAlert;
