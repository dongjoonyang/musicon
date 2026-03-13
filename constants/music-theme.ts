/**
 * Music On 앱 전용 디자인 토큰
 */

import { Platform } from 'react-native';

export const MusicTheme = {
  colors: {
    primary: '#C71585',       // 미디엄 바이올렛 레드 (세련된 핑크)
    primaryLight: '#FCE4F0',
    primaryDark: '#9B0B50',
    surface: '#FFFFFF',
    surfaceAlt: '#FAF8FC',
    background: '#F5F2F8',
    border: '#E8E4ED',
    borderLight: '#EFECF2',
    text: '#1A1A1A',
    textSecondary: '#5C5C5C',
    textMuted: '#8E8E93',
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
      web: { boxShadow: '0px 2px 8px rgba(0,0,0,0.06)' },
      default: {
        shadowColor: '#1A1A1A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
      },
    }),
    button: Platform.select({
      web: { boxShadow: '0px 2px 4px rgba(199,21,133,0.2)' },
      default: {
        shadowColor: '#C71585',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 2,
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
