import { router } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomAlert from '../components/CustomAlert';
import ThemedText from '../components/ThemedText';
import { useThemeContext } from '../context/ThemeProvider';
import { auth } from '../services/firebase';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const { paperTheme } = useThemeContext();
  const styles = themedStyles(paperTheme);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  const handleLogin = () => {
    if (!email || !password) {
        setAlertMessage('Por favor, ingresa tu correo y contraseña.');
        setAlertVisible(true);
        return;
    }

    signInWithEmailAndPassword(auth, email, password)
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
          Bienvenido
        </ThemedText>
        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
          mode="outlined"
        />
        <TextInput
          label="Contraseña"
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
        <Button mode="contained" onPress={handleLogin} style={styles.button}>
          Iniciar Sesión
        </Button>
        <Button onPress={() => router.push('/register')} style={styles.button}>
          ¿No tienes una cuenta? Regístrate
        </Button>
      </View>
      <CustomAlert
        visible={alertVisible}
        title="Error"
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

export default LoginScreen;
