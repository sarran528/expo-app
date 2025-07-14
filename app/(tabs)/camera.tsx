import React, { useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet } from 'react-native';
import { OCRScanner } from '../../components/OCRScanner';
import { useTheme } from '@/hooks/useTheme';
import { AccessibleButton } from '../../components/AccessibleButton';
import { Header } from '@/components/Header';

export default function CameraTabScreen() {
  const [visible, setVisible] = useState(false); // Default to placeholder, not scanner
  const { colors, fontSize } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}> 
      {visible ? (
        <OCRScanner
          visible={visible}
          onClose={() => setVisible(false)}
          onTextExtracted={() => {}}
        />
      ) : (
        <>
          <Header title="Camera" />
          <View style={styles.placeholderContainer}>
            <Text style={[styles.placeholderText, { color: colors.text, fontSize: fontSize.large }]}>OCR Scanner Closed</Text>
            <Text style={[styles.placeholderSubtext, { color: colors.textSecondary, fontSize: fontSize.medium }]}>Tap below to start scanning again.</Text>
            <AccessibleButton
              title="Open OCR Scanner"
              onPress={() => setVisible(true)}
              style={[styles.openButton, { backgroundColor: colors.primary }] as any}
              textStyle={{ color: colors.onPrimary, fontSize: fontSize.large }}
              accessibilityLabel="Open OCR scanner"
            />
          </View>
        </>
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