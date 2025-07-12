import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

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

  return (
    <TouchableOpacity
      onPress={onPress}
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