import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { Theme } from '../../constants/theme';
import { Bill, BillCategoryIcons } from '../../models/bill';
import { formatCurrency, getDaysUntil, getDaysLabel, getStatusColor } from '../../utils/helpers';

interface BillCardProps {
  bill: Bill;
  onPress?: () => void;
  onMarkPaid?: () => void;
}

export const BillCard: React.FC<BillCardProps> = ({ bill, onPress, onMarkPaid }) => {
  const { colors } = useTheme();
  const daysUntil = getDaysUntil(bill.dueDate);
  const statusColor = getStatusColor(daysUntil, colors);

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderColor: colors.cardBorder,
          borderLeftColor: statusColor,
          borderLeftWidth: 3,
        },
      ]}
    >
      <View style={styles.row}>
        <View style={[styles.iconContainer, { backgroundColor: statusColor + '15' }]}>
          <MaterialCommunityIcons
            name={(BillCategoryIcons[bill.category] || 'receipt') as any}
            size={22}
            color={statusColor}
          />
        </View>
        <View style={styles.content}>
          <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
            {bill.name}
          </Text>
          <View style={styles.metaRow}>
            <Text style={[styles.dueLabel, { color: statusColor }]}>
              {bill.status === 'paid' ? '✓ Paid' : getDaysLabel(daysUntil)}
            </Text>
            {bill.isAutopay && (
              <View style={[styles.badge, { backgroundColor: colors.success + '20' }]}>
                <Text style={[styles.badgeText, { color: colors.success }]}>Autopay</Text>
              </View>
            )}
          </View>
        </View>
        <View style={styles.amountSection}>
          <Text style={[styles.amount, { color: colors.text }]}>
            {formatCurrency(bill.amount)}
          </Text>
          {bill.status !== 'paid' && onMarkPaid && (
            <TouchableOpacity
              onPress={onMarkPaid}
              style={[styles.payButton, { backgroundColor: colors.success + '15' }]}
            >
              <MaterialCommunityIcons name="check" size={16} color={colors.success} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: Theme.borderRadius.xl,
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.sm,
    borderWidth: 1,
    ...Theme.shadow.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
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
  name: {
    fontSize: Theme.fontSize.lg,
    fontWeight: Theme.fontWeight.semibold,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dueLabel: {
    fontSize: Theme.fontSize.sm,
    fontWeight: Theme.fontWeight.medium,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Theme.borderRadius.sm,
  },
  badgeText: {
    fontSize: Theme.fontSize.xs,
    fontWeight: Theme.fontWeight.semibold,
  },
  amountSection: {
    alignItems: 'flex-end',
    gap: 6,
  },
  amount: {
    fontSize: Theme.fontSize.xl,
    fontWeight: Theme.fontWeight.bold,
  },
  payButton: {
    width: 28,
    height: 28,
    borderRadius: Theme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
