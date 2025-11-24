import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import { Slot, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { ThemeProvider } from "../context/ThemeProvider";
import "../styles/leaflet.css";


SplashScreen.preventAutoHideAsync();

const Gate = () => {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [fontsLoaded] = useFonts({
    ...Ionicons.font,
    ...MaterialCommunityIcons.font,
  });

  // Redirect when auth is ready
  useEffect(() => {
    if (!loading) {
      if (user) router.replace("/(tabs)/home");
      else router.replace("/login");
    }
  }, [loading, user]);

  // Hide splash only when everything is ready
  useEffect(() => {
    if (!loading && fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [loading, fontsLoaded]);

  if (loading || !fontsLoaded) return null;

  return <Slot />;
};

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Gate />
      </AuthProvider>
    </ThemeProvider>
  );
}
