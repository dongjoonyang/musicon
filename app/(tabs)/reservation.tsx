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
import { MaterialCommunityIcons } from '@expo/vector-icons';
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

const SHEET_HEIGHT = 340;
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
    [editingId, reservations],
  );

  const fetchReservations = useCallback(async () => {
    if (!expoPushToken) return;
    setLoading(true);
    try {
      const res = await listReservations(expoPushToken);
      if (res.success && res.data) setReservations(res.data);
    } catch {
      Alert.alert('오류', '예약 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, [expoPushToken]);

  useEffect(() => {
    if (isFocused) fetchReservations();
  }, [fetchReservations, isFocused]);

  const onRefresh = useCallback(async () => {
    if (!expoPushToken) return;
    setRefreshing(true);
    try {
      const res = await listReservations(expoPushToken);
      if (res.success && res.data) setReservations(res.data);
    } catch {
      // ignore
    } finally {
      setRefreshing(false);
    }
  }, [expoPushToken]);

  useEffect(() => {
    if (isSheetVisible) {
      Animated.timing(slideY, { toValue: 0, duration: 240, useNativeDriver: true }).start();
      return;
    }
    slideY.setValue(SHEET_HEIGHT);
  }, [isSheetVisible, slideY]);

  const closeSheet = () => {
    Animated.timing(slideY, { toValue: SHEET_HEIGHT, duration: 200, useNativeDriver: true }).start(({ finished }) => {
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
    if (!nextArtist) {
      Alert.alert('입력 필요', '아티스트를 입력해주세요.');
      return;
    }
    if (!expoPushToken) {
      Alert.alert('알림', '푸시 알림을 사용할 수 없는 환경입니다.');
      return;
    }
    try {
      if (mode === 'edit' && editingTarget) {
        const res = await updateReservation(expoPushToken, editingTarget.id, nextArtist, nextTitle);
        if (!res.success) {
          Alert.alert('오류', res.error ?? '예약 수정에 실패했습니다.');
          return;
        }
      } else {
        const res = await createReservation(expoPushToken, nextArtist, nextTitle);
        if (!res.success) {
          Alert.alert('오류', res.error ?? '예약 등록에 실패했습니다.');
          return;
        }
      }
      closeSheet();
      fetchReservations();
    } catch {
      Alert.alert('오류', '서버와 통신할 수 없습니다. 네트워크를 확인해주세요.');
    }
  };

  const confirmDelete = (reservation: Reservation) => {
    const label = reservation.title || `${reservation.artist} 모든 신곡`;
    Alert.alert('삭제 확인', `"${label}" 알림을 삭제할까요?`, [
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
  const isArtistOnly = (reservation: Reservation) => !reservation.title;

  const getBadgeInfo = (reservation: Reservation) => {
    if (isMatched(reservation)) return { label: '매치됨', matched: true };
    if (isArtistOnly(reservation)) return { label: '구독중', matched: false };
    return { label: '대기중', matched: false };
  };

  return (
    <AppScreen>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.headerText}>
          <Text style={styles.title}>신곡 알림</Text>
          <Text style={styles.subtitle}>TJ에 등록되면 푸시 알림을 보내드립니다.</Text>
        </View>
        <Pressable
          onPress={openCreateSheet}
          style={({ pressed }) => [styles.addBtn, pressed && { opacity: 0.75 }]}
        >
          <MaterialCommunityIcons name="plus" size={18} color={MusicTheme.colors.primary} />
          <Text style={styles.addBtnText}>추가</Text>
        </Pressable>
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
            <View key={reservation.id} style={styles.card}>
              <View style={styles.cardTop}>
                <View style={styles.cardIconWrap}>
                  <MaterialCommunityIcons name="bell-ring-outline" size={18} color={MusicTheme.colors.primary} />
                </View>
                <View style={styles.cardTextWrap}>
                  <Text style={styles.cardTitle}>
                    {reservation.title || '모든 신곡'}
                  </Text>
                  <Text style={styles.cardArtist}>{reservation.artist}</Text>
                </View>
                <View style={getBadgeInfo(reservation).matched ? styles.matchedBadge : styles.pendingBadge}>
                  <Text style={getBadgeInfo(reservation).matched ? styles.matchedText : styles.pendingText}>
                    {getBadgeInfo(reservation).label}
                  </Text>
                </View>
              </View>
              {!isMatched(reservation) ? (
                <View style={styles.cardActions}>
                  <Pressable
                    onPress={() => openEditSheet(reservation)}
                    style={({ pressed }) => [styles.actionBtn, pressed && { opacity: 0.7 }]}
                  >
                    <Text style={styles.actionBtnText}>수정</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => confirmDelete(reservation)}
                    style={({ pressed }) => [styles.actionBtn, pressed && { opacity: 0.7 }]}
                  >
                    <Text style={styles.actionBtnText}>삭제</Text>
                  </Pressable>
                </View>
              ) : null}
            </View>
          ))}

          {!reservations.length ? (
            <View style={styles.emptyWrap}>
              <MaterialCommunityIcons name="bell-off-outline" size={40} color={MusicTheme.colors.border} />
              <Text style={styles.emptyTitle}>등록된 알림이 없습니다</Text>
              <Text style={styles.emptyDesc}>추가 버튼으로 아티스트를 등록하면{'\n'}TJ 신곡 등록 시 알려드립니다.</Text>
            </View>
          ) : null}
        </ScrollView>
      )}

      {/* Bottom Sheet */}
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
              placeholder="아티스트 이름 입력"
              placeholderTextColor={MusicTheme.colors.textMuted}
              style={styles.input}
            />

            <Text style={styles.fieldLabel}>곡 제목 (선택)</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="비우면 모든 신곡 알림"
              placeholderTextColor={MusicTheme.colors.textMuted}
              style={styles.input}
            />

            <View style={styles.sheetActions}>
              <Pressable onPress={closeSheet} style={({ pressed }) => [styles.cancelBtn, pressed && { opacity: 0.7 }]}>
                <Text style={styles.cancelText}>취소</Text>
              </Pressable>
              <PinkButton
                label={mode === 'edit' ? '수정 완료' : '추가하기'}
                onPress={submitForm}
                fullWidth={false}
              />
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </Modal>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingTop: MusicTheme.spacing.md,
    paddingBottom: MusicTheme.spacing.md,
    gap: 12,
  },
  headerText: {
    flex: 1,
    gap: 3,
  },
  title: {
    color: MusicTheme.colors.text,
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  subtitle: {
    color: MusicTheme.colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: MusicTheme.radius.md,
    backgroundColor: MusicTheme.colors.primaryLight,
  },
  addBtnText: {
    color: MusicTheme.colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  loadingWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: 32,
    gap: 10,
  },
  card: {
    borderRadius: MusicTheme.radius.lg,
    backgroundColor: MusicTheme.colors.surface,
    padding: MusicTheme.spacing.md,
    gap: 12,
    ...MusicTheme.shadow.card,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardIconWrap: {
    width: 40,
    height: 40,
    borderRadius: MusicTheme.radius.md,
    backgroundColor: MusicTheme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTextWrap: {
    flex: 1,
    gap: 2,
  },
  cardTitle: {
    color: MusicTheme.colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  cardArtist: {
    color: MusicTheme.colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
  pendingBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: MusicTheme.radius.full,
    backgroundColor: MusicTheme.colors.warningBg,
  },
  pendingText: {
    color: MusicTheme.colors.warning,
    fontSize: 11,
    fontWeight: '700',
  },
  matchedBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: MusicTheme.radius.full,
    backgroundColor: MusicTheme.colors.successBg,
  },
  matchedText: {
    color: MusicTheme.colors.success,
    fontSize: 11,
    fontWeight: '700',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: MusicTheme.colors.borderLight,
  },
  actionBtn: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: MusicTheme.radius.sm,
    borderWidth: 1.5,
    borderColor: MusicTheme.colors.border,
  },
  actionBtnText: {
    color: MusicTheme.colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  emptyWrap: {
    marginTop: 48,
    alignItems: 'center',
    gap: 10,
  },
  emptyTitle: {
    color: MusicTheme.colors.text,
    fontSize: 15,
    fontWeight: '700',
    marginTop: 4,
  },
  emptyDesc: {
    color: MusicTheme.colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
  },
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  dim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: MusicTheme.colors.surface,
    paddingHorizontal: MusicTheme.spacing.lg,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 36 : 28,
    minHeight: SHEET_HEIGHT,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: MusicTheme.radius.full,
    backgroundColor: MusicTheme.colors.border,
    marginBottom: 18,
  },
  sheetTitle: {
    color: MusicTheme.colors.text,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 20,
  },
  fieldLabel: {
    color: MusicTheme.colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
    marginBottom: 6,
  },
  input: {
    height: 50,
    borderWidth: 1.5,
    borderColor: MusicTheme.colors.border,
    borderRadius: MusicTheme.radius.md,
    paddingHorizontal: 16,
    color: MusicTheme.colors.text,
    fontSize: 15,
    fontWeight: '500',
    backgroundColor: MusicTheme.colors.surfaceAlt,
    marginBottom: 14,
  },
  sheetActions: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  cancelBtn: {
    height: 46,
    minWidth: 80,
    borderRadius: MusicTheme.radius.md,
    borderWidth: 1.5,
    borderColor: MusicTheme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  cancelText: {
    color: MusicTheme.colors.textSecondary,
    fontSize: 15,
    fontWeight: '600',
  },
});
