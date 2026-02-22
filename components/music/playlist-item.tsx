import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type PlaylistItemProps = {
  title: string;
  songCount: number;
  active?: boolean;
  onPress?: () => void;
};

export function PlaylistItem({ title, songCount, active = false, onPress }: PlaylistItemProps) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <View style={styles.leading}>
        <MaterialCommunityIcons name="playlist-music" size={22} color={active ? '#FF00FF' : '#333333'} />
        <Text style={[styles.title, active && styles.activeTitle]}>{title}</Text>
      </View>
      <Text style={styles.count}>({songCount}곡)</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 56,
    borderBottomWidth: 1,
    borderBottomColor: '#D9D9D9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  pressed: {
    backgroundColor: '#F7F7F7',
  },
  leading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    color: '#111111',
    fontWeight: '600',
    fontSize: 16,
  },
  activeTitle: {
    color: '#FF00FF',
  },
  count: {
    color: '#111111',
    fontWeight: '700',
    fontSize: 15,
  },
});
