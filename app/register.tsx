import { router } from 'expo-router';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { Button, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomAlert from '../components/CustomAlert';
import ThemedText from '../components/ThemedText';
import { useThemeContext } from '../context/ThemeProvider';
import { auth } from '../services/firebase';

const RegisterScreen = () => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const { paperTheme } = useThemeContext();
  const styles = themedStyles(paperTheme);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  const handleRegister = () => {
    if (!name || !lastName || !email || !password) {
        setAlertMessage(t('register.alerts.missingFields'));
        setAlertVisible(true);
        return;
    }

    createUserWithEmailAndPassword(auth, email, password)
      .then(() => {
        router.replace('/(tabs)/home');
      })
      .catch((error) => {
        setAlertMessage(error.message);
        setAlertVisible(true);
      });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <ThemedText variant="headlineLarge" style={styles.title}>
            {t('register.title')}
        </ThemedText>
        <TextInput
            label={t('register.nameLabel')}
            value={name}
            onChangeText={setName}
            style={styles.input}
            mode="outlined"
        />
        <TextInput
            label={t('register.lastNameLabel')}
            value={lastName}
            onChangeText={setLastName}
            style={styles.input}
            mode="outlined"
        />
        <TextInput
            label={t('register.emailLabel')}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
            mode="outlined"
        />
        <TextInput
            label={t('register.passwordLabel')}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!passwordVisible}
            style={styles.input}
            mode="outlined"
            right={
                <TextInput.Icon
                    icon={passwordVisible ? 'eye-off' : 'eye'}
                    onPress={() => setPasswordVisible(!passwordVisible)}
                />
            }
        />
        <Button mode="contained" onPress={handleRegister} style={styles.button}>
            {t('register.registerButton')}
        </Button>
        <Button onPress={() => router.push('/login')} style={styles.button}>
            {t('register.loginButton')}
        </Button>
      </View>
      <CustomAlert
        visible={alertVisible}
        title={t('register.alerts.errorTitle')}
        message={alertMessage}
        onDismiss={() => setAlertVisible(false)} 
        buttons={[]}      
        />
    </SafeAreaView>
  );
};

const themedStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      padding: 16,
    },
    title: {
      textAlign: 'center',
      marginBottom: 24,
      color: theme.colors.text,
    },
    input: {
      marginBottom: 16,
    },
    button: {
      marginTop: 8,
    },
  });

export default RegisterScreen;
