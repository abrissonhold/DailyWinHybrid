import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { signOut } from 'firebase/auth';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Appbar , MD3Theme } from 'react-native-paper';
import CustomAlert from '../../components/CustomAlert';
import ThemedText from '../../components/ThemedText';
import { TAB_BAR_HEIGHT } from '../../constants/styles';
import { useThemeContext } from '../../context/ThemeProvider';
import i18n from '../../services/i18n';
import { auth } from '../../services/firebase';
import { Theme as NavTheme } from '@react-navigation/native';

const SettingsScreen = () => {
  const { t } = useTranslation();
  const { colorScheme, setTheme, navTheme, paperTheme } = useThemeContext();
  const styles = themedStyles(navTheme, paperTheme);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        router.replace('/login');
      })
      .catch((error) => {
        setAlertMessage(error.message);
        setAlertVisible(true);
      });
  };

  type OptionRowProps = {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    value?: string;
    onPress?: () => void;
    children?: React.ReactNode;
  };

  const OptionRow: React.FC<OptionRowProps> = ({ icon, title, value, onPress, children }) => (
    <TouchableOpacity style={styles.optionRow} onPress={onPress} disabled={!onPress}>
      <View style={styles.optionInfo}>
        <Ionicons name={icon} size={24} color={navTheme.colors.primary} style={styles.optionIcon} />
        <ThemedText style={styles.optionTitle}>{title}</ThemedText>
      </View>
      {value && <ThemedText style={styles.optionValue}>{value}</ThemedText>}
      {children}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title={t('settings.title')} />
      </Appbar.Header>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>{t('settings.general.title')}</ThemedText>
          <OptionRow icon="person-circle-outline" title={t('settings.general.profile')} onPress={() => { /* Navigate to profile */ }} />
          <OptionRow icon="notifications-outline" title={t('settings.general.notifications')} onPress={() => { /* Navigate to notifications */ }} />
        </View>

        <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>{t('settings.appearance.title')}</ThemedText>
        <OptionRow icon="color-palette-outline" title={t('settings.appearance.theme')}>
          <View style={styles.themeSelector}>
            <TouchableOpacity
              style={[styles.themeButton, colorScheme === 'light' && styles.themeButtonActive]}
              onPress={() => setTheme('light')}
            >
              <ThemedText style={[styles.themeButtonText, colorScheme === 'light' && styles.themeButtonTextActive]}>{t('settings.appearance.light')}</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.themeButton, colorScheme === 'dark' && styles.themeButtonActive]}
              onPress={() => setTheme('dark')}
            >
              <ThemedText style={[styles.themeButtonText, colorScheme === 'dark' && styles.themeButtonTextActive]}>{t('settings.appearance.dark')}</ThemedText>
            </TouchableOpacity>
          </View>
        </OptionRow>
        <OptionRow icon="language-outline" title={t('settings.appearance.language')}>
        <View style={styles.themeSelector}>
            <TouchableOpacity
              style={[styles.themeButton, i18n.language === 'en' && styles.themeButtonActive]}
              onPress={() => i18n.changeLanguage('en')}
            >
              <ThemedText style={[styles.themeButtonText, i18n.language === 'en' && styles.themeButtonTextActive]}>EN</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.themeButton, i18n.language === 'es' && styles.themeButtonActive]}
              onPress={() => i18n.changeLanguage('es')}
            >
              <ThemedText style={[styles.themeButtonText, i18n.language === 'es' && styles.themeButtonTextActive]}>ES</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.themeButton, i18n.language === 'pt' && styles.themeButtonActive]}
              onPress={() => i18n.changeLanguage('pt')}
            >
              <ThemedText style={[styles.themeButtonText, i18n.language === 'pt' && styles.themeButtonTextActive]}>PT</ThemedText>
            </TouchableOpacity>
          </View>
        </OptionRow>
      </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color={paperTheme.colors.error} />
          <ThemedText style={styles.logoutButtonText}>{t('settings.logout')}</ThemedText>
        </TouchableOpacity>
      </ScrollView>
      <CustomAlert
        visible={alertVisible}
        title={t('settings.logoutError')}
        message={alertMessage}
        onDismiss={() => setAlertVisible(false)}
        buttons={[{ text: 'OK', onPress: () => setAlertVisible(false) }]}
      />
    </View>
  );
};

const themedStyles = (theme: NavTheme, paperTheme: MD3Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 12,
    backgroundColor: theme.colors.background,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  headerButton: {
    padding: 8,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: TAB_BAR_HEIGHT,
  },
  section: {
    marginTop: 20,
    marginHorizontal: 16,
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  optionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionIcon: {
    marginRight: 16,
  },
  optionTitle: {
    fontSize: 16,
    color: theme.colors.text,
  },
  optionValue: {
    fontSize: 16,
    color: theme.colors.text,
  },
  themeSelector: {
    flexDirection: 'row',
    backgroundColor: theme.colors.background,
    borderRadius: 20,
    padding: 4,
  },
  themeButton: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  themeButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  themeButtonText: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: '600',
  },
  themeButtonTextActive: {
    color: theme.colors.card,
  },
  languageSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    margin: 16,
    marginTop: 30,
    padding: 16,
  },
  logoutButtonText: {
    fontSize: 16,
    color: paperTheme.colors.error,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default SettingsScreen;
