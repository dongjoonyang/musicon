import { request, type ApiResponse } from './api';
import type { MatchedTrackResult, MusicAccount, MusicProviderType, SyncResult } from '@/types/music';

export async function connectSpotify(
  code: string,
  redirectUri: string,
  expoPushToken: string,
): Promise<ApiResponse<MusicAccount>> {
  return request<MusicAccount>('/api/music/spotify/connect', {
    method: 'POST',
    body: JSON.stringify({
      code,
      redirect_uri: redirectUri,
      expo_push_token: expoPushToken,
    }),
  });
}

export async function connectYouTube(
  code: string,
  redirectUri: string,
  expoPushToken: string,
): Promise<ApiResponse<MusicAccount>> {
  return request<MusicAccount>('/api/music/youtube/connect', {
    method: 'POST',
    body: JSON.stringify({
      code,
      redirect_uri: redirectUri,
      expo_push_token: expoPushToken,
    }),
  });
}

export async function listMusicAccounts(
  expoPushToken: string,
): Promise<ApiResponse<MusicAccount[]>> {
  return request<MusicAccount[]>(
    `/api/music/accounts?token=${encodeURIComponent(expoPushToken)}`,
  );
}

export async function disconnectMusicAccount(
  provider: MusicProviderType,
  expoPushToken: string,
): Promise<ApiResponse<void>> {
  return request<void>(
    `/api/music/accounts/${provider}?token=${encodeURIComponent(expoPushToken)}`,
    { method: 'DELETE' },
  );
}

export async function syncTracks(
  expoPushToken: string,
): Promise<ApiResponse<SyncResult[]>> {
  return request<SyncResult[]>(
    `/api/music/sync?token=${encodeURIComponent(expoPushToken)}`,
    { method: 'POST' },
  );
}

export async function getMatches(
  expoPushToken: string,
  limit = 20,
  offset = 0,
): Promise<ApiResponse<MatchedTrackResult[]>> {
  return request<MatchedTrackResult[]>(
    `/api/music/matches?token=${encodeURIComponent(expoPushToken)}&limit=${limit}&offset=${offset}`,
  );
}
