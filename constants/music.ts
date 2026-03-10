import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra ?? {};

export const SPOTIFY_CLIENT_ID: string = extra.spotifyClientId ?? '';
export const YOUTUBE_CLIENT_ID: string = extra.youtubeClientId ?? '';

export const SPOTIFY_SCOPES = ['user-top-read', 'user-library-read'];

export const YOUTUBE_SCOPES = ['https://www.googleapis.com/auth/youtube.readonly'];

export const SPOTIFY_DISCOVERY = {
  authorizationEndpoint: 'https://accounts.spotify.com/authorize',
  tokenEndpoint: 'https://accounts.spotify.com/api/token',
};

export const YOUTUBE_DISCOVERY = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
};
