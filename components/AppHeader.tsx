import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Animated } from 'react-native';
import { Menu, Settings, X } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useRouter } from 'expo-router';

interface AppHeaderProps {
  title: string;
  showMenu?: boolean;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ title, showMenu = true }) => {
  const { colors, fontSize } = useTheme();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const slideAnim = React.useRef(new Animated.Value(-300)).current;

  const handleMenuPress = () => {
    setIsMenuOpen(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeMenu = () => {
    Animated.timing(slideAnim, {
      toValue: -300,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setIsMenuOpen(false);
    });
  };

  const handleSettingsPress = () => {
    closeMenu();
    router.push('/settings');
  };

  const renderMenuItem = (
    icon: React.ReactNode,
    title: string,
    onPress: () => void
  ) => (
    <TouchableOpacity
      style={[styles.menuItem, { borderBottomColor: colors.border }]}
      onPress={onPress}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <View style={styles.menuItemContent}>
        <View style={styles.menuItemIcon}>{icon}</View>
        <Text style={[styles.menuItemText, { color: colors.text, fontSize: fontSize.medium }]}>
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}> 
        <View style={styles.headerContent}>
          <Text style={[styles.title, { color: colors.text, fontSize: fontSize.xlarge }]} accessibilityRole="header" accessibilityLabel={`${title} screen`}>
            {title}
          </Text>
          {showMenu && (
            <View style={styles.headerActions}>
              <TouchableOpacity
                onPress={handleMenuPress}
                style={[styles.headerButton, { backgroundColor: colors.background }]}
                accessible={true}
                accessibilityLabel="Open menu"
                accessibilityRole="button"
              >
                <Menu size={24} color={colors.text} strokeWidth={2.5} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
      {/* Burger Menu Modal */}
      <Modal
        visible={isMenuOpen}
        transparent={true}
        animationType="none"
        onRequestClose={closeMenu}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={closeMenu}
        >
          <Animated.View
            style={[
              styles.menuContainer,
              {
                backgroundColor: colors.surface,
                transform: [{ translateX: slideAnim }],
              },
            ]}
          >
            <TouchableOpacity
              style={styles.closeButton}
              onPress={closeMenu}
              accessible={true}
              accessibilityLabel="Close menu"
              accessibilityRole="button"
            >
              <X size={24} color={colors.text} strokeWidth={2.5} />
            </TouchableOpacity>
            <View style={styles.menuContent}>
              {renderMenuItem(
                <Settings size={20} color={colors.text} strokeWidth={2.5} />, 'Settings', handleSettingsPress
              )}
            </View>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  menuContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 300,
    height: '100%',
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 2,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 16,
    zIndex: 1,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContent: {
    marginTop: 100,
    paddingHorizontal: 16,
  },
  menuItem: {
    borderBottomWidth: 1,
    paddingVertical: 16,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemIcon: {
    width: 40,
    alignItems: 'center',
    marginRight: 16,
  },
  menuItemText: {
    fontWeight: '500',
    flex: 1,
  },
}); 