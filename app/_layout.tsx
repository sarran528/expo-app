import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Platform, AccessibilityInfo } from 'react-native';
import { ThemeProvider } from '../contexts/ThemeContext';

export default function RootLayout() {
  useFrameworkReady();

  useEffect(() => {
    // Enable accessibility features
    if (Platform.OS === 'ios') {
      AccessibilityInfo.setAccessibilityFocus;
    }
  }, []);

  return (
    <ThemeProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="text-reader" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </GestureHandlerRootView>
    </ThemeProvider>
  );
}