import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppScreen } from '@/components/music/app-screen';
import { PlaylistItem } from '@/components/music/playlist-item';
import { playlistGroups } from '@/constants/mock-data';

export default function PlaylistScreen() {
  const router = useRouter();

  return (
    <AppScreen noPadding>
      <View style={styles.headerWrap}>
        <Text style={styles.brand}>Music On</Text>
        <View style={styles.subHeader}>
          <Text style={styles.subTitle}>TJ곡들임</Text>
          <Text style={styles.addText}>+ 추가</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.listContent}>
        {playlistGroups.map((group) => (
          <PlaylistItem
            key={group.id}
            title={group.title}
            songCount={group.songCount}
            active={group.isFavorite}
            onPress={() => router.push(`/details/${group.id}` as any)}
          />
        ))}
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  headerWrap: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 6,
  },
  brand: {
    color: '#111111',
    fontSize: 34,
    fontWeight: '900',
    marginBottom: 12,
  },
  subHeader: {
    minHeight: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#D9D9D9',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 2,
  },
  subTitle: {
    color: '#111111',
    fontSize: 16,
    fontWeight: '700',
  },
  addText: {
    color: '#111111',
    fontSize: 15,
    fontWeight: '700',
  },
  listContent: {
    paddingBottom: 30,
  },
});
