import { useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useTheme = () => {
  const systemColorScheme = useColorScheme();
  const [colorScheme, setColorScheme] = useState(systemColorScheme);

  useEffect(() => {
    const loadTheme = async () => {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme) {
        setColorScheme(savedTheme);
      }
    };
    loadTheme();
  }, []);

  const setTheme = async (theme) => {
    await AsyncStorage.setItem('theme', theme);
    setColorScheme(theme);
  };

  return { colorScheme, setTheme };
};
