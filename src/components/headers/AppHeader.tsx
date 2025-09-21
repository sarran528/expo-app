import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Animated } from 'react-native';
import { AppIcon, AppIcons } from '@/components/AppIcon';
import { useTheme } from '@/contexts/ThemeContext';
import { useRouter } from 'expo-router';
import { TTSService } from '@/services/TTSService';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AppHeaderProps {
  title: string;
  showMenu?: boolean;
  compact?: boolean;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ title, showMenu = true, compact = false }) => {
  const { colors, fontSize, textSize } = useTheme();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const slideAnim = React.useRef(new Animated.Value(-300)).current;
  const [voiceFeedbackEnabled, setVoiceFeedbackEnabled] = useState(true);

  // Load voice settings
  React.useEffect(() => {
    const loadVoiceSettings = async () => {
      try {
        const voiceEnabled = await AsyncStorage.getItem('voiceEnabled');
        setVoiceFeedbackEnabled(voiceEnabled === 'true' || voiceEnabled === null); // Default to true
      } catch (error) {
        console.error('Error loading voice settings:', error);
      }
    };
    loadVoiceSettings();
  }, []);

  const speakWithCurrentSettings = async (text: string) => {
    if (voiceFeedbackEnabled) {
      try {
        const speechRate = await AsyncStorage.getItem('speechRate');
        const speechPitch = await AsyncStorage.getItem('speechPitch');
        
        TTSService.setSpeechRate(speechRate ? Number(speechRate) : 0.75);
        TTSService.setSpeechPitch(speechPitch ? Number(speechPitch) : 1.0);
        TTSService.speak(text);
      } catch (error) {
        console.error('Error with TTS:', error);
      }
    }
  };

  const handleMenuPress = () => {
    speakWithCurrentSettings('Opening menu');
    setIsMenuOpen(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeMenu = () => {
    speakWithCurrentSettings('Closing menu');
    Animated.timing(slideAnim, {
      toValue: -300,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setIsMenuOpen(false);
    });
  };

  const handleSettingsPress = () => {
    speakWithCurrentSettings('Opening settings');
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
        <Text style={[styles.menuItemText, { color: colors.text, fontSize: fontSize.medium[textSize] }]}>
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <>
      <View style={[
        styles.header,
        compact ? { paddingTop: 8, paddingBottom: 8, paddingHorizontal: 12 } : {},
        { backgroundColor: colors.surface, borderBottomColor: colors.border }
      ]}>
        <View style={styles.headerContent}>
          <Text
            style={[
              styles.title,
              compact
                ? { fontSize: fontSize.large[textSize], marginTop: 0 }
                : { fontSize: fontSize.large[textSize] },
              { color: colors.text }
            ]}
            accessibilityRole="header"
            accessibilityLabel={`${title} screen`}
          >
            {title}
          </Text>
          {showMenu && (
            <View style={styles.headerActions}>
              <TouchableOpacity
                onPress={() => {
                  speakWithCurrentSettings('Opening settings');
                  router.push('/settings');
                }}
                style={[styles.headerButton, { backgroundColor: colors.background }]}
                accessible={true}
                accessibilityLabel="Open settings"
                accessibilityRole="button"
              >
                <AppIcon icon={AppIcons.Settings} color={colors.text} strokeWidth={2.5} />
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
              onPress={() => {
                speakWithCurrentSettings('Closing menu');
                closeMenu();
              }}
              accessible={true}
              accessibilityLabel="Close menu"
              accessibilityRole="button"
            >
              <AppIcon icon={AppIcons.X} color={colors.text} strokeWidth={2.5} />
            </TouchableOpacity>
            <View style={styles.menuContent}>
              {renderMenuItem(
                <AppIcon icon={AppIcons.Settings} color={colors.text} strokeWidth={2.5} />, 'Settings', handleSettingsPress
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
    paddingTop:21,
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
    marginTop:14,
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
    marginTop: 13,  
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