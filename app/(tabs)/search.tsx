import { useEffect, useMemo, useState } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

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
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>TJ 곡검색</Text>

        <SearchInput value={query} onChangeText={setQuery} />
        <View style={styles.searchActionWrap}>
          <PinkButton
            label={loading ? '검색중...' : '곡검색'}
            icon={<MaterialCommunityIcons name="magnify" size={16} color="#FFFFFF" />}
            onPress={searchSongs}
          />
        </View>

        <Text style={styles.sectionTitle}>추가할 플레이리스트 선택</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.playlistRow}>
          {playlistOptions.map((playlist) => {
            const active = selectedPlaylistId === playlist.id;
            return (
              <Pressable
                key={playlist.id}
                onPress={() => setSelectedPlaylistId(playlist.id)}
                style={[styles.playlistChip, active && styles.playlistChipActive]}>
                <Text style={[styles.playlistChipText, active && styles.playlistChipTextActive]}>{playlist.name}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <Text style={styles.sectionTitle}>검색 결과</Text>
        {results.map((song) => (
          <SongResultRow key={song.id} song={song} onAddToPlaylist={addSong} onOpenYoutube={openYoutube} />
        ))}

        {!results.length && !loading ? <Text style={styles.emptyText}>{message || '검색 결과가 여기에 표시됩니다.'}</Text> : null}
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 22,
    gap: 10,
  },
  title: {
    marginTop: 8,
    marginBottom: 8,
    color: '#111111',
    fontSize: 30,
    fontWeight: '900',
    textAlign: 'center',
  },
  searchActionWrap: {
    alignSelf: 'flex-end',
  },
  sectionTitle: {
    color: '#111111',
    fontSize: 16,
    fontWeight: '800',
  },
  playlistRow: {
    gap: 8,
    paddingVertical: 4,
    paddingRight: 12,
  },
  playlistChip: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: '#CFCFCF',
    backgroundColor: '#FFFFFF',
  },
  playlistChipActive: {
    borderColor: '#FF00FF',
    backgroundColor: '#FFF2FF',
  },
  playlistChipText: {
    color: '#444444',
    fontSize: 13,
    fontWeight: '700',
  },
  playlistChipTextActive: {
    color: '#C900C9',
  },
  songRow: {
    borderWidth: 1,
    borderColor: '#ECECEC',
    borderRadius: 12,
    padding: 10,
    backgroundColor: '#FFFFFF',
    gap: 8,
  },
  songTextWrap: {
    gap: 2,
  },
  songTitle: {
    color: '#111111',
    fontSize: 16,
    fontWeight: '800',
  },
  songArtist: {
    color: '#333333',
    fontSize: 14,
  },
  songNo: {
    color: '#666666',
    fontSize: 12,
    fontWeight: '700',
  },
  rowActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  ghostButton: {
    minWidth: 58,
    minHeight: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D2D2D2',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    backgroundColor: '#FFFFFF',
  },
  ghostButtonText: {
    color: '#222222',
    fontSize: 13,
    fontWeight: '700',
  },
  emptyText: {
    marginTop: 6,
    color: '#666666',
    fontSize: 14,
  },
});
