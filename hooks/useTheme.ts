import { useColorScheme } from 'react-native';
import { Colors, ThemeColors } from '../constants/colors';
import { useSettingsStore } from '../store/settingsStore';

export function useTheme(): {
  colors: ThemeColors;
  isDark: boolean;
  colorScheme: 'light' | 'dark';
} {
  const systemScheme = useColorScheme();
  const themePreference = useSettingsStore((s) => s.themeMode);

  const colorScheme =
    themePreference === 'system'
      ? (systemScheme ?? 'dark')
      : themePreference;

  return {
    colors: Colors[colorScheme],
    isDark: colorScheme === 'dark',
    colorScheme,
  };
}
