export type TjSong = {
  id: string;
  tjNumber: string;
  title: string;
  artist: string;
  youtubeUrl?: string;
};

export type Playlist = {
  id: string;
  name: string;
  songs: TjSong[];
};

export type ReservationRequest = {
  id: string;
  artist: string;
  title: string;
  createdAt: string;
};

export type MusicProviderType = 'spotify' | 'youtube';

export type MusicAccount = {
  id: number;
  device_id: number;
  provider: MusicProviderType;
  provider_user_id: string;
  display_name: string;
  created_at: string;
  updated_at: string;
};

export type MusicTrack = {
  id: number;
  device_id: number;
  provider: MusicProviderType;
  external_id: string;
  title: string;
  artist: string;
  album_name?: string;
  image_url?: string;
  synced_at: string;
};

export type TjSongFromServer = {
  id: number;
  tj_number: number;
  title: string;
  artist: string;
  has_mv: boolean;
  published_at: string;
};

export type MatchedTrackResult = {
  track: MusicTrack;
  song?: TjSongFromServer;
  match_score: number;
  status: 'matched' | 'unmatched';
};

export type SyncResult = {
  provider: MusicProviderType;
  tracks_found: number;
  tracks_matched: number;
};
