import { useEffect, useMemo, useState } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { MusicTheme } from '@/constants/music-theme';
import { AppScreen } from '@/components/music/app-screen';
import { PinkButton } from '@/components/music/pink-button';
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
      <View style={styles.songTextWrap}>
        <Text style={styles.songTitle} numberOfLines={1}>
          {song.title}
        </Text>
        <Text style={styles.songArtist} numberOfLines={1}>
          {song.artist}
        </Text>
        <Text style={styles.songNo}>TJ {song.tjNumber}</Text>
      </View>
      <View style={styles.rowActions}>
        <Pressable onPress={() => onOpenYoutube(song)} style={styles.ghostButton}>
          <Text style={styles.ghostButtonText}>유튜브</Text>
        </Pressable>
        <PinkButton label="플리추가" onPress={() => onAddToPlaylist(song)} />
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
    [playlists]
  );

  useEffect(() => {
    if (!playlistOptions.length) {
      setSelectedPlaylistId('');
      return;
    }

    if (!playlistOptions.some((playlist) => playlist.id === selectedPlaylistId)) {
      setSelectedPlaylistId(playlistOptions[0].id);
    }
  }, [playlistOptions, selectedPlaylistId]);

  const addSong = (song: TjSong) => {
    addSongToPlaylist(song, selectedPlaylistId || playlists[0]?.id);
    Alert.alert('플레이리스트에 추가됨', `${song.title} (${song.tjNumber})`);
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
      if (!songs.length) {
        setMessage('검색 결과가 없습니다.');
      }
    } catch {
      setMessage('곡검색 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppScreen>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>TJ 곡검색</Text>
        <Text style={styles.subtitle}>TJ 번호, 가수, 곡명으로 검색하세요</Text>

        <SearchInput value={query} onChangeText={setQuery} />
        <View style={styles.searchActionWrap}>
          <PinkButton
            label={loading ? '검색중...' : '곡검색'}
            icon={<MaterialCommunityIcons name="magnify" size={18} color="#FFFFFF" />}
            onPress={searchSongs}
          />
        </View>

        <Text style={styles.sectionTitle}>추가할 플레이리스트</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.playlistRow}>
          {playlistOptions.map((playlist) => {
            const active = selectedPlaylistId === playlist.id;
            return (
              <Pressable
                key={playlist.id}
                onPress={() => setSelectedPlaylistId(playlist.id)}
                style={[styles.playlistChip, active && styles.playlistChipActive]}
              >
                <Text style={[styles.playlistChipText, active && styles.playlistChipTextActive]} numberOfLines={1}>
                  {playlist.name}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <Text style={styles.sectionTitle}>검색 결과</Text>
        {results.map((song) => (
          <SongResultRow key={song.id} song={song} onAddToPlaylist={addSong} onOpenYoutube={openYoutube} />
        ))}

        {!results.length && !loading ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>{message || '검색 결과가 여기에 표시됩니다.'}</Text>
          </View>
        ) : null}
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 28,
    gap: 14,
  },
  title: {
    marginTop: 4,
    color: MusicTheme.colors.text,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  subtitle: {
    color: MusicTheme.colors.textMuted,
    fontSize: 14,
    marginBottom: 4,
  },
  searchActionWrap: {
    alignSelf: 'flex-end',
  },
  sectionTitle: {
    color: MusicTheme.colors.text,
    fontSize: 17,
    fontWeight: '700',
    marginTop: 4,
  },
  playlistRow: {
    gap: 10,
    paddingVertical: 6,
    paddingRight: 4,
  },
  playlistChip: {
    borderRadius: MusicTheme.radius.full,
    paddingHorizontal: 16,
    paddingVertical: 10,
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
    fontSize: 14,
    fontWeight: '700',
    maxWidth: 120,
  },
  playlistChipTextActive: {
    color: MusicTheme.colors.primary,
  },
  songRow: {
    borderRadius: MusicTheme.radius.lg,
    padding: MusicTheme.spacing.md,
    backgroundColor: MusicTheme.colors.surface,
    gap: 10,
    ...MusicTheme.shadow.card,
  },
  songTextWrap: {
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
  rowActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  ghostButton: {
    minWidth: 60,
    minHeight: 38,
    borderRadius: MusicTheme.radius.md,
    borderWidth: 1.5,
    borderColor: MusicTheme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    backgroundColor: MusicTheme.colors.surface,
  },
  ghostButtonText: {
    color: MusicTheme.colors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
  },
  emptyCard: {
    marginTop: 8,
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
