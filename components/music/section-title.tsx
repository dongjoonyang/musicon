import { StyleSheet, Text, View, type ViewStyle } from 'react-native';

type SectionTitleProps = {
  title: string;
  rightText?: string;
  style?: ViewStyle;
};

export function SectionTitle({ title, rightText, style }: SectionTitleProps) {
  return (
    <View style={[styles.row, style]}>
      <Text style={styles.title}>{title}</Text>
      {rightText ? <Text style={styles.right}>{rightText}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    color: '#111111',
    fontSize: 38,
    fontWeight: '900',
  },
  right: {
    color: '#111111',
    fontSize: 20,
    fontWeight: '700',
  },
});
