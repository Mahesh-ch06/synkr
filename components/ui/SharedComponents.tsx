import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ViewStyle, Switch, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { Theme } from '../../constants/theme';
import { LinearGradient } from 'expo-linear-gradient';

// ─── Header ───────────────────────────────────────────────
interface HeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightIcon?: string;
  onRightPress?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle, showBack, onBack, rightIcon, onRightPress }) => {
  const { colors } = useTheme();

  return (
    <View style={styles.headerContainer}>
      <View style={styles.headerLeft}>
        {showBack && (
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
          </TouchableOpacity>
        )}
        <View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{title}</Text>
          {subtitle && (
            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
          )}
        </View>
      </View>
      {rightIcon && onRightPress && (
        <TouchableOpacity onPress={onRightPress} style={[styles.iconButton, { backgroundColor: colors.surfaceElevated }]}>
          <MaterialCommunityIcons name={rightIcon as any} size={22} color={colors.text} />
        </TouchableOpacity>
      )}
    </View>
  );
};

// ─── FAB ──────────────────────────────────────────────────
interface FABProps {
  onPress: () => void;
  icon?: string;
}

export const FAB: React.FC<FABProps> = ({ onPress, icon = 'plus' }) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={styles.fabContainer}>
      <LinearGradient
        colors={colors.gradient as [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.fab}
      >
        <MaterialCommunityIcons name={icon as any} size={28} color="#FFFFFF" />
      </LinearGradient>
    </TouchableOpacity>
  );
};

// ─── Input Field ──────────────────────────────────────────
interface InputFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
  icon?: string;
  multiline?: boolean;
  prefix?: string;
  style?: ViewStyle;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  icon,
  multiline = false,
  prefix,
  style,
}) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.inputContainer, style]}>
      <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>{label}</Text>
      <View style={[styles.inputWrapper, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
        {icon && (
          <MaterialCommunityIcons name={icon as any} size={20} color={colors.textTertiary} style={styles.inputIcon} />
        )}
        {prefix && (
          <Text style={[styles.inputPrefix, { color: colors.text }]}>{prefix}</Text>
        )}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textTertiary}
          keyboardType={keyboardType}
          multiline={multiline}
          style={[
            styles.input,
            { color: colors.text },
            multiline ? { height: 80, textAlignVertical: 'top' as const } : undefined,
          ]}
        />
      </View>
    </View>
  );
};

// ─── Section Header ───────────────────────────────────────
interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, actionLabel, onAction }) => {
  const { colors } = useTheme();

  return (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
      {actionLabel && onAction && (
        <TouchableOpacity onPress={onAction}>
          <Text style={[styles.sectionAction, { color: colors.primary }]}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// ─── Chip ─────────────────────────────────────────────────
interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  color?: string;
}

export const Chip: React.FC<ChipProps> = ({ label, selected, onPress, color }) => {
  const { colors } = useTheme();
  const chipColor = color || colors.primary;

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: selected ? chipColor + '20' : colors.surfaceElevated,
          borderColor: selected ? chipColor : colors.border,
        },
      ]}
    >
      <Text style={[styles.chipText, { color: selected ? chipColor : colors.textSecondary }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

// ─── Empty State ──────────────────────────────────────────
interface EmptyStateProps {
  icon: string;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, message, actionLabel, onAction }) => {
  const { colors } = useTheme();

  return (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons name={icon as any} size={64} color={colors.textTertiary} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.emptyMessage, { color: colors.textSecondary }]}>{message}</Text>
      {actionLabel && onAction && (
        <TouchableOpacity
          onPress={onAction}
          style={[styles.emptyAction, { backgroundColor: colors.primary }]}
        >
          <Text style={styles.emptyActionText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// ─── Toggle Row ───────────────────────────────────────────
interface ToggleRowProps {
  label: string;
  description?: string;
  icon?: string;
  value: boolean;
  onToggle: () => void;
}

export const ToggleRow: React.FC<ToggleRowProps> = ({ label, description, icon, value, onToggle }) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.toggleRow, { borderBottomColor: colors.borderLight }]}>
      {icon && (
        <View style={[styles.toggleIcon, { backgroundColor: colors.surfaceElevated }]}>
          <MaterialCommunityIcons name={icon as any} size={20} color={colors.primary} />
        </View>
      )}
      <View style={styles.toggleContent}>
        <Text style={[styles.toggleLabel, { color: colors.text }]}>{label}</Text>
        {description && (
          <Text style={[styles.toggleDesc, { color: colors.textTertiary }]}>{description}</Text>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={() => onToggle()}
        trackColor={{ false: colors.border, true: colors.primary + '80' }}
        thumbColor={value ? colors.primary : '#F4F3F4'}
        ios_backgroundColor={colors.border}
      />
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────
const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.xl,
    paddingTop: Theme.spacing.sm,
    paddingBottom: Theme.spacing.lg,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: Theme.fontSize['3xl'],
    fontWeight: Theme.fontWeight.bold,
  },
  headerSubtitle: {
    fontSize: Theme.fontSize.md,
    marginTop: 2,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: Theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabContainer: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    ...Theme.shadow.xl,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: Theme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputContainer: {
    marginBottom: Theme.spacing.xl,
  },
  inputLabel: {
    fontSize: Theme.fontSize.sm,
    fontWeight: Theme.fontWeight.semibold,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Theme.borderRadius.xl,
    borderWidth: 1,
    paddingHorizontal: Theme.spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 10,
  },
  inputPrefix: {
    fontSize: Theme.fontSize.xl,
    fontWeight: Theme.fontWeight.bold,
    marginRight: 6,
  },
  input: {
    flex: 1,
    fontSize: Theme.fontSize.lg,
    paddingVertical: Theme.spacing.lg,
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.xl,
    marginTop: Theme.spacing['3xl'],
    marginBottom: Theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: Theme.fontSize.xl,
    fontWeight: Theme.fontWeight.bold,
  },
  sectionAction: {
    fontSize: Theme.fontSize.md,
    fontWeight: Theme.fontWeight.semibold,
  },
  chip: {
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.full,
    borderWidth: 1,
    marginRight: Theme.spacing.sm,
  },
  chipText: {
    fontSize: Theme.fontSize.sm,
    fontWeight: Theme.fontWeight.semibold,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Theme.spacing['5xl'],
    paddingHorizontal: Theme.spacing['3xl'],
  },
  emptyTitle: {
    fontSize: Theme.fontSize.xl,
    fontWeight: Theme.fontWeight.bold,
    marginTop: Theme.spacing.lg,
  },
  emptyMessage: {
    fontSize: Theme.fontSize.md,
    textAlign: 'center',
    marginTop: Theme.spacing.sm,
    lineHeight: 22,
  },
  emptyAction: {
    marginTop: Theme.spacing.xl,
    paddingHorizontal: Theme.spacing['2xl'],
    paddingVertical: Theme.spacing.md,
    borderRadius: Theme.borderRadius.full,
  },
  emptyActionText: {
    color: '#FFFFFF',
    fontWeight: Theme.fontWeight.semibold,
    fontSize: Theme.fontSize.md,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Theme.spacing.lg,
    paddingHorizontal: Theme.spacing.xl,
    borderBottomWidth: 1,
  },
  toggleIcon: {
    width: 36,
    height: 36,
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Theme.spacing.md,
  },
  toggleContent: {
    flex: 1,
  },
  toggleLabel: {
    fontSize: Theme.fontSize.lg,
    fontWeight: Theme.fontWeight.medium,
  },
  toggleDesc: {
    fontSize: Theme.fontSize.sm,
    marginTop: 2,
  },
});
