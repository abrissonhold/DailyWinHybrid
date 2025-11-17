import React from 'react';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../../services/firebase';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useThemeContext } from '../../context/ThemeProvider';

const SettingsScreen = () => {
  const { t, i18n } = useTranslation();
  const { colorScheme, setTheme } = useThemeContext();

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        router.replace('/login');
      })
      .catch((error) => {
        Alert.alert('Error', error.message);
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('settings.title')}</Text>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Language</Text>
        <View style={styles.buttons}>
          <Button title="English" onPress={() => i18n.changeLanguage('en')} />
          <Button title="Español" onPress={() => i18n.changeLanguage('es')} />
          <Button title="Português" onPress={() => i18n.changeLanguage('pt')} />
        </View>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Theme</Text>
        <Text>Current theme: {colorScheme}</Text>
        <View style={styles.buttons}>
          <Button title="Light" onPress={() => setTheme('light')} />
          <Button title="Dark" onPress={() => setTheme('dark')} />
        </View>
      </View>
      <Button title={t('settings.logout')} onPress={handleLogout} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
});

export default SettingsScreen;
