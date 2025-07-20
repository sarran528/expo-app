import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

interface ColorScheme {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  onPrimary: string;
  onSecondary: string;
  onError: string;
  error: string;
  success: string;
  warning: string;
  border: string;
  overlay: string;
}

interface FontSizes {
  small: number;
  medium: number;
  large: number;
  xlarge: number;
  xxlarge: number;
}

const lightColors: ColorScheme = {
  primary: '#0066CC',
  secondary: '#00AA44',
  background: '#FFFFFF',
  surface: '#F8F9FA',
  text: '#1A1A1A',
  textSecondary: '#666666',
  onPrimary: '#FFFFFF',
  onSecondary: '#FFFFFF',
  onError: '#FFFFFF',
  error: '#CC0000',
  success: '#00AA44',
  warning: '#FF8800',
  border: '#E0E0E0',
  overlay: 'rgba(0, 0, 0, 0.3)',
};

const darkColors: ColorScheme = {
  primary: '#4D9FFF',
  secondary: '#33CC66',
  background: '#121212',
  surface: '#1E1E1E',
  text: '#FFFFFF',
  textSecondary: '#CCCCCC',
  onPrimary: '#000000',
  onSecondary: '#000000',
  onError: '#FFFFFF',
  error: '#FF4444',
  success: '#33CC66',
  warning: '#FFAA33',
  border: '#333333',
  overlay: 'rgba(0, 0, 0, 0.5)',
};

const baseFontSizes: FontSizes = {
  small: 14,
  medium: 16,
  large: 20,
  xlarge: 24,
  xxlarge: 32,
};

export function useTheme() {
  const systemColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(systemColorScheme === 'dark');
  const [fontSize, setFontSize] = useState(1); // Changed from fontScale to fontSize

  useEffect(() => {
    loadThemePreferences();
  }, []);

  const loadThemePreferences = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      const savedFontSize = await AsyncStorage.getItem('fontSize'); // Changed from fontScale to fontSize
      
      if (savedTheme !== null) {
        setIsDarkMode(savedTheme === 'dark');
      }
      
      if (savedFontSize !== null) {
        setFontSize(parseFloat(savedFontSize));
      }
    } catch (error) {
      console.log('Error loading theme preferences:', error);
    }
  };

  const toggleTheme = async () => {
    try {
      const newTheme = !isDarkMode;
      setIsDarkMode(newTheme);
      await AsyncStorage.setItem('theme', newTheme ? 'dark' : 'light');
    } catch (error) {
      console.log('Error saving theme preference:', error);
    }
  };

  // Removed updateFontScale function

  const colors = isDarkMode ? darkColors : lightColors;
  
  // Removed fontSize calculation based on fontScale
  const fontSizeValues = {
    small: baseFontSizes.small,
    medium: baseFontSizes.medium,
    large: baseFontSizes.large,
  };

  return {
    colors,
    fontSize: fontSizeValues, // Return the calculated fontSize values
    isDarkMode,
    toggleTheme,
    // Removed updateFontScale from return
  };
}