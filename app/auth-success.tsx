import { useEffect } from 'react';
import { Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function AuthSuccessScreen() {
  const router = useRouter();
  const { provider, name } = useLocalSearchParams<{ provider: string; name: string }>();

  useEffect(() => {
    const label = provider === 'youtube' ? 'YouTube' : provider === 'spotify' ? 'Spotify' : provider;
    Alert.alert('연결 완료', `${label} 계정이 연결되었습니다.${name ? ` (${name})` : ''}`);
    router.replace('/(tabs)/my-music');
  }, [provider, name, router]);

  return null;
}
