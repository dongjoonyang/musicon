import { useMemo, useState } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { AppScreen } from '@/components/music/app-screen';
import { PinkButton } from '@/components/music/pink-button';
import { SearchInput } from '@/components/music/search-input';
import { SongItem } from '@/components/music/song-item';
import { searchSongs } from '@/constants/mock-data';

export default function SearchScreen() {
  const [keyword, setKeyword] = useState('장기하');

  const filteredSongs = useMemo(() => {
    const normalized = keyword.trim();
    if (!normalized) return searchSongs;

    return searchSongs.filter(
      (song) => song.title.includes(normalized) || song.artist.includes(normalized)
    );
  }, [keyword]);

  return (
    <AppScreen>
      <Text style={styles.title}>검색 : TJ 곡들 중</Text>
      <SearchInput value={keyword} onChangeText={setKeyword} />

      <View style={styles.resultsWrap}>
        {filteredSongs.map((song) => (
          <SongItem key={song.id} title={song.title} artist={song.artist} />
        ))}
      </View>

      <View style={styles.favoriteActionWrap}>
        <MaterialCommunityIcons name="dots-horizontal-circle-outline" size={40} color="#C8C8C8" />
        <PinkButton
          label="즐겨찾기"
          icon={<MaterialCommunityIcons name="heart" size={16} color="#FFFFFF" />}
        />
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  title: {
    marginTop: 8,
    marginBottom: 22,
    color: '#111111',
    fontSize: 40,
    fontWeight: '900',
    textAlign: 'center',
  },
  resultsWrap: {
    marginTop: 18,
  },
  favoriteActionWrap: {
    marginTop: 16,
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
    gap: 8,
  },
});
