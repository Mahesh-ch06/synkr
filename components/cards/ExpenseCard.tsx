import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { Theme } from '../../constants/theme';
import { Expense, ExpenseCategoryIcons, ExpenseCategoryLabels } from '../../models/expense';
import { formatCurrency } from '../../utils/helpers';
import { CategoryColors } from '../../constants/colors';

interface ExpenseCardProps {
  expense: Expense;
  onPress?: () => void;
  onDelete?: () => void;
}

export const ExpenseCard: React.FC<ExpenseCardProps> = ({ expense, onPress, onDelete }) => {
  const { colors } = useTheme();
  const catColor = CategoryColors[expense.category] || colors.primary;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[styles.container, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
    >
      <View style={[styles.iconContainer, { backgroundColor: catColor + '15' }]}>
        <MaterialCommunityIcons
          name={(ExpenseCategoryIcons[expense.category] || 'cash') as any}
          size={22}
          color={catColor}
        />
      </View>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          {expense.title}
        </Text>
        <Text style={[styles.category, { color: colors.textTertiary }]}>
          {ExpenseCategoryLabels[expense.category]}
        </Text>
      </View>
      <Text style={[styles.amount, { color: colors.text }]}>
        -{formatCurrency(expense.amount)}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Theme.borderRadius.xl,
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.sm,
    borderWidth: 1,
    ...Theme.shadow.sm,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: Theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Theme.spacing.md,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: Theme.fontSize.md,
    fontWeight: Theme.fontWeight.semibold,
    marginBottom: 2,
  },
  category: {
    fontSize: Theme.fontSize.sm,
  },
  amount: {
    fontSize: Theme.fontSize.lg,
    fontWeight: Theme.fontWeight.bold,
  },
});
