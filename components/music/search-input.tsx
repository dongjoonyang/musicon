import type { Dispatch, SetStateAction } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { MusicTheme } from '@/constants/music-theme';

type SearchInputProps = {
  value: string;
  onChangeText: Dispatch<SetStateAction<string>>;
  onSearch?: () => void;
  loading?: boolean;
};

export function SearchInput({ value, onChangeText, onSearch, loading }: SearchInputProps) {
  return (
    <View style={styles.wrap}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSearch}
        returnKeyType="search"
        placeholder="TJ 번호, 가수 또는 곡명 검색"
        placeholderTextColor={MusicTheme.colors.textMuted}
        style={styles.input}
      />
      <Pressable
        onPress={onSearch}
        style={({ pressed }) => [styles.searchBtn, pressed && { opacity: 0.7 }]}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color={MusicTheme.colors.primary} />
        ) : (
          <MaterialCommunityIcons name="magnify" size={22} color={MusicTheme.colors.primary} />
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    height: 52,
    borderRadius: MusicTheme.radius.lg,
    borderWidth: 0,
    backgroundColor: MusicTheme.colors.surface,
    paddingLeft: 18,
    paddingRight: 6,
    flexDirection: 'row',
    alignItems: 'center',
    ...MusicTheme.shadow.card,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: MusicTheme.colors.text,
    fontWeight: '500',
  },
  searchBtn: {
    width: 42,
    height: 42,
    borderRadius: MusicTheme.radius.md,
    backgroundColor: MusicTheme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
