import { useEffect, useMemo, useState } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { MusicTheme } from '@/constants/music-theme';
import { AppScreen } from '@/components/music/app-screen';
import { SearchInput } from '@/components/music/search-input';
import { useMusic } from '@/contexts/music-context';
import { searchTjSongs } from '@/services/tj-api';
import type { TjSong } from '@/types/music';

function SongResultRow({
  song,
  onAddToPlaylist,
  onOpenYoutube,
}: {
  song: TjSong;
  onAddToPlaylist: (song: TjSong) => void;
  onOpenYoutube: (song: TjSong) => void;
}) {
  return (
    <View style={styles.songRow}>
      <View style={styles.songLeft}>
        <View style={styles.tjBadge}>
          <Text style={styles.tjBadgeText}>{song.tjNumber}</Text>
        </View>
      </View>
      <View style={styles.songTextWrap}>
        <Text style={styles.songTitle} numberOfLines={1}>{song.title}</Text>
        <Text style={styles.songArtist} numberOfLines={1}>{song.artist}</Text>
      </View>
      <View style={styles.rowActions}>
        <Pressable
          onPress={() => onOpenYoutube(song)}
          style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.65 }]}
        >
          <MaterialCommunityIcons name="youtube" size={20} color="#FF0000" />
        </Pressable>
        <Pressable
          onPress={() => onAddToPlaylist(song)}
          style={({ pressed }) => [styles.addBtn, pressed && { opacity: 0.75 }]}
        >
          <MaterialCommunityIcons name="plus" size={16} color={MusicTheme.colors.primary} />
          <Text style={styles.addBtnText}>추가</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function SearchScreen() {
  const { playlists, addSongToPlaylist } = useMusic();

  const [query, setQuery] = useState('');
  const [selectedPlaylistId, setSelectedPlaylistId] = useState(playlists[0]?.id ?? '');
  const [results, setResults] = useState<TjSong[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const playlistOptions = useMemo(
    () => playlists.map((playlist) => ({ id: playlist.id, name: playlist.name })),
    [playlists],
  );

  useEffect(() => {
    if (!playlistOptions.length) {
      setSelectedPlaylistId('');
      return;
    }
    if (!playlistOptions.some((p) => p.id === selectedPlaylistId)) {
      setSelectedPlaylistId(playlistOptions[0].id);
    }
  }, [playlistOptions, selectedPlaylistId]);

  const addSong = (song: TjSong) => {
    addSongToPlaylist(song, selectedPlaylistId || playlists[0]?.id);
    Alert.alert('추가 완료', `${song.title} (TJ ${song.tjNumber})`);
  };

  const openYoutube = async (song: TjSong) => {
    if (!song.youtubeUrl) {
      Alert.alert('유튜브 링크 없음', '해당 곡의 유튜브 링크가 없습니다.');
      return;
    }
    const supported = await Linking.canOpenURL(song.youtubeUrl);
    if (!supported) {
      Alert.alert('링크 오류', '유튜브 링크를 열 수 없습니다.');
      return;
    }
    Linking.openURL(song.youtubeUrl);
  };

  const searchSongs = async () => {
    const normalized = query.trim();
    if (!normalized) {
      setResults([]);
      setMessage('TJ 번호, 가수, 곡명을 입력해주세요.');
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      const songs = await searchTjSongs(normalized);
      setResults(songs);
      if (!songs.length) setMessage('검색 결과가 없습니다.');
    } catch {
      setMessage('곡 검색 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppScreen>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerWrap}>
          <Text style={styles.title}>TJ 곡검색</Text>
          <Text style={styles.subtitle}>TJ 번호, 가수, 곡명으로 검색하세요</Text>
        </View>

        {/* 통합 검색 바 */}
        <SearchInput
          value={query}
          onChangeText={setQuery}
          onSearch={searchSongs}
          loading={loading}
        />

        {/* 플레이리스트 선택 */}
        {playlistOptions.length > 0 ? (
          <View style={styles.sectionWrap}>
            <Text style={styles.sectionTitle}>추가할 플레이리스트</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.playlistRow}
            >
              {playlistOptions.map((playlist) => {
                const active = selectedPlaylistId === playlist.id;
                return (
                  <Pressable
                    key={playlist.id}
                    onPress={() => setSelectedPlaylistId(playlist.id)}
                    style={[styles.playlistChip, active && styles.playlistChipActive]}
                  >
                    <Text
                      style={[styles.playlistChipText, active && styles.playlistChipTextActive]}
                      numberOfLines={1}
                    >
                      {playlist.name}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        ) : null}

        {/* 검색 결과 */}
        <View style={styles.sectionWrap}>
          <Text style={styles.sectionTitle}>
            검색 결과{results.length > 0 ? ` (${results.length})` : ''}
          </Text>

          {results.map((song) => (
            <SongResultRow
              key={song.id}
              song={song}
              onAddToPlaylist={addSong}
              onOpenYoutube={openYoutube}
            />
          ))}

          {!results.length && !loading ? (
            <View style={styles.emptyCard}>
              <MaterialCommunityIcons
                name={message ? 'music-off' : 'magnify'}
                size={32}
                color={MusicTheme.colors.border}
              />
              <Text style={styles.emptyText}>{message || '검색 결과가 여기에 표시됩니다.'}</Text>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 32,
    gap: MusicTheme.spacing.md,
  },
  headerWrap: {
    paddingTop: MusicTheme.spacing.md,
    gap: 4,
  },
  title: {
    color: MusicTheme.colors.text,
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  subtitle: {
    color: MusicTheme.colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  sectionWrap: {
    gap: MusicTheme.spacing.sm,
  },
  sectionTitle: {
    color: MusicTheme.colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  playlistRow: {
    gap: MusicTheme.spacing.sm,
    paddingVertical: 2,
  },
  playlistChip: {
    borderRadius: MusicTheme.radius.sm,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderWidth: 1.5,
    borderColor: MusicTheme.colors.border,
    backgroundColor: MusicTheme.colors.surface,
  },
  playlistChipActive: {
    borderColor: MusicTheme.colors.primary,
    backgroundColor: MusicTheme.colors.primaryLight,
  },
  playlistChipText: {
    color: MusicTheme.colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    maxWidth: 120,
  },
  playlistChipTextActive: {
    color: MusicTheme.colors.primary,
    fontWeight: '700',
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
  songLeft: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tjBadge: {
    minWidth: 44,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: MusicTheme.radius.sm,
    backgroundColor: MusicTheme.colors.primaryLight,
    alignItems: 'center',
  },
  tjBadgeText: {
    color: MusicTheme.colors.primary,
    fontSize: 12,
    fontWeight: '800',
  },
  songTextWrap: {
    flex: 1,
    gap: 3,
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
  rowActions: {
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
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    height: 36,
    paddingHorizontal: 12,
    borderRadius: MusicTheme.radius.sm,
    backgroundColor: MusicTheme.colors.primaryLight,
  },
  addBtnText: {
    color: MusicTheme.colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  emptyCard: {
    paddingVertical: 36,
    borderRadius: MusicTheme.radius.lg,
    backgroundColor: MusicTheme.colors.surface,
    alignItems: 'center',
    gap: 10,
    ...MusicTheme.shadow.card,
  },
  emptyText: {
    color: MusicTheme.colors.textMuted,
    fontSize: 14,
    fontWeight: '500',
  },
});
