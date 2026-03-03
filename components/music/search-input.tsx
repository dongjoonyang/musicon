import type { Dispatch, SetStateAction } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

type SearchInputProps = {
  value: string;
  onChangeText: Dispatch<SetStateAction<string>>;
  buttonLabel?: string;
};

export function SearchInput({ value, onChangeText, buttonLabel = '검색' }: SearchInputProps) {
  return (
    <View style={styles.wrap}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="TJ 번호, 가수 또는 곡명을 입력"
        placeholderTextColor="#8A8A8A"
        style={styles.input}
      />
      <Text style={styles.buttonText}>{buttonLabel}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    minHeight: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#DCDCDC',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111111',
    paddingVertical: 8,
  },
  buttonText: {
    color: '#FF00FF',
    fontWeight: '700',
    fontSize: 14,
  },
});
