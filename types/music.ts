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
