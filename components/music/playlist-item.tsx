import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { MusicTheme } from '@/constants/music-theme';

type PlaylistItemProps = {
  title: string;
  songCount: number;
  active?: boolean;
  onPress?: () => void;
};

export function PlaylistItem({ title, songCount, active = false, onPress }: PlaylistItemProps) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <View style={[styles.iconWrap, active && styles.iconWrapActive]}>
        <MaterialCommunityIcons
          name="playlist-music"
          size={20}
          color={active ? MusicTheme.colors.primary : MusicTheme.colors.textSecondary}
        />
      </View>
      <View style={styles.leading}>
        <Text style={[styles.title, active && styles.activeTitle]} numberOfLines={1}>{title}</Text>
        <Text style={styles.count}>{songCount}곡</Text>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={20} color={MusicTheme.colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: MusicTheme.spacing.md,
    paddingVertical: MusicTheme.spacing.sm,
    marginHorizontal: MusicTheme.spacing.lg,
    marginBottom: MusicTheme.spacing.xs,
    borderRadius: MusicTheme.radius.lg,
    backgroundColor: MusicTheme.colors.surface,
    gap: 14,
    ...MusicTheme.shadow.card,
  },
  pressed: {
    opacity: 0.88,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: MusicTheme.radius.md,
    backgroundColor: MusicTheme.colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {
    backgroundColor: MusicTheme.colors.primaryLight,
  },
  leading: {
    flex: 1,
    gap: 3,
  },
  title: {
    color: MusicTheme.colors.text,
    fontWeight: '600',
    fontSize: 16,
  },
  activeTitle: {
    color: MusicTheme.colors.primary,
    fontWeight: '700',
  },
  count: {
    color: MusicTheme.colors.textMuted,
    fontSize: 13,
    fontWeight: '500',
  },
});
