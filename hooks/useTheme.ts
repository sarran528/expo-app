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
  const [fontScale, setFontScale] = useState(1);

  useEffect(() => {
    loadThemePreferences();
  }, []);

  const loadThemePreferences = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      const savedFontScale = await AsyncStorage.getItem('fontScale');
      
      if (savedTheme !== null) {
        setIsDarkMode(savedTheme === 'dark');
      }
      
      if (savedFontScale !== null) {
        setFontScale(parseFloat(savedFontScale));
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

  const updateFontScale = async (scale: number) => {
    try {
      setFontScale(scale);
      await AsyncStorage.setItem('fontScale', scale.toString());
    } catch (error) {
      console.log('Error saving font scale:', error);
    }
  };

  const colors = isDarkMode ? darkColors : lightColors;
  
  const fontSize: FontSizes = {
    small: baseFontSizes.small * fontScale,
    medium: baseFontSizes.medium * fontScale,
    large: baseFontSizes.large * fontScale,
    xlarge: baseFontSizes.xlarge * fontScale,
    xxlarge: baseFontSizes.xxlarge * fontScale,
  };

  return {
    colors,
    fontSize,
    fontScale,
    isDarkMode,
    toggleTheme,
    updateFontScale,
  };
}