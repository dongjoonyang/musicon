import { useEffect, useMemo, useState } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { AppScreen } from '@/components/music/app-screen';
import { PinkButton } from '@/components/music/pink-button';
import { SearchInput } from '@/components/music/search-input';
import { useMusic } from '@/contexts/music-context';
import { getSongByTjNumber, searchTjSongs } from '@/services/tj-api';
import type { TjSong } from '@/types/music';

function normalizeNo(value: string): string {
  return value.replace(/[^0-9]/g, '');
}

function SongResultRow({
  song,
  onReserve,
  onAddToPlaylist,
  onOpenYoutube,
}: {
  song: TjSong;
  onReserve: (song: TjSong) => void;
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
        <Pressable onPress={() => onReserve(song)} style={styles.ghostButton}>
          <Text style={styles.ghostButtonText}>예약</Text>
        </Pressable>
        <PinkButton label="플리추가" onPress={() => onAddToPlaylist(song)} />
      </View>
    </View>
  );
}

export default function SearchScreen() {
  const { playlists, reservationSongs, addSongToPlaylist, addSongToReservation } = useMusic();

  const [keyword, setKeyword] = useState('');
  const [tjNumber, setTjNumber] = useState('');
  const [selectedPlaylistId, setSelectedPlaylistId] = useState(playlists[0]?.id ?? '');
  const [results, setResults] = useState<TjSong[]>([]);
  const [singleSong, setSingleSong] = useState<TjSong | null>(null);
  const [loading, setLoading] = useState(false);
  const [numberLoading, setNumberLoading] = useState(false);
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

  const reserveSong = (song: TjSong) => {
    addSongToReservation(song);
    Alert.alert('예약리스트에 추가됨', `${song.title} (${song.tjNumber})`);
  };

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

  const searchByKeyword = async () => {
    const normalized = keyword.trim();
    if (!normalized) {
      setResults([]);
      setMessage('검색어를 입력해주세요.');
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

  const searchByNumber = async () => {
    const normalized = tjNumber.trim();
    if (!normalized) {
      setSingleSong(null);
      setMessage('TJ 번호를 입력해주세요.');
      return;
    }
    const normalizedDigits = normalizeNo(normalized);

    const localPool: TjSong[] = [
      ...results,
      ...reservationSongs,
      ...playlists.flatMap((playlist) => playlist.songs),
      ...(singleSong ? [singleSong] : []),
    ];
    const localMatch = localPool.find((song) => normalizeNo(song.tjNumber) === normalizedDigits);
    if (localMatch) {
      setSingleSong(localMatch);
      setMessage('');
      return;
    }

    setNumberLoading(true);
    setMessage('');

    try {
      let song = await getSongByTjNumber(normalized);

      if (!song && keyword.trim()) {
        const keywordSongs = await searchTjSongs(keyword.trim());
        song = keywordSongs.find((item) => normalizeNo(item.tjNumber) === normalizedDigits) ?? null;
      }

      setSingleSong(song);
      if (!song) {
        setMessage('해당 TJ 번호의 곡을 찾지 못했습니다. 먼저 곡검색 후 번호조회 해보세요.');
      }
    } catch {
      setMessage('TJ 번호 조회 중 오류가 발생했습니다.');
    } finally {
      setNumberLoading(false);
    }
  };

  return (
    <AppScreen>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>TJ 곡검색 / 번호조회</Text>

        <SearchInput value={keyword} onChangeText={setKeyword} buttonLabel="키워드" />
        <View style={styles.searchActionWrap}>
          <PinkButton
            label={loading ? '검색중...' : '곡검색'}
            icon={<MaterialCommunityIcons name="magnify" size={16} color="#FFFFFF" />}
            onPress={searchByKeyword}
          />
        </View>

        <View style={styles.numberBox}>
          <Text style={styles.sectionTitle}>TJ 번호로 조회</Text>
          <View style={styles.numberInputRow}>
            <TextInput
              value={tjNumber}
              onChangeText={setTjNumber}
              keyboardType="number-pad"
              placeholder="예: 98662"
              placeholderTextColor="#8A8A8A"
              style={styles.numberInput}
            />
            <PinkButton label={numberLoading ? '조회중...' : '조회'} onPress={searchByNumber} />
          </View>

          {singleSong ? (
            <SongResultRow song={singleSong} onReserve={reserveSong} onAddToPlaylist={addSong} onOpenYoutube={openYoutube} />
          ) : null}
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
          <SongResultRow key={song.id} song={song} onReserve={reserveSong} onAddToPlaylist={addSong} onOpenYoutube={openYoutube} />
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
  numberBox: {
    marginTop: 4,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#ECECEC',
    backgroundColor: '#FAFAFA',
    gap: 10,
  },
  sectionTitle: {
    color: '#111111',
    fontSize: 16,
    fontWeight: '800',
  },
  numberInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  numberInput: {
    flex: 1,
    minHeight: 42,
    borderWidth: 1,
    borderColor: '#DADADA',
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 15,
    color: '#111111',
    backgroundColor: '#FFFFFF',
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
