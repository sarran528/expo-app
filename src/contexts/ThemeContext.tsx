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

const fontSize = {
  small: 14,
  medium: 17,
  large: 22,
  xlarge: 28,
};

export type ThemeType = 'light' | 'dark';

interface ThemeContextProps {
  theme: ThemeType;
  colors: typeof lightColors;
  fontSize: typeof fontSize;
  setTheme: (theme: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const systemTheme = Appearance.getColorScheme() === 'dark' ? 'dark' : 'light';
  const [theme, setTheme] = useState<ThemeType>(systemTheme);

  const value: ThemeContextProps = {
    theme,
    colors: theme === 'dark' ? darkColors : lightColors,
    fontSize,
    setTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}; 