import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, StyleSheet } from 'react-native';
import { OCRScanner } from '@/components/documents/OCRScanner';
import { useTheme } from '@/contexts/ThemeContext';
import { AccessibleButton } from '@/components/buttons/AccessibleButton';
import { useOCRScanner } from './_layout';
import { useFocusEffect } from 'expo-router';
import { TTSService } from '@/services/TTSService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CameraTabScreen() {
  const [visible, setVisible] = useState(false); // Default to placeholder, not scanner
  const { colors, fontSize } = useTheme();
  const { setCameraActive } = useOCRScanner();
  const [voiceFeedbackEnabled, setVoiceFeedbackEnabled] = useState(true);

  // Load voice settings
  useEffect(() => {
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

  const openScanner = () => {
    speakWithCurrentSettings('Opening OCR scanner');
    setVisible(true);
    setCameraActive(true);
  };
  const closeScanner = () => {
    speakWithCurrentSettings('Closing OCR scanner');
    setVisible(false);
    setCameraActive(false);
  };

  // Ensure useFocusEffect for cameraActive only depends on setCameraActive (not theme/colors).
  useFocusEffect(
    React.useCallback(() => {
      // On focus: do nothing
      return () => {
        setCameraActive(false);
        setVisible(false); // Reset scanner visibility when leaving tab
      };
    }, [setCameraActive])
  );

    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header removed, now handled globally */}
      {visible ? (
        <OCRScanner
          visible={visible}
          onClose={closeScanner}
          onTextExtracted={() => setVisible(false)} // Close scanner after scan
        />
      ) : (
        <View style={styles.placeholderContainer}>
          <Text style={[styles.placeholderText, { color: colors.text, fontSize: fontSize.large[1] }]}>OCR Scanner Closed</Text>
          <Text style={[styles.placeholderSubtext, { color: colors.textSecondary, fontSize: fontSize.medium[1] }]}>Tap below to start scanning again.</Text>
          <AccessibleButton
            title="Open OCR Scanner"
            onPress={openScanner}
            style={[styles.openButton, { backgroundColor: colors.primary }] as any}
            textStyle={{ color: colors.onPrimary, fontSize: fontSize.large[1] }}
            accessibilityLabel="Open OCR scanner"
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  placeholderText: {
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  placeholderSubtext: {
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  openButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
});