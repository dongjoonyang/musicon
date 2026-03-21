import { useEffect } from 'react';
import { Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function AuthErrorScreen() {
  const router = useRouter();
  const { provider, error } = useLocalSearchParams<{ provider: string; error: string }>();

  useEffect(() => {
    const label = provider === 'youtube' ? 'YouTube' : provider === 'spotify' ? 'Spotify' : provider;
    Alert.alert('연결 실패', error || `${label} 연결에 실패했습니다.`);
    router.replace('/(tabs)/my-music');
  }, [provider, error, router]);

  return null;
}
