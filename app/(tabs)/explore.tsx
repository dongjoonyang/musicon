import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { MusicTheme } from '@/constants/music-theme';
import { AppScreen } from '@/components/music/app-screen';

export default function ExploreScreen() {
  return (
    <AppScreen>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Explore</Text>
        <Text style={styles.paragraph}>
          Welcome to the explore section. Here you can find new and exciting content.
        </Text>
        {/* Add more content here as needed, using MusicTheme for styling */}
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: MusicTheme.spacing.lg,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: MusicTheme.colors.text,
    marginBottom: MusicTheme.spacing.md,
  },
  paragraph: {
    fontSize: 16,
    color: MusicTheme.colors.textSecondary,
    lineHeight: 24,
  },
});
