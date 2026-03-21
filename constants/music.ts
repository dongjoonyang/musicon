import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra ?? {};

export const SPOTIFY_CLIENT_ID: string = extra.spotifyClientId ?? '';
export const YOUTUBE_CLIENT_ID: string = extra.youtubeClientId ?? '';

export const SPOTIFY_SCOPES = ['user-top-read', 'user-library-read'];

export const YOUTUBE_SCOPES = ['https://www.googleapis.com/auth/youtube'];

export const SPOTIFY_DISCOVERY = {
  authorizationEndpoint: 'https://accounts.spotify.com/authorize',
  tokenEndpoint: 'https://accounts.spotify.com/api/token',
};

