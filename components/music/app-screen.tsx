import type { PropsWithChildren } from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';

import { MusicTheme } from '@/constants/music-theme';

type AppScreenProps = PropsWithChildren<{
  noPadding?: boolean;
}>;

export function AppScreen({ children, noPadding = false }: AppScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.container, noPadding && styles.noPadding]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: MusicTheme.colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: MusicTheme.colors.background,
    paddingHorizontal: MusicTheme.spacing.lg,
    paddingTop: MusicTheme.spacing.sm,
  },
  noPadding: {
    paddingHorizontal: 0,
  },
});
