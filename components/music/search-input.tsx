import type { Dispatch, SetStateAction } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { MusicTheme } from '@/constants/music-theme';

type SearchInputProps = {
  value: string;
  onChangeText: Dispatch<SetStateAction<string>>;
  buttonLabel?: string;
};

export function SearchInput({ value, onChangeText }: SearchInputProps) {
  return (
    <View style={styles.wrap}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="TJ 번호, 가수 또는 곡명을 입력"
        placeholderTextColor={MusicTheme.colors.textMuted}
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    minHeight: 50,
    borderRadius: MusicTheme.radius.full,
    borderWidth: 1.5,
    borderColor: MusicTheme.colors.border,
    backgroundColor: MusicTheme.colors.surface,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: MusicTheme.colors.text,
    paddingVertical: 12,
  },
});
