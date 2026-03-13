import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

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
    if (!newName.trim()) return;
    createPlaylist(newName.trim());
    setNewName('');
    setShowCreate(false);
  };

  return (
    <AppScreen noPadding>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.brand}>Music On</Text>
            <Text style={styles.subtitle}>내 노래방 플레이리스트</Text>
          </View>
          <Pressable
            onPress={() => setShowCreate((prev) => !prev)}
            style={({ pressed }) => [styles.addButton, pressed && { opacity: 0.75 }]}
          >
            <MaterialCommunityIcons name="plus" size={20} color={MusicTheme.colors.primary} />
            <Text style={styles.addText}>추가</Text>
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
              autoFocus
              onSubmitEditing={submitCreate}
              returnKeyType="done"
            />
            <View style={styles.createRow}>
              <Pressable onPress={() => { setShowCreate(false); setNewName(''); }} style={styles.cancelBtn}>
                <Text style={styles.cancelText}>취소</Text>
              </Pressable>
              <PinkButton label="생성" onPress={submitCreate} />
            </View>
          </View>
        ) : null}
      </View>

      <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {playlists.length === 0 ? (
          <View style={styles.emptyWrap}>
            <MaterialCommunityIcons name="playlist-music-outline" size={48} color={MusicTheme.colors.border} />
            <Text style={styles.emptyTitle}>플레이리스트가 없습니다</Text>
            <Text style={styles.emptyDesc}>상단 추가 버튼으로 새 플레이리스트를 만들어보세요.</Text>
          </View>
        ) : (
          playlists.map((group, index) => (
            <PlaylistItem
              key={group.id}
              title={group.name}
              songCount={group.songs.length}
              active={index === 0}
              onPress={() => router.push(`/details/${group.id}` as any)}
            />
          ))
        )}
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: MusicTheme.spacing.lg,
    paddingTop: MusicTheme.spacing.lg,
    paddingBottom: MusicTheme.spacing.md,
    gap: MusicTheme.spacing.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  brand: {
    color: MusicTheme.colors.text,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    color: MusicTheme.colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
    marginTop: 3,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: MusicTheme.radius.md,
    backgroundColor: MusicTheme.colors.primaryLight,
  },
  addText: {
    color: MusicTheme.colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  createCard: {
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
    height: 48,
    borderWidth: 1.5,
    borderColor: MusicTheme.colors.border,
    borderRadius: MusicTheme.radius.md,
    paddingHorizontal: 14,
    color: MusicTheme.colors.text,
    fontSize: 15,
    backgroundColor: MusicTheme.colors.surfaceAlt,
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
  },
  emptyWrap: {
    marginTop: 60,
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: MusicTheme.spacing.xl,
  },
  emptyTitle: {
    color: MusicTheme.colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginTop: 8,
  },
  emptyDesc: {
    color: MusicTheme.colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
