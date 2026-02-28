import { createContext, useContext, useMemo, useState, type PropsWithChildren } from 'react';

import type { Playlist, TjSong } from '@/types/music';

type MusicContextValue = {
  playlists: Playlist[];
  reservationSongs: TjSong[];
  createPlaylist: (name: string) => void;
  addSongToPlaylist: (song: TjSong, playlistId?: string) => void;
  removeSongFromPlaylist: (playlistId: string, songId: string) => void;
  addSongToReservation: (song: TjSong) => void;
  removeSongFromReservation: (songId: string) => void;
  moveReservationSong: (songId: string, direction: 'up' | 'down') => void;
  reorderReservationSong: (fromIndex: number, toIndex: number) => void;
  clearReservations: () => void;
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
  const [reservationSongs, setReservationSongs] = useState<TjSong[]>([]);

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
    setReservationSongs((prev) => {
      if (prev.some((item) => item.tjNumber === song.tjNumber)) {
        return prev;
      }

      return [...prev, song];
    });
  };

  const removeSongFromReservation = (songId: string) => {
    setReservationSongs((prev) => prev.filter((song) => song.id !== songId));
  };

  const moveReservationSong = (songId: string, direction: 'up' | 'down') => {
    setReservationSongs((prev) => {
      const index = prev.findIndex((song) => song.id === songId);
      if (index < 0) return prev;

      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) {
        return prev;
      }

      const next = [...prev];
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      return next;
    });
  };

  const reorderReservationSong = (fromIndex: number, toIndex: number) => {
    setReservationSongs((prev) => {
      if (fromIndex === toIndex) return prev;
      if (fromIndex < 0 || fromIndex >= prev.length) return prev;
      if (toIndex < 0 || toIndex >= prev.length) return prev;

      const next = [...prev];
      const [item] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, item);
      return next;
    });
  };

  const clearReservations = () => {
    setReservationSongs([]);
  };

  const value = useMemo<MusicContextValue>(
    () => ({
      playlists,
      reservationSongs,
      createPlaylist,
      addSongToPlaylist,
      removeSongFromPlaylist,
      addSongToReservation,
      removeSongFromReservation,
      moveReservationSong,
      reorderReservationSong,
      clearReservations,
    }),
    [playlists, reservationSongs]
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
