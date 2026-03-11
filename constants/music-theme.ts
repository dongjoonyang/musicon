/**
 * Music On 앱 전용 디자인 토큰
 */

import { Platform } from 'react-native';

export const MusicTheme = {
  colors: {
    primary: '#FF4081',       // Vibrant Pink
    primaryLight: '#FFD1E0',  // Light Pink
    primaryDark: '#C5004A',   // Deep Pink
    surface: '#FFFFFF',
    surfaceAlt: '#F8F8FA',    // Softer alternative surface
    background: '#F0F2F5',    // Softer, cooler background
    border: '#E0E0E0',        // Lighter, softer border
    borderLight: '#F0F0F0',
    text: '#212121',          // Darker for better contrast
    textSecondary: '#616161', // Good contrast, still secondary
    textMuted: '#9E9E9E',     // Softer muted text
    white: '#FFFFFF',
    success: '#00796B',
    successBg: '#E0F2F1',
    warning: '#CE007D',
    warningBg: '#FFF4FB',
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    full: 999,
  },
  shadow: {
    card: Platform.select({
      web: { boxShadow: '0px 4px 12px rgba(0,0,0,0.08)' },
      default: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 6,
      },
    }),
    button: Platform.select({
      web: { boxShadow: '0px 4px 8px rgba(255,64,129,0.25)' }, // Using new primary color
      default: {
        shadowColor: '#FF4081', // Using new primary color
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 4,
      },
    }),
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
  },
} as const;
