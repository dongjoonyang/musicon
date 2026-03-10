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
          <ActivityIndicator size="large" color="#FF00FF" />
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
            tintColor="#FF00FF"
            colors={['#FF00FF']}
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
                  <MaterialCommunityIcons name="sync" size={18} color="#FFFFFF" />
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
          <ActivityIndicator size="small" color="#FF00FF" />
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
    paddingBottom: 30,
    gap: 10,
  },
  loadingWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    marginTop: 8,
    color: '#111111',
    fontSize: 32,
    fontWeight: '900',
  },
  subtitle: {
    color: '#666666',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  sectionTitle: {
    marginTop: 8,
    color: '#111111',
    fontSize: 16,
    fontWeight: '800',
  },
  errorWrap: {
    borderRadius: 10,
    backgroundColor: '#FFF0F0',
    borderWidth: 1,
    borderColor: '#FFD0D0',
    padding: 10,
  },
  errorText: {
    color: '#CC0000',
    fontSize: 13,
    fontWeight: '600',
  },
  providerCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EBEBEB',
    backgroundColor: '#FFFFFF',
    padding: 14,
  },
  providerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  providerTextWrap: {
    flex: 1,
    gap: 2,
  },
  providerName: {
    color: '#111111',
    fontSize: 16,
    fontWeight: '800',
  },
  providerAccount: {
    fontSize: 13,
    fontWeight: '600',
  },
  providerDisconnected: {
    color: '#999999',
    fontSize: 13,
    fontWeight: '600',
  },
  connectButton: {
    minWidth: 60,
    minHeight: 36,
    borderRadius: 10,
    backgroundColor: '#FF00FF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  connectText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  disconnectButton: {
    minWidth: 52,
    minHeight: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D5D5D5',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  disconnectText: {
    color: '#666666',
    fontSize: 13,
    fontWeight: '700',
  },
  disabledButton: {
    opacity: 0.4,
  },
  syncSection: {
    marginTop: 4,
    alignItems: 'center',
    gap: 8,
  },
  syncHint: {
    color: '#888888',
    fontSize: 12,
    textAlign: 'center',
  },
  emptyWrap: {
    marginTop: 6,
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
  matchCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EBEBEB',
    backgroundColor: '#FFFFFF',
    padding: 12,
    gap: 8,
  },
  matchTextWrap: {
    gap: 3,
  },
  matchTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  matchTitle: {
    flex: 1,
    color: '#111111',
    fontSize: 16,
    fontWeight: '800',
  },
  matchTjNumber: {
    color: '#FF00FF',
    fontSize: 13,
    fontWeight: '800',
  },
  matchArtist: {
    color: '#444444',
    fontSize: 14,
    fontWeight: '600',
  },
  matchMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  providerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F5F5F5',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  providerBadgeText: {
    color: '#777777',
    fontSize: 11,
    fontWeight: '600',
    maxWidth: 180,
  },
  matchScore: {
    color: '#999999',
    fontSize: 11,
    fontWeight: '700',
  },
  matchActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
});
