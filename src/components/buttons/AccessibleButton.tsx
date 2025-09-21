import React, { useEffect, useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { TTSService } from '@/services/TTSService';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AccessibleButtonProps {
  title?: string;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  accessibilityLabel: string;
  accessibilityHint?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export function AccessibleButton({
  title,
  onPress,
  style,
  textStyle,
  accessibilityLabel,
  accessibilityHint,
  disabled = false,
  icon,
  children,
}: AccessibleButtonProps) {
  const { colors, fontSize } = useTheme();
  const [voiceSettings, setVoiceSettings] = useState({
    voiceEnabled: false,
    speechRate: 0.5,
    speechPitch: 1.0
  });

  useEffect(() => {
    loadVoiceSettings();
  }, []);

  const loadVoiceSettings = async () => {
    try {
      const voiceEnabled = await AsyncStorage.getItem('voiceEnabled');
      const speechRate = await AsyncStorage.getItem('speechRate');
      const speechPitch = await AsyncStorage.getItem('speechPitch');
      
      setVoiceSettings({
        voiceEnabled: voiceEnabled === 'true',
        speechRate: speechRate ? parseFloat(speechRate) : 0.5,
        speechPitch: speechPitch ? parseFloat(speechPitch) : 1.0
      });
    } catch (error) {
      console.log('Error loading voice settings:', error);
    }
  };

  const speakWithCurrentSettings = (text: string) => {
    if (voiceSettings.voiceEnabled) {
      TTSService.speak(text, {
        rate: voiceSettings.speechRate,
        pitch: voiceSettings.speechPitch
      });
    }
  };

  const handlePress = () => {
    if (!disabled) {
      speakWithCurrentSettings(title || accessibilityLabel);
      onPress();
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[
        styles.button,
        { backgroundColor: colors.primary, opacity: disabled ? 0.6 : 1 },
        style,
      ]}
      disabled={disabled}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled }}
    >
      {children || (
        <>
          {icon}
          {title && (
            <Text
              style={[
                styles.buttonText,
                { color: colors.onPrimary, fontSize: fontSize.medium },
                textStyle,
              ]}
              accessible={false}
            >
              {title}
            </Text>
          )}
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    minWidth: 48,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  buttonText: {
    fontWeight: '600',
    textAlign: 'center',
  },
});