import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Menu, Settings, Sun, Moon } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { useRouter } from 'expo-router';

interface HeaderProps {
  title: string;
  showMenu?: boolean;
}

export function Header({ title, showMenu = true }: HeaderProps) {
  const { colors, fontSize, isDarkMode, toggleTheme } = useTheme();
  const router = useRouter();

  const handleSettingsPress = () => {
    // In a real app, navigate to settings screen
    // router.push('/settings');
  };

  return (
    <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
      <View style={styles.headerContent}>
        <Text 
          style={[styles.title, { color: colors.text, fontSize: fontSize.xlarge }]}
          accessible={true}
          accessibilityRole="header"
          accessibilityLabel={`${title} screen`}
        >
          {title}
        </Text>
        
        {showMenu && (
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={toggleTheme}
              style={[styles.headerButton, { backgroundColor: colors.background }]}
              accessible={true}
              accessibilityLabel={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
              accessibilityRole="button"
            >
              {isDarkMode ? (
                <Sun size={24} color={colors.text} strokeWidth={2.5} />
              ) : (
                <Moon size={24} color={colors.text} strokeWidth={2.5} />
              )}
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={handleSettingsPress}
              style={[styles.headerButton, { backgroundColor: colors.background }]}
              accessible={true}
              accessibilityLabel="Open settings"
              accessibilityRole="button"
            >
              <Settings size={24} color={colors.text} strokeWidth={2.5} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    borderBottomWidth: 1,
    paddingTop: 8,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontWeight: '700',
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
});