import type { PropsWithChildren } from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';

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
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  noPadding: {
    paddingHorizontal: 0,
  },
});
