import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

import { AppScreen } from '@/components/music/app-screen';
import { PinkButton } from '@/components/music/pink-button';
import {
  SPOTIFY_CLIENT_ID,
  SPOTIFY_DISCOVERY,
  SPOTIFY_SCOPES,
  YOUTUBE_CLIENT_ID,
  YOUTUBE_DISCOVERY,
  YOUTUBE_SCOPES,
} from '@/constants/music';
import { MusicTheme } from '@/constants/music-theme'; // Import MusicTheme
import { useMusic } from '@/contexts/music-context';
import { usePushToken } from '@/contexts/push-token-context';
import {
  connectSpotify,
  connectYouTube,
  disconnectMusicAccount,
  getMatches,
  listMusicAccounts,
  syncTracks,
} from '@/services/music-api';
import type { MatchedTrackResult, MusicAccount, MusicProviderType } from '@/types/music';

WebBrowser.maybeCompleteAuthSession();

const PROVIDER_META: Record<string, { label: string; icon: string; color: string }> = {
  spotify: { label: 'Spotify', icon: 'spotify', color: '#1DB954' },
  youtube: { label: 'YouTube Music', icon: 'youtube', color: '#FF0000' },
};

export default function MyMusicScreen() {
  const { expoPushToken } = usePushToken();
  const { playlists, addSongToPlaylist } = useMusic();
  const isFocused = useIsFocused();

  const [accounts, setAccounts] = useState<MusicAccount[]>([]);
  const [matches, setMatches] = useState<MatchedTrackResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Guard against consuming the same OAuth code twice
  const spotifyCodeConsumed = useRef<string | null>(null);
  const youtubeCodeConsumed = useRef<string | null>(null);

  const redirectUri = AuthSession.makeRedirectUri();

  const [spotifyRequest, spotifyResponse, promptSpotify] = AuthSession.useAuthRequest(
    {
      clientId: SPOTIFY_CLIENT_ID,
      scopes: SPOTIFY_SCOPES,
      redirectUri,
      responseType: AuthSession.ResponseType.Code,
      usePKCE: false,
    },
    SPOTIFY_DISCOVERY,
  );

  const [youtubeRequest, youtubeResponse, promptYouTube] = AuthSession.useAuthRequest(
    {
      clientId: YOUTUBE_CLIENT_ID,
      scopes: YOUTUBE_SCOPES,
      redirectUri,
      responseType: AuthSession.ResponseType.Code,
      usePKCE: false,
      extraParams: { access_type: 'offline', prompt: 'consent' },
    },
    YOUTUBE_DISCOVERY,
  );

  const fetchAccounts = useCallback(async () => {
    if (!expoPushToken) return;
    try {
      const res = await listMusicAccounts(expoPushToken);
      if (res.success && res.data) {
        setAccounts(res.data);
      }
    } catch {
      setError('계정 정보를 불러오지 못했습니다.');
    }
  }, [expoPushToken]);

  const fetchMatches = useCallback(async () => {
    if (!expoPushToken) return;
    try {
      const res = await getMatches(expoPushToken, 50, 0);
      if (res.success && res.data) {
        setMatches(res.data);
      }
    } catch {
      setError('매칭 결과를 불러오지 못했습니다.');
    }
  }, [expoPushToken]);

  const loadAll = useCallback(
    async (isRefresh = false) => {
      setError(null);
      isRefresh ? setRefreshing(true) : setLoading(true);
      await Promise.all([fetchAccounts(), fetchMatches()]);
      isRefresh ? setRefreshing(false) : setLoading(false);
    },
    [fetchAccounts, fetchMatches],
  );

  useEffect(() => {
    if (isFocused) {
      loadAll();
    }
  }, [isFocused, loadAll]);

  // Handle Spotify OAuth response
  useEffect(() => {
    if (spotifyResponse?.type !== 'success' || !expoPushToken) return;

    const code = spotifyResponse.params.code;
    if (!code || spotifyCodeConsumed.current === code) return;
    spotifyCodeConsumed.current = code;

    setConnecting('spotify');
    connectSpotify(code, redirectUri, expoPushToken)
      .then((res) => {
        if (res.success) {
          Alert.alert('연결 완료', 'Spotify 계정이 연결되었습니다.');
          fetchAccounts();
        } else {
          Alert.alert('연결 실패', res.error ?? 'Spotify 연결에 실패했습니다.');
        }
      })
      .catch(() => {
        Alert.alert('오류', 'Spotify 연결 중 오류가 발생했습니다.');
      })
      .finally(() => setConnecting(null));
  }, [spotifyResponse, expoPushToken, redirectUri, fetchAccounts]);

  // Handle YouTube OAuth response
  useEffect(() => {
    if (youtubeResponse?.type !== 'success' || !expoPushToken) return;

    const code = youtubeResponse.params.code;
    if (!code || youtubeCodeConsumed.current === code) return;
    youtubeCodeConsumed.current = code;

    setConnecting('youtube');
    connectYouTube(code, redirectUri, expoPushToken)
      .then((res) => {
        if (res.success) {
          Alert.alert('연결 완료', 'YouTube 계정이 연결되었습니다.');
          fetchAccounts();
        } else {
          Alert.alert('연결 실패', res.error ?? 'YouTube 연결에 실패했습니다.');
        }
      })
      .catch(() => {
        Alert.alert('오류', 'YouTube 연결 중 오류가 발생했습니다.');
      })
      .finally(() => setConnecting(null));
  }, [youtubeResponse, expoPushToken, redirectUri, fetchAccounts]);

  const handleSync = async () => {
    if (!expoPushToken) return;
    if (accounts.length === 0) {
      Alert.alert('알림', '먼저 음악 서비스를 연결해주세요.');
      return;
    }

    setSyncing(true);
    try {
      const res = await syncTracks(expoPushToken);
      if (res.success && res.data) {
        const summary = res.data
          .map((r) => `${PROVIDER_META[r.provider]?.label ?? r.provider}: ${r.tracks_matched}/${r.tracks_found}곡 매칭`)
          .join('\n');
        Alert.alert('동기화 완료', summary);
        fetchMatches();
      } else {
        Alert.alert('동기화 실패', res.error ?? '트랙 동기화에 실패했습니다.');
      }
    } catch {
      Alert.alert('오류', '동기화 중 오류가 발생했습니다.');
    } finally {
      setSyncing(false);
    }
  };

  const handleDisconnect = (provider: MusicProviderType) => {
    const meta = PROVIDER_META[provider];
    Alert.alert('연결 해제', `${meta?.label ?? provider} 계정 연결을 해제할까요?`, [
      { text: '취소', style: 'cancel' },
      {
        text: '해제',
        style: 'destructive',
        onPress: async () => {
          if (!expoPushToken) return;
          try {
            const res = await disconnectMusicAccount(provider, expoPushToken);
            if (res.success) {
              fetchAccounts();
              fetchMatches();
            } else {
              Alert.alert('오류', '연결 해제에 실패했습니다.');
            }
          } catch {
            Alert.alert('오류', '연결 해제 중 오류가 발생했습니다.');
          }
        },
      },
    ]);
  };

  const handleAddToPlaylist = (match: MatchedTrackResult) => {
    if (!match.song) return;
    if (playlists.length === 0) {
      Alert.alert('알림', '먼저 플레이리스트를 만들어주세요.');
      return;
    }
    const tjSong = {
      id: String(match.song.id),
      tjNumber: String(match.song.tj_number),
      title: match.song.title,
      artist: match.song.artist,
    };
    addSongToPlaylist(tjSong, playlists[0].id);
    Alert.alert('추가 완료', `${tjSong.title} (TJ ${tjSong.tjNumber})이 플레이리스트에 추가되었습니다.`);
  };

  const matchedResults = matches.filter((m) => m.status === 'matched' && m.song);

  if (loading) {
    return (
      <AppScreen>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={MusicTheme.colors.primary} />
        </View>
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadAll(true)}
            tintColor={MusicTheme.colors.primary}
            colors={[MusicTheme.colors.primary]}
          />
        }
      >
        <Text style={styles.title}>내 음악</Text>
        <Text style={styles.subtitle}>음악 서비스를 연결하고 TJ 노래번호를 찾아보세요</Text>

        {error ? (
          <View style={styles.errorWrap}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Connected Accounts Section */}
        <Text style={styles.sectionTitle}>음악 서비스 연결</Text>

        <ProviderCard
          provider="spotify"
          account={accounts.find((a) => a.provider === 'spotify')}
          connecting={connecting === 'spotify'}
          onConnect={() => promptSpotify()}
          onDisconnect={() => handleDisconnect('spotify')}
          disabled={!spotifyRequest}
        />

        <ProviderCard
          provider="youtube"
          account={accounts.find((a) => a.provider === 'youtube')}
          connecting={connecting === 'youtube'}
          onConnect={() => promptYouTube()}
          onDisconnect={() => handleDisconnect('youtube')}
          disabled={!youtubeRequest}
        />

        {/* Sync Section */}
        {accounts.length > 0 ? (
          <View style={styles.syncSection}>
            <PinkButton
              label={syncing ? '동기화 중...' : '트랙 동기화'}
              icon={
                syncing ? undefined : (
                  <MaterialCommunityIcons name="sync" size={18} color={MusicTheme.colors.white} />
                )
              }
              onPress={syncing ? undefined : handleSync}
            />
            <Text style={styles.syncHint}>
              연결된 서비스에서 좋아하는 곡을 가져와 TJ 번호와 매칭합니다
            </Text>
          </View>
        ) : null}

        {/* Match Results Section */}
        {matchedResults.length > 0 ? (
          <>
            <Text style={styles.sectionTitle}>매칭된 곡 ({matchedResults.length})</Text>
            {matchedResults.map((match) => (
              <MatchCard
                key={match.track.id}
                match={match}
                onAdd={() => handleAddToPlaylist(match)}
              />
            ))}
          </>
        ) : accounts.length > 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyTitle}>매칭된 곡이 없습니다</Text>
            <Text style={styles.emptyDesc}>
              위 동기화 버튼을 눌러 음악 서비스의 곡들을 TJ 번호와 매칭해보세요.
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </AppScreen>
  );
}

function ProviderCard({
  provider,
  account,
  connecting,
  onConnect,
  onDisconnect,
  disabled,
}: {
  provider: string;
  account?: MusicAccount;
  connecting: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  disabled: boolean;
}) {
  const meta = PROVIDER_META[provider];
  if (!meta) return null;

  return (
    <View style={styles.providerCard}>
      <View style={styles.providerRow}>
        <MaterialCommunityIcons
          name={meta.icon as keyof typeof MaterialCommunityIcons.glyphMap}
          size={28}
          color={meta.color}
        />
        <View style={styles.providerTextWrap}>
          <Text style={styles.providerName}>{meta.label}</Text>
          {account ? (
            <Text style={[styles.providerAccount, { color: meta.color }]}>
              {account.display_name}
            </Text>
          ) : (
            <Text style={styles.providerDisconnected}>연결되지 않음</Text>
          )}
        </View>
        {connecting ? (
          <ActivityIndicator size="small" color={MusicTheme.colors.primary} />
        ) : account ? (
          <Pressable onPress={onDisconnect} style={styles.disconnectButton}>
            <Text style={styles.disconnectText}>해제</Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={onConnect}
            disabled={disabled}
            style={[styles.connectButton, disabled && styles.disabledButton]}
          >
            <Text style={styles.connectText}>연결</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

function MatchCard({
  match,
  onAdd,
}: {
  match: MatchedTrackResult;
  onAdd: () => void;
}) {
  const { track, song } = match;
  if (!song) return null;

  const score = Math.round(match.match_score * 100);
  const providerMeta = PROVIDER_META[track.provider];

  return (
    <View style={styles.matchCard}>
      <View style={styles.matchTextWrap}>
        <View style={styles.matchTitleRow}>
          <Text style={styles.matchTitle} numberOfLines={1}>
            {song.title}
          </Text>
          <Text style={styles.matchTjNumber}>TJ {song.tj_number}</Text>
        </View>
        <Text style={styles.matchArtist} numberOfLines={1}>
          {song.artist}
        </Text>
        <View style={styles.matchMetaRow}>
          {providerMeta ? (
            <View style={styles.providerBadge}>
              <MaterialCommunityIcons
                name={providerMeta.icon as keyof typeof MaterialCommunityIcons.glyphMap}
                size={12}
                color={providerMeta.color}
              />
              <Text style={styles.providerBadgeText} numberOfLines={1}>
                {track.title}
              </Text>
            </View>
          ) : null}
          <Text style={styles.matchScore}>{score}% 일치</Text>
        </View>
      </View>
      <View style={styles.matchActions}>
        <PinkButton label="플리추가" onPress={onAdd} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: MusicTheme.spacing.lg, // Added horizontal padding
    paddingBottom: MusicTheme.spacing.xl,
    gap: MusicTheme.spacing.md,
  },
  loadingWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    marginTop: MusicTheme.spacing.md,
    color: MusicTheme.colors.text,
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    color: MusicTheme.colors.textSecondary,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: MusicTheme.spacing.sm,
  },
  sectionTitle: {
    marginTop: MusicTheme.spacing.md,
    color: MusicTheme.colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: MusicTheme.spacing.sm,
  },
  errorWrap: {
    borderRadius: MusicTheme.radius.md,
    backgroundColor: MusicTheme.colors.warningBg,
    borderWidth: 1,
    borderColor: MusicTheme.colors.warning,
    padding: MusicTheme.spacing.md,
    marginBottom: MusicTheme.spacing.md,
  },
  errorText: {
    color: MusicTheme.colors.warning,
    fontSize: 14,
    fontWeight: '600',
  },
  providerCard: {
    borderRadius: MusicTheme.radius.lg,
    borderWidth: 1,
    borderColor: MusicTheme.colors.border,
    backgroundColor: MusicTheme.colors.surface,
    padding: MusicTheme.spacing.md,
    ...MusicTheme.shadow.card,
  },
  providerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: MusicTheme.spacing.md,
  },
  providerTextWrap: {
    flex: 1,
    gap: 2,
  },
  providerName: {
    color: MusicTheme.colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  providerAccount: {
    fontSize: 13,
    fontWeight: '500',
  },
  providerDisconnected: {
    color: MusicTheme.colors.textMuted,
    fontSize: 13,
    fontWeight: '500',
  },
  connectButton: {
    minWidth: 60,
    minHeight: 36,
    borderRadius: MusicTheme.radius.md,
    backgroundColor: MusicTheme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: MusicTheme.spacing.md,
  },
  connectText: {
    color: MusicTheme.colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  disconnectButton: {
    minWidth: 52,
    minHeight: 36,
    borderRadius: MusicTheme.radius.md,
    borderWidth: 1,
    borderColor: MusicTheme.colors.border,
    backgroundColor: MusicTheme.colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: MusicTheme.spacing.sm,
  },
  disconnectText: {
    color: MusicTheme.colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
  },
  syncSection: {
    marginTop: MusicTheme.spacing.md,
    alignItems: 'center',
    gap: MusicTheme.spacing.sm,
  },
  syncHint: {
    color: MusicTheme.colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
    paddingHorizontal: MusicTheme.spacing.lg,
  },
  emptyWrap: {
    marginTop: MusicTheme.spacing.sm,
    borderRadius: MusicTheme.radius.lg,
    borderWidth: 1,
    borderColor: MusicTheme.colors.borderLight,
    backgroundColor: MusicTheme.colors.surfaceAlt,
    padding: MusicTheme.spacing.md,
    gap: MusicTheme.spacing.xs,
  },
  emptyTitle: {
    color: MusicTheme.colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  emptyDesc: {
    color: MusicTheme.colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  matchCard: {
    borderRadius: MusicTheme.radius.lg,
    borderWidth: 1,
    borderColor: MusicTheme.colors.border,
    backgroundColor: MusicTheme.colors.surface,
    padding: MusicTheme.spacing.md,
    gap: MusicTheme.spacing.sm,
    ...MusicTheme.shadow.card,
  },
  matchTextWrap: {
    gap: 3,
  },
  matchTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: MusicTheme.spacing.sm,
  },
  matchTitle: {
    flex: 1,
    color: MusicTheme.colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  matchTjNumber: {
    color: MusicTheme.colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  matchArtist: {
    color: MusicTheme.colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  matchMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: MusicTheme.spacing.xs,
  },
  providerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: MusicTheme.colors.surfaceAlt,
    borderRadius: MusicTheme.radius.sm,
    paddingHorizontal: MusicTheme.spacing.sm,
    paddingVertical: 4,
  },
  providerBadgeText: {
    color: MusicTheme.colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    maxWidth: 180,
  },
  matchScore: {
    color: MusicTheme.colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  matchActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
});
