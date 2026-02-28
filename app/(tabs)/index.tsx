import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { AppScreen } from '@/components/music/app-screen';
import { PlaylistItem } from '@/components/music/playlist-item';
import { PinkButton } from '@/components/music/pink-button';
import { useMusic } from '@/contexts/music-context';

export default function PlaylistScreen() {
  const router = useRouter();
  const { playlists, createPlaylist } = useMusic();

  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');

  const submitCreate = () => {
    createPlaylist(newName);
    setNewName('');
    setShowCreate(false);
  };

  return (
    <AppScreen noPadding>
      <View style={styles.headerWrap}>
        <Text style={styles.brand}>Music On</Text>
        <View style={styles.subHeader}>
          <Text style={styles.subTitle}>TJ 플레이리스트</Text>
          <Pressable onPress={() => setShowCreate((prev) => !prev)}>
            <Text style={styles.addText}>+ 추가</Text>
          </Pressable>
        </View>

        {showCreate ? (
          <View style={styles.createRow}>
            <TextInput
              value={newName}
              onChangeText={setNewName}
              placeholder="플레이리스트 이름"
              placeholderTextColor="#8A8A8A"
              style={styles.createInput}
            />
            <PinkButton label="생성" onPress={submitCreate} />
          </View>
        ) : null}
      </View>

      <ScrollView contentContainerStyle={styles.listContent}>
        {playlists.map((group, index) => (
          <PlaylistItem
            key={group.id}
            title={group.name}
            songCount={group.songs.length}
            active={index === 0}
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
    gap: 8,
  },
  brand: {
    color: '#111111',
    fontSize: 34,
    fontWeight: '900',
    marginBottom: 6,
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
  createRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  createInput: {
    flex: 1,
    minHeight: 40,
    borderWidth: 1,
    borderColor: '#DADADA',
    borderRadius: 10,
    paddingHorizontal: 12,
    color: '#111111',
    backgroundColor: '#FFFFFF',
  },
  listContent: {
    paddingBottom: 30,
  },
});
