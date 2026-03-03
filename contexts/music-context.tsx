import { createContext, useContext, useMemo, useState, type PropsWithChildren } from 'react';

import type { Playlist, ReservationRequest, TjSong } from '@/types/music';

type MusicContextValue = {
  playlists: Playlist[];
  reservationRequests: ReservationRequest[];
  createPlaylist: (name: string) => void;
  addSongToPlaylist: (song: TjSong, playlistId?: string) => void;
  removeSongFromPlaylist: (playlistId: string, songId: string) => void;
  addSongToReservation: (song: TjSong) => void;
  addReservationRequest: (payload: { artist: string; title: string }) => void;
  updateReservationRequest: (requestId: string, payload: { artist: string; title: string }) => void;
  removeReservationRequest: (requestId: string) => void;
};

const MusicContext = createContext<MusicContextValue | null>(null);

const initialPlaylists: Playlist[] = [
  {
    id: 'default-playlist',
    name: '내 TJ 플레이리스트',
    songs: [],
  },
];

export function MusicProvider({ children }: PropsWithChildren) {
  const [playlists, setPlaylists] = useState<Playlist[]>(initialPlaylists);
  const [reservationRequests, setReservationRequests] = useState<ReservationRequest[]>([]);

  const createPlaylist = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;

    setPlaylists((prev) => {
      if (prev.some((playlist) => playlist.name.toLowerCase() === trimmed.toLowerCase())) {
        return prev;
      }

      return [
        ...prev,
        {
          id: `playlist-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          name: trimmed,
          songs: [],
        },
      ];
    });
  };

  const addSongToPlaylist = (song: TjSong, playlistId?: string) => {
    setPlaylists((prev) => {
      const targetId = playlistId ?? prev[0]?.id;
      if (!targetId) return prev;

      return prev.map((playlist) => {
        if (playlist.id !== targetId) return playlist;
        if (playlist.songs.some((item) => item.tjNumber === song.tjNumber)) return playlist;

        return {
          ...playlist,
          songs: [song, ...playlist.songs],
        };
      });
    });
  };

  const removeSongFromPlaylist = (playlistId: string, songId: string) => {
    setPlaylists((prev) =>
      prev.map((playlist) => {
        if (playlist.id !== playlistId) return playlist;

        return {
          ...playlist,
          songs: playlist.songs.filter((song) => song.id !== songId),
        };
      })
    );
  };

  const addSongToReservation = (song: TjSong) => {
    setReservationRequests((prev) => {
      const artist = song.artist.trim();
      const title = song.title.trim();
      if (!artist || !title) {
        return prev;
      }

      if (prev.some((item) => item.artist.toLowerCase() === artist.toLowerCase() && item.title.toLowerCase() === title.toLowerCase())) {
        return prev;
      }

      return [
        {
          id: `reservation-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          artist,
          title,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ];
    });
  };

  const addReservationRequest = (payload: { artist: string; title: string }) => {
    const artist = payload.artist.trim();
    const title = payload.title.trim();
    if (!artist || !title) return;

    setReservationRequests((prev) => {
      if (prev.some((item) => item.artist.toLowerCase() === artist.toLowerCase() && item.title.toLowerCase() === title.toLowerCase())) {
        return prev;
      }

      return [
        {
          id: `reservation-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          artist,
          title,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ];
    });
  };

  const updateReservationRequest = (requestId: string, payload: { artist: string; title: string }) => {
    const artist = payload.artist.trim();
    const title = payload.title.trim();
    if (!artist || !title) return;

    setReservationRequests((prev) =>
      prev.map((item) => {
        if (item.id !== requestId) return item;
        return { ...item, artist, title };
      })
    );
  };

  const removeReservationRequest = (requestId: string) => {
    setReservationRequests((prev) => prev.filter((item) => item.id !== requestId));
  };

  const value = useMemo<MusicContextValue>(
    () => ({
      playlists,
      reservationRequests,
      createPlaylist,
      addSongToPlaylist,
      removeSongFromPlaylist,
      addSongToReservation,
      addReservationRequest,
      updateReservationRequest,
      removeReservationRequest,
    }),
    [playlists, reservationRequests]
  );

  return <MusicContext.Provider value={value}>{children}</MusicContext.Provider>;
}

export function useMusic() {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error('useMusic must be used within MusicProvider');
  }

  return context;
}
