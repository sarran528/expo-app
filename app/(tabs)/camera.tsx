import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, StyleSheet } from 'react-native';
import { OCRScanner } from '../../components/OCRScanner';
import { useTheme } from '@/hooks/useTheme';
import { AccessibleButton } from '../../components/AccessibleButton';
import { useOCRScanner } from './_layout';
import { useFocusEffect } from 'expo-router';

export default function CameraTabScreen() {
  const [visible, setVisible] = useState(false); // Default to placeholder, not scanner
  const { colors, fontSize } = useTheme();
  const { setCameraActive } = useOCRScanner();

  const openScanner = () => {
    setVisible(true);
    setCameraActive(true);
  };
  const closeScanner = () => {
    setVisible(false);
    setCameraActive(false);
  };

  // Ensure cameraActive is reset when leaving the tab or unmounting
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
          <Text style={[styles.placeholderText, { color: colors.text, fontSize: fontSize.large }]}>OCR Scanner Closed</Text>
          <Text style={[styles.placeholderSubtext, { color: colors.textSecondary, fontSize: fontSize.medium }]}>Tap below to start scanning again.</Text>
          <AccessibleButton
            title="Open OCR Scanner"
            onPress={openScanner}
            style={[styles.openButton, { backgroundColor: colors.primary }] as any}
            textStyle={{ color: colors.onPrimary, fontSize: fontSize.large }}
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