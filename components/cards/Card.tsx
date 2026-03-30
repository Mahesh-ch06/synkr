import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle, StyleProp } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { Theme } from '../../constants/theme';
import { LinearGradient } from 'expo-linear-gradient';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  gradient?: boolean;
  gradientColors?: string[];
}

export const Card: React.FC<CardProps> = ({ children, style, onPress, gradient, gradientColors }) => {
  const { colors } = useTheme();

  const content = gradient ? (
    <LinearGradient
      colors={(gradientColors || colors.gradient) as [string, string]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.card, { borderColor: 'transparent' }, style]}
    >
      {children}
    </LinearGradient>
  ) : (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }, style]}>
      {children}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: string;
  iconColor: string;
  onPress?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon, iconColor, onPress }) => {
  const { colors } = useTheme();

  return (
    <Card onPress={onPress} style={styles.statCard}>
      <View style={[styles.iconContainer, { backgroundColor: iconColor + '20' }]}>
        <MaterialCommunityIcons name={icon as any} size={22} color={iconColor} />
      </View>
      <Text style={[styles.statTitle, { color: colors.textSecondary }]}>{title}</Text>
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      {subtitle && (
        <Text style={[styles.statSubtitle, { color: colors.textTertiary }]}>{subtitle}</Text>
      )}
    </Card>
  );
};

interface AlertCardProps {
  title: string;
  message: string;
  icon: string;
  color: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const AlertCard: React.FC<AlertCardProps> = ({ title, message, icon, color, actionLabel, onAction }) => {
  const { colors } = useTheme();

  return (
    <Card style={{ ...styles.alertCard, borderLeftColor: color, borderLeftWidth: 3 }}>
      <View style={styles.alertHeader}>
        <View style={[styles.alertIconContainer, { backgroundColor: color + '20' }]}>
          <MaterialCommunityIcons name={icon as any} size={20} color={color} />
        </View>
        <View style={styles.alertContent}>
          <Text style={[styles.alertTitle, { color: colors.text }]} numberOfLines={1}>{title}</Text>
          <Text style={[styles.alertMessage, { color: colors.textSecondary }]} numberOfLines={2}>{message}</Text>
        </View>
      </View>
      {actionLabel && onAction && (
        <TouchableOpacity
          onPress={onAction}
          style={[styles.alertAction, { backgroundColor: color + '15' }]}
        >
          <Text style={[styles.alertActionText, { color }]}>{actionLabel}</Text>
          <MaterialCommunityIcons name="chevron-right" size={16} color={color} />
        </TouchableOpacity>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: Theme.borderRadius.xl,
    padding: Theme.spacing.lg,
    borderWidth: 1,
    ...Theme.shadow.md,
  },
  statCard: {
    flex: 1,
    minWidth: 140,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Theme.spacing.sm,
  },
  statTitle: {
    fontSize: Theme.fontSize.sm,
    fontWeight: Theme.fontWeight.medium,
    marginBottom: 2,
  },
  statValue: {
    fontSize: Theme.fontSize['2xl'],
    fontWeight: Theme.fontWeight.bold,
  },
  statSubtitle: {
    fontSize: Theme.fontSize.xs,
    marginTop: 2,
  },
  alertCard: {
    marginBottom: Theme.spacing.sm,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertIconContainer: {
    width: 36,
    height: 36,
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Theme.spacing.md,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: Theme.fontSize.md,
    fontWeight: Theme.fontWeight.semibold,
    marginBottom: 2,
  },
  alertMessage: {
    fontSize: Theme.fontSize.sm,
    lineHeight: 18,
  },
  alertAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    marginTop: Theme.spacing.md,
  },
  alertActionText: {
    fontSize: Theme.fontSize.sm,
    fontWeight: Theme.fontWeight.semibold,
    marginRight: 4,
  },
});
