
import React from 'react';
import { StyleSheet } from 'react-native';
import { Modal, Portal, Text, Button, Card } from 'react-native-paper';
import { useThemeContext } from '../context/ThemeProvider';

type CustomAlertProps = {
    visible: boolean;
    title: string;
    message: string;
    buttons: { text: string; onPress: () => void; style?: 'cancel' | 'destructive' }[];
    onDismiss: () => void;
};

export const CustomAlert: React.FC<CustomAlertProps> = ({
    visible,
    title,
    message,
    buttons,
    onDismiss,
}) => {
    const { paperTheme } = useThemeContext();

    return (
        <Portal>
            <Modal
                visible={visible}
                onDismiss={onDismiss}
                contentContainerStyle={[
                    styles.modalContainer,
                    { backgroundColor: paperTheme.colors.surface },
                ]}
            >
                <Card>
                    <Card.Title title={title} titleStyle={{ color: paperTheme.colors.onSurface }} />
                    <Card.Content>
                        <Text style={{ color: paperTheme.colors.onSurfaceVariant }}>{message}</Text>
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

const styles = StyleSheet.create({
    modalContainer: {
        padding: 20,
        margin: 20,
        borderRadius: 10,
    },
});
