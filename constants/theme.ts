import { Dimensions, Platform, StyleSheet } from 'react-native';

const { width, height } = Dimensions.get('window');

export const Theme = {
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    '3xl': 32,
    '4xl': 40,
    '5xl': 48,
  },
  borderRadius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    '3xl': 32,
    full: 9999,
  },
  fontSize: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    '2xl': 20,
    '3xl': 24,
    '4xl': 28,
    '5xl': 32,
    '6xl': 40,
  },
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
  // Shadows are now simple objects per-platform to avoid Fabric casting issues
  shadow: {
    sm: Platform.OS === 'android'
      ? { elevation: 2 }
      : Platform.OS === 'ios'
        ? { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 }
        : {},
    md: Platform.OS === 'android'
      ? { elevation: 6 }
      : Platform.OS === 'ios'
        ? { shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 12 }
        : {},
    lg: Platform.OS === 'android'
      ? { elevation: 12 }
      : Platform.OS === 'ios'
        ? { shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.12, shadowRadius: 20 }
        : {},
    xl: Platform.OS === 'android'
      ? { elevation: 20 }
      : Platform.OS === 'ios'
        ? { shadowColor: '#000', shadowOffset: { width: 0, height: 16 }, shadowOpacity: 0.18, shadowRadius: 36 }
        : {},
  },
  screen: {
    width,
    height,
    isSmall: width < 375,
  },
  animation: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
};
