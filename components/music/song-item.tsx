import { StyleSheet, Text, View } from 'react-native';

type SongItemProps = {
  title: string;
  artist?: string;
  trailing?: string;
  highlight?: boolean;
};

export function SongItem({ title, artist, trailing, highlight = false }: SongItemProps) {
  return (
    <View style={styles.row}>
      <View style={styles.textWrap}>
        <Text style={[styles.title, highlight && styles.highlightTitle]} numberOfLines={1}>
          {title}
        </Text>
        {artist ? <Text style={styles.artist}>{artist}</Text> : null}
      </View>
      {trailing ? <Text style={styles.trailing}>{trailing}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 52,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  textWrap: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    color: '#111111',
    fontSize: 17,
    fontWeight: '700',
  },
  highlightTitle: {
    color: '#FF00FF',
  },
  artist: {
    marginTop: 4,
    color: '#333333',
    fontSize: 14,
  },
  trailing: {
    color: '#111111',
    fontSize: 13,
    fontWeight: '600',
  },
});
