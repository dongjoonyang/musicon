import { useMemo } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { MusicTheme } from '@/constants/music-theme';
import { AppScreen } from '@/components/music/app-screen';
import { useMusic } from '@/contexts/music-context';

export default function FavoriteDetailsScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const groupId = params.id ?? 'default-playlist';

  const { playlists, removeSongFromPlaylist } = useMusic();

  const group = useMemo(() => playlists.find((item) => item.id === groupId), [groupId, playlists]);
  const songs = group?.songs ?? [];

  const openYoutube = async (youtubeUrl?: string) => {
    if (!youtubeUrl) {
      Alert.alert('유튜브 링크 없음', '해당 곡의 유튜브 링크가 없습니다.');
      return;
    }

    try {
      const supported = await Linking.canOpenURL(youtubeUrl);
      if (!supported) {
        Alert.alert('링크 오류', '유튜브 링크를 열 수 없습니다.');
        return;
      }

      await Linking.openURL(youtubeUrl);
    } catch {
      Alert.alert('링크 오류', '유튜브 링크를 여는 중 문제가 발생했습니다.');
    }
  };

  return (
    <AppScreen>
      <Text style={styles.title}>플레이리스트 상세</Text>

      <View style={styles.groupHeader}>
        <Text style={styles.groupName} numberOfLines={1}>{group?.name ?? '노래 목록'}</Text>
        <Text style={styles.groupCount}>{songs.length}곡</Text>
      </View>

      <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {songs.map((song) => (
          <View key={song.id} style={styles.songRow}>
            <View style={styles.songTextWrap}>
              <Text style={styles.songTitle} numberOfLines={1}>{song.title}</Text>
              <Text style={styles.songArtist} numberOfLines={1}>{song.artist}</Text>
              <Text style={styles.songNo}>TJ {song.tjNumber}</Text>
            </View>
            <View style={styles.actionWrap}>
              <Pressable onPress={() => openYoutube(song.youtubeUrl)} style={[styles.actionButton, styles.youtubeButton]}>
                <Text style={[styles.actionText, styles.youtubeText]}>유튜브</Text>
              </Pressable>
              <Pressable onPress={() => removeSongFromPlaylist(groupId, song.id)} style={styles.actionButton}>
                <Text style={styles.actionText}>삭제</Text>
              </Pressable>
            </View>
          </View>
        ))}

        {!songs.length ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>등록된 곡이 없습니다.</Text>
          </View>
        ) : null}
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  title: {
    marginTop: 4,
    marginBottom: 16,
    color: MusicTheme.colors.text,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  groupHeader: {
    minHeight: 52,
    paddingVertical: 12,
    paddingHorizontal: 4,
    marginBottom: 8,
    borderRadius: MusicTheme.radius.md,
    backgroundColor: MusicTheme.colors.surface,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...MusicTheme.shadow.card,
  },
  groupName: {
    color: MusicTheme.colors.text,
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
  },
  groupCount: {
    color: MusicTheme.colors.textMuted,
    fontSize: 14,
    fontWeight: '700',
  },
  listContent: {
    paddingBottom: 24,
    paddingTop: 4,
    gap: 10,
  },
  songRow: {
    borderWidth: 1,
    borderColor: MusicTheme.colors.borderLight,
    borderRadius: MusicTheme.radius.lg,
    padding: MusicTheme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    backgroundColor: MusicTheme.colors.surface,
    ...MusicTheme.shadow.card,
  },
  songTextWrap: {
    flex: 1,
    gap: 2,
  },
  songTitle: {
    color: MusicTheme.colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  songArtist: {
    color: MusicTheme.colors.textSecondary,
    fontSize: 14,
  },
  songNo: {
    color: MusicTheme.colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  actionWrap: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 8,
  },
  actionButton: {
    minWidth: 56,
    minHeight: 36,
    borderRadius: MusicTheme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: MusicTheme.colors.border,
    backgroundColor: MusicTheme.colors.surface,
  },
  actionText: {
    color: MusicTheme.colors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
  },
  youtubeButton: {
    borderColor: MusicTheme.colors.primary,
    backgroundColor: MusicTheme.colors.primaryLight,
    minWidth: 72,
  },
  youtubeText: {
    color: MusicTheme.colors.primary,
  },
  emptyCard: {
    marginTop: 12,
    padding: MusicTheme.spacing.lg,
    borderRadius: MusicTheme.radius.lg,
    backgroundColor: MusicTheme.colors.surface,
    alignItems: 'center',
  },
  emptyText: {
    color: MusicTheme.colors.textMuted,
    fontSize: 14,
  },
});
