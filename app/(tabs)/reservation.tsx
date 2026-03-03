import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { AppScreen } from '@/components/music/app-screen';
import { PinkButton } from '@/components/music/pink-button';
import { useMusic } from '@/contexts/music-context';
import type { ReservationRequest } from '@/types/music';

const SHEET_HEIGHT = 320;

type FormMode = 'create' | 'edit';

export default function ReservationScreen() {
  const { reservationRequests, addReservationRequest, updateReservationRequest, removeReservationRequest } = useMusic();

  const [isSheetVisible, setIsSheetVisible] = useState(false);
  const [mode, setMode] = useState<FormMode>('create');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [artist, setArtist] = useState('');
  const [title, setTitle] = useState('');

  const slideY = useRef(new Animated.Value(SHEET_HEIGHT)).current;

  const editingTarget = useMemo(
    () => reservationRequests.find((item) => item.id === editingId) ?? null,
    [editingId, reservationRequests]
  );

  useEffect(() => {
    if (isSheetVisible) {
      Animated.timing(slideY, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }).start();
      return;
    }

    slideY.setValue(SHEET_HEIGHT);
  }, [isSheetVisible, slideY]);

  const closeSheet = () => {
    Animated.timing(slideY, {
      toValue: SHEET_HEIGHT,
      duration: 180,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (!finished) return;
      setIsSheetVisible(false);
      setEditingId(null);
      setArtist('');
      setTitle('');
      setMode('create');
    });
  };

  const openCreateSheet = () => {
    setMode('create');
    setEditingId(null);
    setArtist('');
    setTitle('');
    setIsSheetVisible(true);
  };

  const openEditSheet = (request: ReservationRequest) => {
    setMode('edit');
    setEditingId(request.id);
    setArtist(request.artist);
    setTitle(request.title);
    setIsSheetVisible(true);
  };

  const submitForm = () => {
    const nextArtist = artist.trim();
    const nextTitle = title.trim();

    if (!nextArtist || !nextTitle) {
      Alert.alert('입력 필요', '아티스트와 제목을 모두 입력해주세요.');
      return;
    }

    if (mode === 'edit' && editingTarget) {
      updateReservationRequest(editingTarget.id, { artist: nextArtist, title: nextTitle });
      closeSheet();
      return;
    }

    addReservationRequest({ artist: nextArtist, title: nextTitle });
    closeSheet();
  };

  const confirmDelete = (request: ReservationRequest) => {
    Alert.alert('삭제 확인', `"${request.title}" 예약 요청을 삭제할까요?`, [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => removeReservationRequest(request.id),
      },
    ]);
  };

  return (
    <AppScreen>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>선곡예약 리스트</Text>
          <Text style={styles.subtitle}>TJ 미등록 곡을 등록 알림 대상으로 관리합니다.</Text>
        </View>
        <PinkButton label="추가" onPress={openCreateSheet} />
      </View>

      <ScrollView contentContainerStyle={styles.listContent}>
        {reservationRequests.map((request) => (
          <View key={request.id} style={styles.requestCard}>
            <View style={styles.requestTopRow}>
              <View style={styles.requestTextWrap}>
                <Text style={styles.requestTitle}>{request.title}</Text>
                <Text style={styles.requestArtist}>{request.artist}</Text>
              </View>
              <View style={styles.pendingBadge}>
                <Text style={styles.pendingText}>대기중</Text>
              </View>
            </View>

            <View style={styles.actionRow}>
              <Pressable onPress={() => openEditSheet(request)} style={styles.ghostButton}>
                <Text style={styles.ghostButtonText}>수정</Text>
              </Pressable>
              <Pressable onPress={() => confirmDelete(request)} style={styles.ghostButton}>
                <Text style={styles.ghostButtonText}>삭제</Text>
              </Pressable>
            </View>
          </View>
        ))}

        {!reservationRequests.length ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyTitle}>예약 요청이 없습니다.</Text>
            <Text style={styles.emptyDesc}>우측 상단 `추가` 버튼으로 아티스트/제목을 등록하세요.</Text>
          </View>
        ) : null}
      </ScrollView>

      <Modal transparent visible={isSheetVisible} animationType="none" onRequestClose={closeSheet}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalRoot}>
          <Pressable style={styles.dim} onPress={closeSheet} />
          <Animated.View style={[styles.sheet, { transform: [{ translateY: slideY }] }]}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>{mode === 'edit' ? '예약 요청 수정' : '예약 요청 추가'}</Text>

            <Text style={styles.fieldLabel}>아티스트</Text>
            <TextInput
              value={artist}
              onChangeText={setArtist}
              placeholder="아티스트 입력"
              placeholderTextColor="#8A8A8A"
              style={styles.input}
            />

            <Text style={styles.fieldLabel}>제목</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="곡 제목 입력"
              placeholderTextColor="#8A8A8A"
              style={styles.input}
            />

            <View style={styles.sheetActionRow}>
              <Pressable onPress={closeSheet} style={styles.cancelButton}>
                <Text style={styles.cancelText}>취소</Text>
              </Pressable>
              <PinkButton label={mode === 'edit' ? '수정 완료' : '추가'} onPress={submitForm} />
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </Modal>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    marginTop: 8,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  title: {
    color: '#111111',
    fontSize: 32,
    fontWeight: '900',
  },
  subtitle: {
    marginTop: 4,
    color: '#666666',
    fontSize: 13,
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 26,
    gap: 10,
  },
  requestCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EBEBEB',
    backgroundColor: '#FFFFFF',
    padding: 12,
    gap: 10,
  },
  requestTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  requestTextWrap: {
    flex: 1,
    gap: 3,
  },
  requestTitle: {
    color: '#111111',
    fontSize: 17,
    fontWeight: '800',
  },
  requestArtist: {
    color: '#444444',
    fontSize: 14,
    fontWeight: '600',
  },
  pendingBadge: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#FFC3E8',
    backgroundColor: '#FFF4FB',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  pendingText: {
    color: '#CE007D',
    fontSize: 12,
    fontWeight: '800',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  ghostButton: {
    minWidth: 62,
    minHeight: 34,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D5D5D5',
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
  emptyWrap: {
    marginTop: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#ECECEC',
    backgroundColor: '#FAFAFA',
    padding: 14,
    gap: 4,
  },
  emptyTitle: {
    color: '#222222',
    fontSize: 14,
    fontWeight: '800',
  },
  emptyDesc: {
    color: '#666666',
    fontSize: 13,
  },
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  dim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 20,
    minHeight: SHEET_HEIGHT,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 42,
    height: 4,
    borderRadius: 999,
    backgroundColor: '#D6D6D6',
    marginBottom: 12,
  },
  sheetTitle: {
    color: '#111111',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 12,
  },
  fieldLabel: {
    color: '#111111',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
  },
  input: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: '#DADADA',
    borderRadius: 10,
    paddingHorizontal: 12,
    color: '#111111',
    fontSize: 15,
    backgroundColor: '#FFFFFF',
    marginBottom: 10,
  },
  sheetActionRow: {
    marginTop: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  cancelButton: {
    minHeight: 38,
    minWidth: 72,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D3D3D3',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  cancelText: {
    color: '#333333',
    fontSize: 14,
    fontWeight: '700',
  },
});
