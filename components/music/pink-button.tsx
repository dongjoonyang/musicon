import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { MusicTheme } from '@/constants/music-theme';

type PinkButtonProps = {
  label: string;
  onPress?: () => void;
  icon?: ReactNode;
  variant?: 'primary' | 'outline' | 'ghost';
  fullWidth?: boolean;
};

export function PinkButton({ label, onPress, icon, variant = 'primary', fullWidth = false }: PinkButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        variant === 'outline' && styles.outline,
        variant === 'ghost' && styles.ghost,
        fullWidth && styles.fullWidth,
        pressed && styles.pressed,
      ]}
    >
      {icon ? <View style={styles.iconWrap}>{icon}</View> : null}
      <Text style={[
        styles.label,
        variant === 'outline' && styles.outlineLabel,
        variant === 'ghost' && styles.ghostLabel,
      ]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 46,
    paddingHorizontal: 20,
    borderRadius: MusicTheme.radius.md,
    backgroundColor: MusicTheme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
    ...MusicTheme.shadow.button,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: MusicTheme.colors.primary,
    shadowOpacity: 0,
    elevation: 0,
  },
  ghost: {
    backgroundColor: MusicTheme.colors.primaryLight,
    shadowOpacity: 0,
    elevation: 0,
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.985 }],
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color: MusicTheme.colors.white,
    fontWeight: '700',
    fontSize: 15,
  },
  outlineLabel: {
    color: MusicTheme.colors.primary,
  },
  ghostLabel: {
    color: MusicTheme.colors.primary,
  },
});
