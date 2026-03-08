import { StyleSheet, Text, View } from 'react-native';

import { MusicTheme } from '@/constants/music-theme';

type SongItemProps = {
  title: string;
  artist?: string;
  trailing?: string;
  highlight?: boolean;
};

export function SongItem({ title, artist, trailing, highlight = false }: SongItemProps) {
  return (
    <View style={styles.row}>
      <View style={styles.textWrap}>
        <Text style={[styles.title, highlight && styles.highlightTitle]} numberOfLines={1}>
          {title}
        </Text>
        {artist ? <Text style={styles.artist} numberOfLines={1}>{artist}</Text> : null}
      </View>
      {trailing ? <Text style={styles.trailing}>{trailing}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: MusicTheme.spacing.sm,
    paddingHorizontal: MusicTheme.spacing.md,
    borderRadius: MusicTheme.radius.sm,
    backgroundColor: MusicTheme.colors.surface,
  },
  textWrap: {
    flex: 1,
    justifyContent: 'center',
    gap: 2,
  },
  title: {
    color: MusicTheme.colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  highlightTitle: {
    color: MusicTheme.colors.primary,
  },
  artist: {
    color: MusicTheme.colors.textSecondary,
    fontSize: 13,
  },
  trailing: {
    color: MusicTheme.colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
});
