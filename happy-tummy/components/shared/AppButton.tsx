import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Colors, FontFamily, Shadow, Radius } from '@/constants/theme';

type Variant = 'red' | 'yellow' | 'white' | 'ghost';

interface AppButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  style?: ViewStyle;
}

export function AppButton({
  label,
  onPress,
  variant = 'red',
  style,
}: AppButtonProps) {

  const bgColor = {
    red:    Colors.red,
    yellow: Colors.yellow,
    white:  Colors.white,
    ghost:  'transparent',
  }[variant];

  const textColor = {
    red:    Colors.white,
    yellow: Colors.gray900,
    white:  Colors.gray900,
    ghost:  Colors.white,
  }[variant];

  const borderColor = variant === 'ghost'
    ? 'rgba(255,255,255,0.45)'
    : Colors.outline;

  const shadow = variant === 'ghost' ? {} : Shadow.md;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[
        styles.btn,
        { backgroundColor: bgColor, borderColor },
        shadow,
        style,
      ]}
    >
      <Text style={[styles.label, { color: textColor }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: '100%',
    paddingVertical: 15,
    borderRadius: Radius.pill,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: FontFamily.bodyBold,
    fontSize: 16,
  },
});