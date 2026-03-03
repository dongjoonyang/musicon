export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  meta?: {
    count?: number;
    query?: string;
    limit?: number;
    offset?: number;
  };
};

const DEV_URL = 'http://192.168.45.45:3000';
const PROD_URL = 'http://158.179.160.120:7847';

export const API_BASE_URL = __DEV__ ? DEV_URL : PROD_URL;

export async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${path}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) ?? {}),
  };

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    return {
      success: false,
      error: body?.error ?? `HTTP ${response.status}`,
    };
  }

  return response.json();
}
