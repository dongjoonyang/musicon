import { useMemo } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

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
        <Text style={styles.groupName}>{group?.name ?? '노래 목록'}</Text>
        <Text style={styles.groupCount}>{songs.length}곡</Text>
      </View>

      <ScrollView contentContainerStyle={styles.listContent}>
        {songs.map((song) => (
          <View key={song.id} style={styles.songRow}>
            <View style={styles.songTextWrap}>
              <Text style={styles.songTitle}>{song.title}</Text>
              <Text style={styles.songArtist}>{song.artist}</Text>
              <Text style={styles.songNo}>TJ {song.tjNumber}</Text>
            </View>
            <View style={styles.actionWrap}>
              <Pressable onPress={() => openYoutube(song.youtubeUrl)} style={[styles.actionButton, styles.youtubeButton]}>
                <Text style={[styles.actionText, styles.youtubeText]}>유튜브 연결</Text>
              </Pressable>
              <Pressable onPress={() => removeSongFromPlaylist(groupId, song.id)} style={styles.actionButton}>
                <Text style={styles.actionText}>삭제</Text>
              </Pressable>
            </View>
          </View>
        ))}

        {!songs.length ? <Text style={styles.emptyText}>등록된 곡이 없습니다.</Text> : null}
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  title: {
    marginTop: 8,
    marginBottom: 20,
    color: '#111111',
    fontSize: 34,
    fontWeight: '900',
    textAlign: 'center',
  },
  groupHeader: {
    minHeight: 48,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  groupName: {
    color: '#111111',
    fontSize: 20,
    fontWeight: '700',
  },
  groupCount: {
    color: '#666666',
    fontSize: 14,
    fontWeight: '700',
  },
  listContent: {
    paddingBottom: 20,
    paddingTop: 12,
    gap: 10,
  },
  songRow: {
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 12,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  songTextWrap: {
    flex: 1,
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
  actionWrap: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 6,
  },
  actionButton: {
    minWidth: 58,
    minHeight: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D1D1D1',
    backgroundColor: '#FFFFFF',
  },
  actionText: {
    color: '#111111',
    fontSize: 13,
    fontWeight: '700',
  },
  youtubeButton: {
    borderColor: '#FF4FB8',
    minWidth: 90,
  },
  youtubeText: {
    color: '#FF1A9B',
  },
  emptyText: {
    marginTop: 16,
    color: '#666666',
    fontSize: 14,
  },
});
