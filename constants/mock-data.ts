export type PlaylistGroup = {
  id: string;
  title: string;
  songCount: number;
  isFavorite?: boolean;
};

export type FavoriteSong = {
  id: string;
  title: string;
  artist: string;
  memo?: string;
};

export type SearchSong = {
  id: string;
  title: string;
  artist: string;
};

export type ReservationSong = {
  id: string;
  title: string;
  artist: string;
};

export const playlistGroups: PlaylistGroup[] = [
  { id: 'favorite', title: '즐겨찾는 노래', songCount: 6, isFavorite: true },
  { id: 'company', title: '회식때 부르기 좋은곡', songCount: 111 },
  { id: 'labor', title: '노동요', songCount: 999 },
  { id: 'giri', title: '기리보이', songCount: 2000 },
  { id: 'vinzino', title: '빈지노', songCount: 300 },
];

export const favoriteSongsByGroupId: Record<string, FavoriteSong[]> = {
  favorite: [
    {
      id: 'fav-1',
      title: '나는 반딧불',
      artist: 'TJ노래방 나는 반딧불 유튜브',
      memo: '자허쳔센! 집에서도 켜서 연습한다',
    },
    { id: 'fav-2', title: 'Feel my soul', artist: 'YUI' },
    { id: 'fav-3', title: 'Mellow', artist: '백예린' },
    { id: 'fav-4', title: '아무노래', artist: '지코' },
  ],
  company: [{ id: 'company-1', title: '달이 차오른다', artist: '장기하 곡1' }],
  labor: [{ id: 'labor-1', title: '밤양갱', artist: '장기하 곡2' }],
  giri: [{ id: 'giri-1', title: '우리서로사랑하지는말자', artist: '기리보이' }],
  vinzino: [{ id: 'vinzino-1', title: 'Aqua Man', artist: '빈지노' }],
};

export const searchSongs: SearchSong[] = [
  { id: 's-1', title: '장기하 곡1', artist: '장기하' },
  { id: 's-2', title: '장기하 곡2', artist: '장기하' },
  { id: 's-3', title: '달이 차오른다', artist: '장기하' },
  { id: 's-4', title: '나는 반딧불', artist: '장기하' },
];

export const reservationSongs: ReservationSong[] = [
  { id: 'r-1', title: '달이 차오른다', artist: '장기하 곡1' },
  { id: 'r-2', title: '밤양갱', artist: '장기하 곡2' },
];
