import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Animated, PanResponder, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppScreen } from '@/components/music/app-screen';
import { PinkButton } from '@/components/music/pink-button';
import { useMusic } from '@/contexts/music-context';
import type { TjSong } from '@/types/music';

const DRAG_ROW_STEP = 136;

type ReservationRowProps = {
  song: TjSong;
  index: number;
  totalCount: number;
  onDrop: (fromIndex: number, toIndex: number) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
  onAddToPlaylist: () => void;
};

function ReservationRow({
  song,
  index,
  totalCount,
  onDrop,
  onMoveUp,
  onMoveDown,
  onRemove,
  onAddToPlaylist,
}: ReservationRowProps) {
  const [dragging, setDragging] = useState(false);
  const translateY = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dy) > 3,
      onPanResponderGrant: () => {
        setDragging(true);
      },
      onPanResponderMove: Animated.event([null, { dy: translateY }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (_, gestureState) => {
        const moveSteps = Math.round(gestureState.dy / DRAG_ROW_STEP);
        const target = Math.max(0, Math.min(totalCount - 1, index + moveSteps));

        translateY.setValue(0);
        setDragging(false);
        onDrop(index, target);
      },
      onPanResponderTerminate: () => {
        translateY.setValue(0);
        setDragging(false);
      },
    })
  ).current;

  return (
    <Animated.View
      style={[
        styles.songRow,
        dragging && styles.draggingRow,
        dragging && {
          transform: [{ translateY }],
        },
      ]}>
      <View style={styles.songInfo}>
        <Text style={styles.orderText}>{index + 1}</Text>
        <View style={styles.textWrap}>
          <Text style={styles.songTitle}>{song.title}</Text>
          <Text style={styles.songArtist}>{song.artist}</Text>
          <Text style={styles.songNo}>TJ {song.tjNumber}</Text>
        </View>
        <View style={styles.dragHandle} {...panResponder.panHandlers}>
          <Text style={styles.dragHandleText}>드래그</Text>
          <Text style={styles.dragHandleIcon}>≡</Text>
        </View>
      </View>

      <View style={styles.rowActions}>
        <Pressable onPress={onMoveUp} disabled={index === 0} style={[styles.ghostButton, index === 0 && styles.disabledButton]}>
          <Text style={styles.ghostButtonText}>위로</Text>
        </Pressable>
        <Pressable
          onPress={onMoveDown}
          disabled={index === totalCount - 1}
          style={[styles.ghostButton, index === totalCount - 1 && styles.disabledButton]}>
          <Text style={styles.ghostButtonText}>아래로</Text>
        </Pressable>
        <Pressable onPress={onRemove} style={styles.ghostButton}>
          <Text style={styles.ghostButtonText}>삭제</Text>
        </Pressable>
        <PinkButton label="플리추가" onPress={onAddToPlaylist} />
      </View>
    </Animated.View>
  );
}

export default function ReservationScreen() {
  const { reservationSongs, playlists, removeSongFromReservation, clearReservations, addSongToPlaylist, moveReservationSong, reorderReservationSong } =
    useMusic();
  const [selectedPlaylistId, setSelectedPlaylistId] = useState(playlists[0]?.id ?? '');

  const selectedPlaylist = useMemo(
    () => playlists.find((playlist) => playlist.id === selectedPlaylistId) ?? playlists[0],
    [playlists, selectedPlaylistId]
  );

  useEffect(() => {
    if (!playlists.length) {
      setSelectedPlaylistId('');
      return;
    }

    if (!playlists.some((playlist) => playlist.id === selectedPlaylistId)) {
      setSelectedPlaylistId(playlists[0].id);
    }
  }, [playlists, selectedPlaylistId]);

  const saveAllToSelectedPlaylist = () => {
    const targetPlaylist = selectedPlaylist;
    if (!targetPlaylist) return;

    reservationSongs.forEach((song) => addSongToPlaylist(song, targetPlaylist.id));
    Alert.alert('저장 완료', `예약곡을 "${targetPlaylist.name}"에 추가했습니다.`);
  };

  return (
    <AppScreen>
      <View style={styles.titleRow}>
        <Text style={styles.title}>선곡 예약리스트</Text>
        <Text style={styles.count}>{reservationSongs.length}곡</Text>
      </View>

      <View style={styles.actionTopRow}>
        <PinkButton label="전체 플리에 저장" onPress={saveAllToSelectedPlaylist} />
        <Pressable onPress={clearReservations} style={styles.ghostButton}>
          <Text style={styles.ghostButtonText}>전체 삭제</Text>
        </Pressable>
      </View>

      <Text style={styles.sectionTitle}>저장 대상 플레이리스트</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.playlistRow}>
        {playlists.map((playlist) => {
          const active = selectedPlaylist?.id === playlist.id;
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

      <ScrollView contentContainerStyle={styles.listContent}>
        {reservationSongs.map((song, index) => (
          <ReservationRow
            key={`${song.id}-${index}`}
            song={song}
            index={index}
            totalCount={reservationSongs.length}
            onDrop={reorderReservationSong}
            onMoveUp={() => moveReservationSong(song.id, 'up')}
            onMoveDown={() => moveReservationSong(song.id, 'down')}
            onRemove={() => removeSongFromReservation(song.id)}
            onAddToPlaylist={() => addSongToPlaylist(song, selectedPlaylist?.id)}
          />
        ))}

        {!reservationSongs.length ? <Text style={styles.emptyText}>검색 탭에서 예약 버튼을 누르면 여기 쌓입니다.</Text> : null}
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  titleRow: {
    marginTop: 8,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: '#111111',
    fontSize: 34,
    fontWeight: '900',
  },
  count: {
    color: '#666666',
    fontSize: 15,
    fontWeight: '700',
  },
  actionTopRow: {
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    color: '#111111',
    fontSize: 15,
    fontWeight: '800',
  },
  playlistRow: {
    gap: 8,
    paddingTop: 6,
    paddingBottom: 10,
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
  listContent: {
    paddingBottom: 22,
    gap: 10,
  },
  songRow: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    backgroundColor: '#FFFFFF',
    padding: 10,
    gap: 8,
  },
  draggingRow: {
    zIndex: 20,
    shadowColor: '#000000',
    shadowOpacity: 0.16,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  songInfo: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  orderText: {
    minWidth: 22,
    color: '#FF00FF',
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
  },
  textWrap: {
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
  dragHandle: {
    minWidth: 58,
    minHeight: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DBDBDB',
    backgroundColor: '#FAFAFA',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  dragHandleText: {
    color: '#555555',
    fontSize: 10,
    fontWeight: '700',
  },
  dragHandleIcon: {
    color: '#222222',
    fontSize: 17,
    fontWeight: '900',
    marginTop: -2,
  },
  rowActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  ghostButton: {
    minHeight: 36,
    minWidth: 66,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D2D2D2',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  ghostButtonText: {
    color: '#111111',
    fontWeight: '700',
    fontSize: 13,
  },
  disabledButton: {
    opacity: 0.45,
  },
  emptyText: {
    marginTop: 10,
    color: '#666666',
    fontSize: 14,
  },
});
