import type { TjSong } from '@/types/music';

const BASE_URL = 'http://158.179.160.120:7847';
const YOUTUBE_SEARCH_TEMPLATE = 'https://www.youtube.com/user/ziller/search?query={id}';

const fallbackSongs: TjSong[] = [
  {
    id: 'fallback-1',
    tjNumber: '98662',
    title: '봄날',
    artist: 'BTS',
    youtubeUrl: 'https://www.youtube.com/user/ziller/search?query=98662',
  },
  {
    id: 'fallback-2',
    tjNumber: '34555',
    title: '밤양갱',
    artist: '비비',
    youtubeUrl: 'https://www.youtube.com/user/ziller/search?query=34555',
  },
  {
    id: 'fallback-3',
    tjNumber: '23512',
    title: '달이 차오른다',
    artist: '장기하와 얼굴들',
    youtubeUrl: 'https://www.youtube.com/user/ziller/search?query=23512',
  },
];

type UnknownRecord = Record<string, unknown>;

function toRecord(value: unknown): UnknownRecord {
  if (value && typeof value === 'object') {
    return value as UnknownRecord;
  }
  return {};
}

function pickString(record: UnknownRecord, keys: string[]): string {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
    if (typeof value === 'number') {
      return String(value);
    }
  }
  return '';
}

function firstByKeyHint(record: UnknownRecord, hints: string[]): string {
  const loweredHints = hints.map((hint) => hint.toLowerCase());
  for (const [key, value] of Object.entries(record)) {
    const keyLower = key.toLowerCase();
    if (!loweredHints.some((hint) => keyLower.includes(hint))) {
      continue;
    }
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
    if (typeof value === 'number') {
      return String(value);
    }
  }
  return '';
}

function normalizeSong(raw: unknown): TjSong | null {
  const record = toRecord(raw);

  const tjNumber =
    pickString(record, [
      'tjNo',
      'tjNumber',
      'songNo',
      'songNumber',
      'songNum',
      'songId',
      'musicNo',
      'trackNo',
      'number',
      'no',
      'tj_no',
      'tj_number',
      '곡번호',
      '번호',
    ]) || firstByKeyHint(record, ['tj', 'songno', 'number', '곡번호', '번호']);
  const title =
    pickString(record, [
      'title',
      'songTitle',
      'songName',
      'musicTitle',
      'name',
      'subject',
      'song_name',
      '곡명',
      '제목',
    ]) || firstByKeyHint(record, ['title', 'song', 'music', '곡명', '제목']);
  const artist =
    pickString(record, [
      'artist',
      'artistName',
      'singer',
      'singerName',
      'vocal',
      'artist_name',
      '가수',
      '아티스트',
    ]) || firstByKeyHint(record, ['artist', 'singer', 'vocal', '가수', '아티스트']);

  if (!title || !artist) {
    return null;
  }

  const safeTj = tjNumber || '미확인';
  const id = pickString(record, ['id']) || `${safeTj}-${title}-${artist}`;
  const rawYoutubeUrl = pickString(record, ['youtubeUrl', 'youtube_url', 'youtube', 'ytUrl', 'yt_url']);
  const youtubeUrl = buildYoutubeUrl(rawYoutubeUrl, safeTj);

  return {
    id,
    tjNumber: safeTj,
    title,
    artist,
    youtubeUrl,
  };
}

function extractSongArray(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;

  const record = toRecord(payload);
  const directCandidates = ['data', 'items', 'results', 'songs', 'list'];

  for (const key of directCandidates) {
    const candidate = record[key];
    if (Array.isArray(candidate)) {
      return candidate;
    }

    if (candidate && typeof candidate === 'object') {
      const nested = toRecord(candidate);
      for (const nestedKey of ['items', 'results', 'songs', 'list']) {
        const nestedValue = nested[nestedKey];
        if (Array.isArray(nestedValue)) {
          return nestedValue;
        }
      }
    }
  }

  return [];
}

async function getJson(path: string): Promise<unknown> {
  const response = await fetch(`${BASE_URL}${path}`);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json();
}

function normalizeNo(value: string): string {
  return value.replace(/[^0-9]/g, '');
}

function buildYoutubeUrl(rawYoutubeUrl: string, tjNumber: string): string {
  const numericId = normalizeNo(tjNumber);
  const template = rawYoutubeUrl || YOUTUBE_SEARCH_TEMPLATE;

  if (template.includes('{id}')) {
    return template.replaceAll('{id}', numericId || tjNumber);
  }

  if (template.includes('{tjNumber}')) {
    return template.replaceAll('{tjNumber}', numericId || tjNumber);
  }

  return template;
}

export async function searchTjSongs(query: string): Promise<TjSong[]> {
  const keyword = query.trim();
  if (!keyword) return [];

  try {
    const payload = await getJson(`/api/songs/search?q=${encodeURIComponent(keyword)}`);
    const rows = extractSongArray(payload);
    const normalized = rows.map(normalizeSong).filter((song): song is TjSong => Boolean(song));

    if (normalized.length) {
      return normalized;
    }

    const single = normalizeSong(payload);
    if (single) {
      return [single];
    }
  } catch {
    // Keep fallback behavior so UI remains usable when API is unreachable.
  }

  const normalizedKeyword = normalizeNo(keyword);
  return fallbackSongs.filter((song) => {
    if (song.title.includes(keyword) || song.artist.includes(keyword)) {
      return true;
    }

    if (!normalizedKeyword) {
      return false;
    }

    return normalizeNo(song.tjNumber) === normalizedKeyword;
  });
}

export async function getSongByTjNumber(tjNumber: string): Promise<TjSong | null> {
  const normalizedNo = tjNumber.trim();
  if (!normalizedNo) return null;
  const normalizedDigits = normalizeNo(normalizedNo);
  if (!normalizedDigits) return null;

  const candidates = [
    `/api/songs/${encodeURIComponent(normalizedNo)}`,
    `/api/songs/tj/${encodeURIComponent(normalizedNo)}`,
    `/api/songs/detail/${encodeURIComponent(normalizedNo)}`,
    `/api/songs/by-number/${encodeURIComponent(normalizedNo)}`,
  ];

  for (const path of candidates) {
    try {
      const payload = await getJson(path);
      const byArray = extractSongArray(payload).map(normalizeSong).filter((song): song is TjSong => Boolean(song));
      if (byArray.length) {
        const exact = byArray.find((song) => {
          const candidateDigits = normalizeNo(song.tjNumber);
          return song.tjNumber === normalizedNo || (normalizedDigits && candidateDigits === normalizedDigits);
        });
        return exact ?? byArray[0];
      }

      const oneSong = normalizeSong(payload);
      if (oneSong) {
        const candidateDigits = normalizeNo(oneSong.tjNumber);
        if (oneSong.tjNumber === normalizedNo || (normalizedDigits && candidateDigits === normalizedDigits)) {
          return oneSong;
        }
      }
    } catch {
      // Try next candidate route.
    }
  }

  const fromSearch = await searchTjSongs(normalizedNo);
  return (
    fromSearch.find((song) => {
      const candidateDigits = normalizeNo(song.tjNumber);
      return song.tjNumber === normalizedNo || candidateDigits === normalizedDigits;
    }) ?? null
  );
}
