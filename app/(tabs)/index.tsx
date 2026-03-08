import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { MusicTheme } from '@/constants/music-theme';
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
        <Text style={styles.subTitle}>TJ 플레이리스트</Text>
        <View style={styles.subHeader}>
          <Pressable
            onPress={() => setShowCreate((prev) => !prev)}
            style={({ pressed }) => [styles.addButton, pressed && styles.addButtonPressed]}
          >
            <Text style={styles.addText}>+ 플레이리스트 추가</Text>
          </Pressable>
        </View>

        {showCreate ? (
          <View style={styles.createCard}>
            <TextInput
              value={newName}
              onChangeText={setNewName}
              placeholder="플레이리스트 이름"
              placeholderTextColor={MusicTheme.colors.textMuted}
              style={styles.createInput}
            />
            <View style={styles.createRow}>
              <Pressable onPress={() => setShowCreate(false)} style={styles.cancelBtn}>
                <Text style={styles.cancelText}>취소</Text>
              </Pressable>
              <PinkButton label="생성" onPress={submitCreate} />
            </View>
          </View>
        ) : null}
      </View>

      <ScrollView
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
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
    paddingHorizontal: MusicTheme.spacing.lg,
    paddingTop: MusicTheme.spacing.md,
    paddingBottom: MusicTheme.spacing.sm,
    gap: 6,
  },
  brand: {
    color: MusicTheme.colors.text,
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subTitle: {
    color: MusicTheme.colors.textSecondary,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  subHeader: {
    marginBottom: MusicTheme.spacing.sm,
  },
  addButton: {
    alignSelf: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: MusicTheme.radius.md,
    backgroundColor: MusicTheme.colors.primaryLight,
    borderWidth: 1,
    borderColor: MusicTheme.colors.border,
  },
  addButtonPressed: {
    opacity: 0.9,
  },
  addText: {
    color: MusicTheme.colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  createCard: {
    marginHorizontal: MusicTheme.spacing.lg,
    marginBottom: MusicTheme.spacing.md,
    padding: MusicTheme.spacing.md,
    borderRadius: MusicTheme.radius.lg,
    backgroundColor: MusicTheme.colors.surface,
    gap: 12,
    ...MusicTheme.shadow.card,
  },
  createRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  createInput: {
    minHeight: 44,
    borderWidth: 1.5,
    borderColor: MusicTheme.colors.border,
    borderRadius: MusicTheme.radius.md,
    paddingHorizontal: 14,
    color: MusicTheme.colors.text,
    fontSize: 15,
    backgroundColor: MusicTheme.colors.surface,
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  cancelText: {
    color: MusicTheme.colors.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    paddingTop: 4,
    paddingBottom: 32,
    paddingHorizontal: 0,
  },
});
