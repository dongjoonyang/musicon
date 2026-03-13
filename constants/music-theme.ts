/**
 * Music On 앱 전용 디자인 토큰 — Toss Style
 */

import { Platform } from 'react-native';

export const MusicTheme = {
  colors: {
    // Primary — Toss Blue
    primary: '#0067EB',
    primaryLight: '#EAF2FF',
    primaryDark: '#0050BE',

    // Surfaces
    surface: '#FFFFFF',
    surfaceAlt: '#F8F9FA',
    background: '#F2F4F6',

    // Borders
    border: '#E5E8EB',
    borderLight: '#F2F4F6',

    // Typography
    text: '#191F28',
    textSecondary: '#6B7684',
    textMuted: '#8B95A1',

    // Misc
    white: '#FFFFFF',

    // Semantic
    success: '#00B852',
    successBg: '#EDFAF0',
    warning: '#FF6B00',
    warningBg: '#FFF5ED',
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
      web: { boxShadow: '0px 2px 8px rgba(0,0,0,0.06)' },
      default: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
      },
    }),
    button: Platform.select({
      web: { boxShadow: '0px 4px 12px rgba(0,103,235,0.22)' },
      default: {
        shadowColor: '#0067EB',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.22,
        shadowRadius: 12,
        elevation: 4,
      },
    }),
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 20,
    xl: 24,
  },
} as const;
