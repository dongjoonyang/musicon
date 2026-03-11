import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Platform, View } from 'react-native';

import { MusicTheme } from '@/constants/music-theme';

function TabIcon({ name, color }: { name: string; color: string; focused: boolean }) {
  return (
    <MaterialCommunityIcons
      name={name as keyof typeof MaterialCommunityIcons.glyphMap}
      size={22}
      color={color}
    />
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: MusicTheme.colors.primary,
        tabBarInactiveTintColor: MusicTheme.colors.textMuted,
        tabBarStyle: {
          height: Platform.OS === 'ios' ? 100 : Platform.OS === 'web' ? 80 : 72,
          paddingBottom: Platform.OS === 'ios' ? 32 : Platform.OS === 'web' ? 8 : 12,
          paddingTop: Platform.OS === 'web' ? 12 : 10,
          backgroundColor: MusicTheme.colors.surface,
          borderTopWidth: 1,
          borderTopColor: MusicTheme.colors.border,
          ...Platform.select({
            web: { boxShadow: '0px -1px 0px rgba(0,0,0,0.06)' },
            ios: {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -1 },
              shadowOpacity: 0.06,
              shadowRadius: 4,
            },
            default: { elevation: 6 },
          }),
        },
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontWeight: '600',
          fontSize: 11,
          marginTop: 2,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: '플레이리스트',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="playlist-music" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: '검색',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="magnify" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="my-music"
        options={{
          title: '내 음악',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="music-box-multiple" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="reservation"
        options={{
          title: '신곡 알림',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="bell-ring-outline" color={color} focused={focused} />
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
