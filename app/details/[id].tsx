import { useMemo } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppScreen } from '@/components/music/app-screen';
import { SongItem } from '@/components/music/song-item';
import { favoriteSongsByGroupId, playlistGroups } from '@/constants/mock-data';

export default function FavoriteDetailsScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const groupId = params.id ?? 'favorite';

  const songs = useMemo(() => favoriteSongsByGroupId[groupId] ?? [], [groupId]);
  const group = useMemo(() => playlistGroups.find((item) => item.id === groupId), [groupId]);

  return (
    <AppScreen>
      <Text style={styles.title}>즐겨찾는 노래</Text>

      <View style={styles.groupHeader}>
        <Text style={styles.groupName}>{group?.title ?? '노래 목록'}</Text>
        <View style={styles.checkbox} />
      </View>

      <ScrollView contentContainerStyle={styles.listContent}>
        {songs.map((song, index) => (
          <SongItem
            key={song.id}
            title={song.title}
            artist={song.artist}
            trailing={index === 0 ? song.memo : undefined}
            highlight={index === 0}
          />
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
    fontSize: 44,
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
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 1,
    borderColor: '#999999',
    backgroundColor: '#F4F4F4',
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyText: {
    marginTop: 16,
    color: '#666666',
    fontSize: 14,
  },
});
