import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { MusicTheme } from '@/constants/music-theme';

type PinkButtonProps = {
  label: string;
  onPress?: () => void;
  icon?: ReactNode;
};

export function PinkButton({ label, onPress, icon }: PinkButtonProps) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
      {icon ? <View style={styles.iconWrap}>{icon}</View> : null}
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48, // Increased height
    paddingHorizontal: 22, // Increased padding
    borderRadius: MusicTheme.radius.md,
    backgroundColor: MusicTheme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    ...MusicTheme.shadow.button,
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }], // Add a subtle scale effect on press
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color: MusicTheme.colors.white,
    fontWeight: '700',
    fontSize: 16, // Increased font size
  },
});
