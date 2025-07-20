import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Appearance } from 'react-native';

// Define color palettes for light and dark themes
const lightColors = {
  background: '#FFFFFF',
  surface: '#F7F7F7',
  primary: '#2563eb',
  onPrimary: '#FFFFFF',
  text: '#222222',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  error: '#EF4444',
  onError: '#FFFFFF',
};

const darkColors = {
  background: '#18181B',
  surface: '#23232A',
  primary: '#60A5FA',
  onPrimary: '#18181B',
  text: '#F3F4F6',
  textSecondary: '#A1A1AA',
  border: '#27272A',
  error: '#F87171',
  onError: '#18181B',
};

// 1. Add textSize (0=small, 1=medium, 2=large) and setTextSize to the context state.
// 2. fontSize values should be mapped based on textSize: e.g.,
//    small: [13, 15, 17], medium: [15, 17, 20], large: [18, 20, 24] (or similar)
// 3. Remove any fontScale logic.
// 4. Update ThemeContextProps and ThemeProvider accordingly.
const fontSize = {
  small:  [18, 24, 32],   // [small, medium, large]
  medium: [22, 30, 40],   // [small, medium, large]
  large:  [26, 36, 48],   // [small, medium, large]
};

export type ThemeType = 'light' | 'dark';

interface ThemeContextProps {
  theme: ThemeType;
  colors: typeof lightColors;
  fontSize: typeof fontSize;
  textSize: number; // 0=small, 1=medium, 2=large
  setTheme: (theme: ThemeType) => void;
  setTextSize: (size: number) => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const systemTheme = Appearance.getColorScheme() === 'dark' ? 'dark' : 'light';
  const [theme, setTheme] = useState<ThemeType>(systemTheme);
  const [textSize, setTextSize] = useState<number>(1); // Default to medium

  const value: ThemeContextProps = {
    theme,
    colors: theme === 'dark' ? darkColors : lightColors,
    fontSize,
    textSize,
    setTheme,
    setTextSize,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}; 