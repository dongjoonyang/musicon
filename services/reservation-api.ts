import { request, type ApiResponse } from './api';

export type Reservation = {
  id: number;
  device_id: number;
  artist: string;
  title: string;
  status: string;
  matched_song_id?: number | null;
  notified_at?: string | null;
  created_at: string;
  updated_at: string;
};

export async function createReservation(
  token: string,
  artist: string,
  title: string,
): Promise<ApiResponse<Reservation>> {
  return request<Reservation>('/api/reservations', {
    method: 'POST',
    body: JSON.stringify({ expo_push_token: token, artist, title }),
  });
}

export async function listReservations(
  token: string,
): Promise<ApiResponse<Reservation[]>> {
  return request<Reservation[]>(`/api/reservations?token=${encodeURIComponent(token)}`);
}

export async function updateReservation(
  token: string,
  id: number,
  artist: string,
  title: string,
): Promise<ApiResponse<Reservation>> {
  return request<Reservation>(`/api/reservations/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ expo_push_token: token, artist, title }),
  });
}

export async function deleteReservation(
  token: string,
  id: number,
): Promise<ApiResponse<null>> {
  return request<null>(
    `/api/reservations/${id}?token=${encodeURIComponent(token)}`,
    { method: 'DELETE' },
  );
}
