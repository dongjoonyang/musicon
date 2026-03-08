import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';

import { MusicTheme } from '@/constants/music-theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: MusicTheme.colors.primary,
        tabBarInactiveTintColor: MusicTheme.colors.textMuted,
        tabBarStyle: {
          height: 72,
          paddingBottom: Platform.OS === 'ios' ? 20 : 8,
          paddingTop: 10,
          backgroundColor: MusicTheme.colors.surface,
          borderTopWidth: 1,
          borderTopColor: MusicTheme.colors.borderLight,
          ...Platform.select({
            web: { boxShadow: '0px -2px 8px rgba(0,0,0,0.04)' },
            ios: {
              shadowColor: '#1A1A1A',
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: 0.04,
              shadowRadius: 8,
            },
            default: { elevation: 8 },
          }),
        },
        tabBarLabelStyle: {
          fontWeight: '700',
          fontSize: 11,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: '플레이리스트',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="playlist-music" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: '검색',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="magnify" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="reservation"
        options={{
          title: '신곡 알림',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="bell-ring-outline" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
