import { Ionicons } from '@expo/vector-icons';
import { Tabs, router } from 'expo-router';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { useThemeContext } from '../../context/ThemeProvider';

const AddHabitButton = () => (
    <TouchableOpacity
        style={{
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#6A1B9A',
            width: 60,
            height: 60,
            borderRadius: 30,
            marginTop: -20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 8,
        }}
        onPress={() => router.push('/(tabs)/addHabit')}
    >
        <Ionicons name="add" size={32} color="#fff" />
    </TouchableOpacity>
);

export default function TabLayout() {
    const { theme } = useThemeContext();

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarShowLabel: false,
                tabBarStyle: {
                    position: 'absolute',
                    bottom: 25,
                    left: 20,
                    right: 20,
                    elevation: 0,
                    backgroundColor: theme.colors.card,
                    borderRadius: 15,
                    height: 70,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 10 },
                    shadowOpacity: 0.1,
                    shadowRadius: 10,
                },
                tabBarActiveTintColor: theme.colors.primary,
                tabBarInactiveTintColor: theme.colors.text,
            }}
        >
            <Tabs.Screen
                name="home"
                options={{
                    tabBarIcon: ({ color, focused }) => (
                        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                            <Ionicons name={focused ? 'home' : 'home-outline'} size={24} color={color} />
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="calendar"
                options={{
                    tabBarIcon: ({ color, focused }) => (
                        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                            <Ionicons name={focused ? 'calendar' : 'calendar-outline'} size={24} color={color} />
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="addHabit"
                options={{
                    tabBarButton: () => <AddHabitButton />,
                }}
            />
            <Tabs.Screen
                name="stats"
                options={{
                    tabBarIcon: ({ color, focused }) => (
                        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                            <Ionicons name={focused ? 'stats-chart' : 'stats-chart-outline'} size={24} color={color} />
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    tabBarIcon: ({ color, focused }) => (
                        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                            <Ionicons name={focused ? 'settings' : 'settings-outline'} size={24} color={color} />
                        </View>
                    ),
                }}
            />

            {/* Hidden screens */}
            <Tabs.Screen name="habit/[id]" options={{ href: null }} />
        </Tabs>
    );
}
