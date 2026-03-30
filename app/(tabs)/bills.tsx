import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../hooks/useTheme';
import { Theme } from '../../constants/theme';
import { useBillStore } from '../../store/billStore';
import { BillCard } from '../../components/cards/BillCard';
import { Header, FAB, Chip, SectionHeader } from '../../components/ui/SharedComponents';
import { BillStatus } from '../../models/bill';
import { formatCurrency } from '../../utils/helpers';

type FilterType = 'all' | 'pending' | 'overdue' | 'paid';

export default function BillsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { bills, markPaid, deleteBill, getTotalPending } = useBillStore();
  const [filter, setFilter] = useState<FilterType>('all');

  const filteredBills = useMemo(() => {
    if (filter === 'all') return bills;
    return bills.filter((b) => b.status === filter);
  }, [bills, filter]);

  const overdueBills = bills.filter((b) => b.status === 'overdue');
  const pendingBills = bills.filter((b) => b.status === 'pending');
  const paidBills = bills.filter((b) => b.status === 'paid');

  const filters: { key: FilterType; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: bills.length },
    { key: 'overdue', label: 'Overdue', count: overdueBills.length },
    { key: 'pending', label: 'Pending', count: pendingBills.length },
    { key: 'paid', label: 'Paid', count: paidBills.length },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Bills" subtitle={`${formatCurrency(getTotalPending())} pending`} />

      {/* Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow} contentContainerStyle={styles.filterContent}>
        {filters.map((f) => (
          <Chip
            key={f.key}
            label={`${f.label} (${f.count})`}
            selected={filter === f.key}
            onPress={() => setFilter(f.key)}
            color={f.key === 'overdue' ? colors.error : undefined}
          />
        ))}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Summary Cards */}
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { backgroundColor: colors.errorLight }]}>
            <MaterialCommunityIcons name="alert-circle" size={20} color={colors.error} />
            <Text style={[styles.summaryValue, { color: colors.error }]}>{overdueBills.length}</Text>
            <Text style={[styles.summaryLabel, { color: colors.error }]}>Overdue</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: colors.warningLight }]}>
            <MaterialCommunityIcons name="clock-outline" size={20} color={colors.warning} />
            <Text style={[styles.summaryValue, { color: colors.text }]}>{pendingBills.length}</Text>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Pending</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: colors.successLight }]}>
            <MaterialCommunityIcons name="check-circle" size={20} color={colors.success} />
            <Text style={[styles.summaryValue, { color: colors.text }]}>{paidBills.length}</Text>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Paid</Text>
          </View>
        </View>

        {/* Bill List */}
        <View style={styles.billList}>
          {filteredBills.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="receipt" size={48} color={colors.textTertiary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No {filter !== 'all' ? filter : ''} bills found
              </Text>
            </View>
          ) : (
            filteredBills.map((bill) => (
              <BillCard
                key={bill.id}
                bill={bill}
                onPress={() => router.push({ pathname: '/bills/add', params: { billId: bill.id } })}
                onMarkPaid={() => markPaid(bill.id)}
              />
            ))
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <FAB onPress={() => router.push('/bills/add')} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterRow: {
    maxHeight: 50,
  },
  filterContent: {
    paddingHorizontal: Theme.spacing.xl,
    gap: Theme.spacing.sm,
  },
  scrollContent: {
    paddingTop: Theme.spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    paddingHorizontal: Theme.spacing.xl,
    gap: Theme.spacing.md,
    marginBottom: Theme.spacing.lg,
  },
  summaryCard: {
    flex: 1,
    alignItems: 'center',
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.xl,
    gap: 4,
  },
  summaryValue: {
    fontSize: Theme.fontSize['2xl'],
    fontWeight: Theme.fontWeight.bold,
  },
  summaryLabel: {
    fontSize: Theme.fontSize.xs,
    fontWeight: Theme.fontWeight.medium,
  },
  billList: {
    paddingHorizontal: Theme.spacing.xl,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Theme.spacing['5xl'],
    gap: Theme.spacing.md,
  },
  emptyText: {
    fontSize: Theme.fontSize.lg,
    fontWeight: Theme.fontWeight.medium,
  },
});
