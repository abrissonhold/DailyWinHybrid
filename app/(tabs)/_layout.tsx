import { Tabs } from 'expo-router';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext } from '../../context/ThemeProvider';

type ColorScheme = 'light' | 'dark';
type IconName = keyof typeof Ionicons.glyphMap;

interface TabConfig {
  name: string;
  title: string;
  icon: IconName;
}

const TABS: TabConfig[] = [
  { name: 'home', title: 'Home', icon: 'home' },
  { name: 'calendar', title: 'Calendar', icon: 'calendar' },
  { name: 'stats', title: 'Stats', icon: 'stats-chart' },
  { name: 'settings', title: 'Settings', icon: 'settings' },
];

const COLORS = {
  light: {
    tint: '#000',
    background: '#fff',
  },
  dark: {
    tint: '#fff',
    background: '#000',
  },
} as const;

export default function TabLayout() {
  const { colorScheme } = useThemeContext();
  const currentColorScheme: ColorScheme = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = COLORS[currentColorScheme];

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.tint,
        headerShown: false,
      }}
    >
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ color }) => (
              <Ionicons size={28} name={tab.icon} color={color} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}