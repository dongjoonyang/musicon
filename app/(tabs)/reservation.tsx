import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppScreen } from '@/components/music/app-screen';
import { LabeledInput } from '@/components/music/labeled-input';
import { PinkButton } from '@/components/music/pink-button';
import { reservationSongs } from '@/constants/mock-data';

export default function ReservationScreen() {
  const [artist, setArtist] = useState('');
  const [title, setTitle] = useState('');

  return (
    <AppScreen>
      <View style={styles.titleRow}>
        <Text style={styles.title}>선곡 예약리스트</Text>
        <Text style={styles.addText}>추가</Text>
      </View>

      <View style={styles.headerRow}>
        <Text style={styles.headerLabel}>제목</Text>
        <Text style={styles.headerLabel}>아티스트명</Text>
      </View>

      {reservationSongs.map((song) => (
        <View key={song.id} style={styles.songRow}>
          <Text style={styles.songText}>{song.title}</Text>
          <Text style={styles.songText}>{song.artist}</Text>
        </View>
      ))}

      <View style={styles.actionRow}>
        <Pressable style={styles.ghostButton}>
          <Text style={styles.ghostButtonText}>수정</Text>
        </Pressable>
        <Pressable style={styles.ghostButton}>
          <Text style={styles.ghostButtonText}>삭제</Text>
        </Pressable>
      </View>

      <Text style={styles.formLabel}>추가 누를경우</Text>

      <View style={styles.formCard}>
        <LabeledInput label="아티스트" value={artist} onChangeText={setArtist} placeholder="입력하세요" />
        <LabeledInput label="제목" value={title} onChangeText={setTitle} placeholder="입력하세요" />

        <View style={styles.saveWrap}>
          <PinkButton label="저장" />
        </View>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  titleRow: {
    marginTop: 8,
    marginBottom: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: '#111111',
    fontSize: 42,
    fontWeight: '900',
  },
  addText: {
    color: '#111111',
    fontSize: 24,
    fontWeight: '700',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  headerLabel: {
    color: '#111111',
    fontSize: 20,
    fontWeight: '700',
    width: '48%',
  },
  songRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  songText: {
    width: '48%',
    color: '#111111',
    fontSize: 22,
    fontWeight: '700',
  },
  actionRow: {
    marginTop: 4,
    flexDirection: 'row',
    alignSelf: 'flex-end',
    gap: 8,
    marginBottom: 18,
  },
  ghostButton: {
    minWidth: 64,
    minHeight: 42,
    borderRadius: 10,
    backgroundColor: '#E1E1E1',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  ghostButtonText: {
    color: '#111111',
    fontWeight: '700',
    fontSize: 16,
  },
  formLabel: {
    color: '#111111',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 10,
  },
  formCard: {
    flex: 1,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: '#E7E7E7',
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 24,
  },
  saveWrap: {
    marginTop: 'auto',
    alignSelf: 'flex-end',
  },
});
