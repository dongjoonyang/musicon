import { request } from './api';

type Device = {
  id: number;
  expo_push_token: string;
  platform: string;
  created_at: string;
};

export async function registerDevice(token: string, platform: string) {
  return request<Device>('/api/devices/register', {
    method: 'POST',
    body: JSON.stringify({ expo_push_token: token, platform }),
  });
}
