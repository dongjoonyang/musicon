import { useMemo } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { MusicTheme } from '@/constants/music-theme';
import { AppScreen } from '@/components/music/app-screen';
import { useMusic } from '@/contexts/music-context';

export default function FavoriteDetailsScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const groupId = params.id ?? 'default-playlist';
  const router = useRouter();

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
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.65 }]}>
          <MaterialCommunityIcons name="chevron-left" size={24} color={MusicTheme.colors.text} />
        </Pressable>
        <View style={styles.headerText}>
          <Text style={styles.title} numberOfLines={1}>{group?.name ?? '플레이리스트'}</Text>
          <Text style={styles.subtitle}>{songs.length}곡</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {songs.map((song, index) => (
          <View key={song.id} style={styles.songRow}>
            <View style={styles.indexWrap}>
              <Text style={styles.indexText}>{index + 1}</Text>
            </View>
            <View style={styles.songTextWrap}>
              <Text style={styles.songTitle} numberOfLines={1}>{song.title}</Text>
              <Text style={styles.songArtist} numberOfLines={1}>{song.artist}</Text>
              <View style={styles.tjWrap}>
                <Text style={styles.songNo}>TJ {song.tjNumber}</Text>
              </View>
            </View>
            <View style={styles.actionWrap}>
              <Pressable
                onPress={() => openYoutube(song.youtubeUrl)}
                style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.65 }]}
              >
                <MaterialCommunityIcons name="youtube" size={18} color="#FF0000" />
              </Pressable>
              <Pressable
                onPress={() => removeSongFromPlaylist(groupId, song.id)}
                style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.65 }]}
              >
                <MaterialCommunityIcons name="trash-can-outline" size={17} color={MusicTheme.colors.textMuted} />
              </Pressable>
            </View>
          </View>
        ))}

        {!songs.length ? (
          <View style={styles.emptyCard}>
            <MaterialCommunityIcons name="music-off" size={40} color={MusicTheme.colors.border} />
            <Text style={styles.emptyTitle}>등록된 곡이 없습니다</Text>
            <Text style={styles.emptyDesc}>검색 탭에서 곡을 찾아 플레이리스트에 추가해보세요.</Text>
          </View>
        ) : null}
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: MusicTheme.spacing.sm,
    paddingBottom: MusicTheme.spacing.md,
    gap: 10,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: MusicTheme.radius.md,
    backgroundColor: MusicTheme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...MusicTheme.shadow.card,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  title: {
    color: MusicTheme.colors.text,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  subtitle: {
    color: MusicTheme.colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
  listContent: {
    paddingBottom: 32,
    gap: 8,
  },
  songRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: MusicTheme.radius.lg,
    padding: MusicTheme.spacing.md,
    backgroundColor: MusicTheme.colors.surface,
    gap: 12,
    ...MusicTheme.shadow.card,
  },
  indexWrap: {
    width: 28,
    alignItems: 'center',
  },
  indexText: {
    color: MusicTheme.colors.textMuted,
    fontSize: 14,
    fontWeight: '700',
  },
  songTextWrap: {
    flex: 1,
    gap: 2,
  },
  songTitle: {
    color: MusicTheme.colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  songArtist: {
    color: MusicTheme.colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
  tjWrap: {
    marginTop: 3,
  },
  songNo: {
    color: MusicTheme.colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  actionWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: MusicTheme.radius.sm,
    backgroundColor: MusicTheme.colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCard: {
    marginTop: 48,
    alignItems: 'center',
    gap: 10,
  },
  emptyTitle: {
    color: MusicTheme.colors.text,
    fontSize: 15,
    fontWeight: '700',
    marginTop: 4,
  },
  emptyDesc: {
    color: MusicTheme.colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
  },
});
