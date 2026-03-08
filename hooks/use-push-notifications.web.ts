/**
 * 웹에서는 expo-notifications를 사용하지 않음 (localStorage 오류 방지)
 */
export function usePushNotifications() {
  return { expoPushToken: null };
}
