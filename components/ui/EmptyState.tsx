import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../hooks/useTheme';
import { Theme } from '../../constants/theme';

interface EmptyStateProps {
  icon: string;
  title: string;
  subtitle: string;
  actionLabel?: string;
  onAction?: () => void;
  iconColor?: string;
}

export function EmptyState({ icon, title, subtitle, actionLabel, onAction, iconColor }: EmptyStateProps) {
  const { colors, isDark } = useTheme();
  const color = iconColor || colors.primary;

  return (
    <View style={styles.container}>
      {/* Icon Circle */}
      <View style={[styles.iconOuter, { backgroundColor: color + '10' }]}>
        <View style={[styles.iconInner, { backgroundColor: color + '20' }]}>
          <MaterialCommunityIcons name={icon as any} size={48} color={color} />
        </View>
      </View>

      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text>

      {actionLabel && onAction && (
        <TouchableOpacity activeOpacity={0.8} onPress={onAction} style={styles.actionWrapper}>
          <LinearGradient
            colors={[color, color + 'CC']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.actionBtn}
          >
            <MaterialCommunityIcons name="plus" size={18} color="#FFF" />
            <Text style={styles.actionText}>{actionLabel}</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: Theme.spacing['4xl'],
    paddingHorizontal: Theme.spacing.xl,
  },
  iconOuter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Theme.spacing.xl,
  },
  iconInner: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: Theme.fontSize['2xl'],
    fontWeight: Theme.fontWeight.bold,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: Theme.fontSize.md,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
    marginBottom: Theme.spacing.xl,
  },
  actionWrapper: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.xl,
    borderRadius: Theme.borderRadius.full,
    gap: 8,
  },
  actionText: {
    color: '#FFF',
    fontSize: Theme.fontSize.md,
    fontWeight: Theme.fontWeight.bold,
  },
});
