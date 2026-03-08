import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';

import { MusicTheme } from '@/constants/music-theme';
import { AppScreen } from '@/components/music/app-screen';
import { PinkButton } from '@/components/music/pink-button';
import { usePushToken } from '@/contexts/push-token-context';
import {
  createReservation,
  deleteReservation,
  listReservations,
  updateReservation,
  type Reservation,
} from '@/services/reservation-api';

const SHEET_HEIGHT = 320;

type FormMode = 'create' | 'edit';

export default function ReservationScreen() {
  const { expoPushToken } = usePushToken();

  const isFocused = useIsFocused();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isSheetVisible, setIsSheetVisible] = useState(false);
  const [mode, setMode] = useState<FormMode>('create');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [artist, setArtist] = useState('');
  const [title, setTitle] = useState('');

  const slideY = useRef(new Animated.Value(SHEET_HEIGHT)).current;

  const editingTarget = useMemo(
    () => reservations.find((item) => item.id === editingId) ?? null,
    [editingId, reservations]
  );

  const fetchReservations = useCallback(async () => {
    if (!expoPushToken) return;
    setLoading(true);
    try {
      const res = await listReservations(expoPushToken);
      if (res.success && res.data) {
        setReservations(res.data);
      }
    } catch {
      Alert.alert('오류', '예약 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, [expoPushToken]);

  useEffect(() => {
    if (isFocused) {
      fetchReservations();
    }
  }, [fetchReservations, isFocused]);

  const onRefresh = useCallback(async () => {
    if (!expoPushToken) return;
    setRefreshing(true);
    try {
      const res = await listReservations(expoPushToken);
      if (res.success && res.data) {
        setReservations(res.data);
      }
    } catch {
      // ignore
    } finally {
      setRefreshing(false);
    }
  }, [expoPushToken]);

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

  const openEditSheet = (reservation: Reservation) => {
    setMode('edit');
    setEditingId(reservation.id);
    setArtist(reservation.artist);
    setTitle(reservation.title);
    setIsSheetVisible(true);
  };

  const submitForm = async () => {
    const nextArtist = artist.trim();
    const nextTitle = title.trim();

    if (!nextArtist || !nextTitle) {
      Alert.alert('입력 필요', '아티스트와 제목을 모두 입력해주세요.');
      return;
    }

    if (!expoPushToken) {
      Alert.alert('알림', '푸시 알림을 사용할 수 없는 환경입니다.');
      return;
    }

    if (mode === 'edit' && editingTarget) {
      const res = await updateReservation(expoPushToken, editingTarget.id, nextArtist, nextTitle);
      if (!res.success) {
        Alert.alert('오류', '예약 수정에 실패했습니다.');
        return;
      }
    } else {
      const res = await createReservation(expoPushToken, nextArtist, nextTitle);
      if (!res.success) {
        Alert.alert('오류', '예약 등록에 실패했습니다.');
        return;
      }
    }

    closeSheet();
    fetchReservations();
  };

  const confirmDelete = (reservation: Reservation) => {
    Alert.alert('삭제 확인', `"${reservation.title}" 알림을 삭제할까요?`, [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          if (!expoPushToken) return;
          const res = await deleteReservation(expoPushToken, reservation.id);
          if (res.success) {
            fetchReservations();
          } else {
            Alert.alert('오류', '예약 삭제에 실패했습니다.');
          }
        },
      },
    ]);
  };

  const isMatched = (reservation: Reservation) => reservation.status === 'matched';

  return (
    <AppScreen>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>신곡 알림</Text>
          <Text style={styles.subtitle}>TJ에 등록되면 푸시 알림을 보내드립니다.</Text>
        </View>
        <PinkButton label="추가" onPress={openCreateSheet} />
      </View>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={MusicTheme.colors.primary} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={MusicTheme.colors.primary}
              colors={[MusicTheme.colors.primary]}
            />
          }
        >
          {reservations.map((reservation) => (
            <View key={reservation.id} style={styles.requestCard}>
              <View style={styles.requestTopRow}>
                <View style={styles.requestTextWrap}>
                  <Text style={styles.requestTitle}>{reservation.title}</Text>
                  <Text style={styles.requestArtist}>{reservation.artist}</Text>
                </View>
                <View style={isMatched(reservation) ? styles.matchedBadge : styles.pendingBadge}>
                  <Text style={isMatched(reservation) ? styles.matchedText : styles.pendingText}>
                    {isMatched(reservation) ? '매치됨' : '대기중'}
                  </Text>
                </View>
              </View>

              {!isMatched(reservation) ? (
                <View style={styles.actionRow}>
                  <Pressable onPress={() => openEditSheet(reservation)} style={styles.ghostButton}>
                    <Text style={styles.ghostButtonText}>수정</Text>
                  </Pressable>
                  <Pressable onPress={() => confirmDelete(reservation)} style={styles.ghostButton}>
                    <Text style={styles.ghostButtonText}>삭제</Text>
                  </Pressable>
                </View>
              ) : null}
            </View>
          ))}

          {!reservations.length ? (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyTitle}>등록된 알림이 없습니다.</Text>
              <Text style={styles.emptyDesc}>우측 상단 추가 버튼으로 아티스트/제목을 등록하세요.</Text>
            </View>
          ) : null}
        </ScrollView>
      )}

      <Modal transparent visible={isSheetVisible} animationType="none" onRequestClose={closeSheet}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalRoot}>
          <Pressable style={styles.dim} onPress={closeSheet} />
          <Animated.View style={[styles.sheet, { transform: [{ translateY: slideY }] }]}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>{mode === 'edit' ? '신곡 알림 수정' : '신곡 알림 추가'}</Text>

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
    marginTop: 4,
    marginBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  title: {
    color: MusicTheme.colors.text,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  subtitle: {
    marginTop: 4,
    color: MusicTheme.colors.textMuted,
    fontSize: 13,
    fontWeight: '500',
  },
  loadingWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: 28,
    gap: 12,
  },
  requestCard: {
    borderRadius: MusicTheme.radius.lg,
    borderWidth: 1,
    borderColor: MusicTheme.colors.borderLight,
    backgroundColor: MusicTheme.colors.surface,
    padding: MusicTheme.spacing.md,
    gap: 10,
    ...MusicTheme.shadow.card,
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
    color: MusicTheme.colors.text,
    fontSize: 17,
    fontWeight: '700',
  },
  requestArtist: {
    color: MusicTheme.colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  pendingBadge: {
    borderRadius: MusicTheme.radius.full,
    borderWidth: 1,
    borderColor: MusicTheme.colors.warningBg,
    backgroundColor: MusicTheme.colors.warningBg,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  pendingText: {
    color: MusicTheme.colors.warning,
    fontSize: 12,
    fontWeight: '800',
  },
  matchedBadge: {
    borderRadius: MusicTheme.radius.full,
    borderWidth: 1,
    borderColor: MusicTheme.colors.successBg,
    backgroundColor: MusicTheme.colors.successBg,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  matchedText: {
    color: MusicTheme.colors.success,
    fontSize: 12,
    fontWeight: '800',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  ghostButton: {
    minWidth: 64,
    minHeight: 36,
    borderRadius: MusicTheme.radius.md,
    borderWidth: 1.5,
    borderColor: MusicTheme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    backgroundColor: MusicTheme.colors.surface,
  },
  ghostButtonText: {
    color: MusicTheme.colors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
  },
  emptyWrap: {
    marginTop: 16,
    borderRadius: MusicTheme.radius.lg,
    borderWidth: 1,
    borderColor: MusicTheme.colors.borderLight,
    backgroundColor: MusicTheme.colors.surfaceAlt,
    padding: MusicTheme.spacing.lg,
    gap: 6,
  },
  emptyTitle: {
    color: MusicTheme.colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  emptyDesc: {
    color: MusicTheme.colors.textMuted,
    fontSize: 13,
  },
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  dim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  sheet: {
    borderTopLeftRadius: MusicTheme.radius.xl,
    borderTopRightRadius: MusicTheme.radius.xl,
    backgroundColor: MusicTheme.colors.surface,
    paddingHorizontal: MusicTheme.spacing.lg,
    paddingTop: 12,
    paddingBottom: 24,
    minHeight: SHEET_HEIGHT,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: MusicTheme.radius.full,
    backgroundColor: MusicTheme.colors.border,
    marginBottom: 14,
  },
  sheetTitle: {
    color: MusicTheme.colors.text,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 14,
  },
  fieldLabel: {
    color: MusicTheme.colors.text,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
  },
  input: {
    minHeight: 46,
    borderWidth: 1.5,
    borderColor: MusicTheme.colors.border,
    borderRadius: MusicTheme.radius.md,
    paddingHorizontal: 14,
    color: MusicTheme.colors.text,
    fontSize: 15,
    backgroundColor: MusicTheme.colors.surface,
    marginBottom: 12,
  },
  sheetActionRow: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  cancelButton: {
    minHeight: 44,
    minWidth: 76,
    borderRadius: MusicTheme.radius.md,
    borderWidth: 1.5,
    borderColor: MusicTheme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    backgroundColor: MusicTheme.colors.surface,
  },
  cancelText: {
    color: MusicTheme.colors.textSecondary,
    fontSize: 14,
    fontWeight: '700',
  },
});
