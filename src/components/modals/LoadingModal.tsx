import React from 'react';
import { Modal, View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface LoadingModalProps {
  visible: boolean;
  text: string;
}

export function LoadingModal({ visible, text }: LoadingModalProps) {
  const { colors, fontSize } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      accessible={true}
      accessibilityViewIsModal={true}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.surface }]}>
          <ActivityIndicator 
            size="large" 
            color={colors.primary}
            accessible={true}
            accessibilityLabel="Loading"
          />
          <Text 
            style={[styles.text, { color: colors.text, fontSize: fontSize.medium }]}
            accessible={true}
            accessibilityLabel={text}
          >
            {text}
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  container: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  text: {
    marginTop: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});