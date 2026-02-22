import type { Dispatch, SetStateAction } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

type LabeledInputProps = {
  label: string;
  value: string;
  onChangeText: Dispatch<SetStateAction<string>>;
  placeholder: string;
};

export function LabeledInput({ label, value, onChangeText, placeholder }: LabeledInputProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#555555"
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },
  label: {
    width: 84,
    color: '#111111',
    fontSize: 17,
    fontWeight: '700',
  },
  input: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#6B6B6B',
    color: '#111111',
    fontSize: 16,
    paddingVertical: 8,
  },
});
