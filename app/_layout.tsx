import React, { useEffect, useState } from 'react';
import { Slot, useRouter } from 'expo-router';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../services/firebase';
import { useNotifications } from '../hooks/useNotifications';
import '../services/i18n';
import { ThemeProvider } from '../context/ThemeProvider';

const RootLayout = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  useNotifications();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        router.replace('/(tabs)/home');
      } else {
        router.replace('/login');
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <ThemeProvider>
      <Slot />
    </ThemeProvider>
  );
};

export default RootLayout;
