import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../hooks/useTheme';
import { Theme } from '../../constants/theme';
import { useExpenseStore } from '../../store/expenseStore';
import { useSettingsStore } from '../../store/settingsStore';
import { ExpenseCard } from '../../components/cards/ExpenseCard';
import { Card } from '../../components/cards/Card';
import { Header, FAB, Chip, SectionHeader } from '../../components/ui/SharedComponents';
import { ExpenseCategory, ExpenseCategoryLabels } from '../../models/expense';
import { CategoryColors } from '../../constants/colors';
import { formatCurrency, getPercentage } from '../../utils/helpers';
import { format } from 'date-fns';

export default function ExpensesScreen() {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const { expenses, getMonthlyTotal, getCategoryTotals, getDailyAverage } = useExpenseStore();
  const { monthlyBudget } = useSettingsStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const monthlyTotal = getMonthlyTotal();
  const categoryTotals = getCategoryTotals();
  const dailyAvg = getDailyAverage();
  const budgetRemaining = monthlyBudget - monthlyTotal;
  const budgetPercentage = getPercentage(monthlyTotal, monthlyBudget);

  // Sort categories by amount for the breakdown
  const sortedCategories = useMemo(
    () =>
      Object.entries(categoryTotals)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 6),
    [categoryTotals]
  );

  const filteredExpenses = useMemo(() => {
    if (selectedCategory === 'all') return expenses;
    return expenses.filter((e) => e.category === selectedCategory);
  }, [expenses, selectedCategory]);

  // Group expenses by date
  const groupedExpenses = useMemo(() => {
    const groups: Record<string, typeof expenses> = {};
    filteredExpenses.forEach((exp) => {
      const dateKey = exp.date;
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(exp);
    });
    return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
  }, [filteredExpenses]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Expenses" subtitle={format(new Date(), 'MMMM yyyy')} />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Budget Card */}
        <View style={styles.padded}>
          <Card gradient gradientColors={isDark ? ['#1A1A3E', '#302B63'] : ['#6C5CE7', '#A29BFE']}>
            <View style={styles.budgetRow}>
              <View>
                <Text style={styles.budgetLabel}>Spent this month</Text>
                <Text style={styles.budgetValue}>{formatCurrency(monthlyTotal)}</Text>
              </View>
              <View style={styles.budgetRight}>
                <Text style={[styles.budgetLabel, { textAlign: 'right' }]}>Remaining</Text>
                <Text style={[styles.budgetValue, { fontSize: Theme.fontSize.xl, color: budgetRemaining < 0 ? '#FF6B6B' : '#55EFC4' }]}>
                  {formatCurrency(Math.abs(budgetRemaining))}
                </Text>
              </View>
            </View>
            <View style={styles.progressBar}>
              <View style={styles.progressBg}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.min(budgetPercentage, 100)}%`,
                      backgroundColor: budgetPercentage > 100 ? '#FF6B6B' : '#55EFC4',
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressLabel}>
                {budgetPercentage}% of {formatCurrency(monthlyBudget)} budget
              </Text>
            </View>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Daily Avg</Text>
                <Text style={styles.statValue}>{formatCurrency(dailyAvg)}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Transactions</Text>
                <Text style={styles.statValue}>{expenses.length}</Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Category Breakdown */}
        {sortedCategories.length > 0 && (
          <>
            <SectionHeader title="Category Breakdown" />
            <View style={styles.padded}>
              <Card>
                {sortedCategories.map(([cat, amount], idx) => {
                  const catColor = CategoryColors[cat] || colors.primary;
                  const pct = getPercentage(amount, monthlyTotal);
                  return (
                    <View key={cat} style={[styles.catRow, idx < sortedCategories.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.borderLight }]}>
                      <View style={[styles.catDot, { backgroundColor: catColor }]} />
                      <Text style={[styles.catName, { color: colors.text }]}>
                        {ExpenseCategoryLabels[cat as ExpenseCategory] || cat}
                      </Text>
                      <View style={styles.catRight}>
                        <Text style={[styles.catAmount, { color: colors.text }]}>
                          {formatCurrency(amount)}
                        </Text>
                        <Text style={[styles.catPct, { color: colors.textTertiary }]}>{pct}%</Text>
                      </View>
                    </View>
                  );
                })}
              </Card>
            </View>
          </>
        )}

        {/* Category Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow} contentContainerStyle={styles.chipContent}>
          <Chip label="All" selected={selectedCategory === 'all'} onPress={() => setSelectedCategory('all')} />
          {Object.keys(categoryTotals).map((cat) => (
            <Chip
              key={cat}
              label={ExpenseCategoryLabels[cat as ExpenseCategory] || cat}
              selected={selectedCategory === cat}
              onPress={() => setSelectedCategory(cat)}
              color={CategoryColors[cat]}
            />
          ))}
        </ScrollView>

        {/* Expense List */}
        {groupedExpenses.map(([date, exps]) => (
          <View key={date}>
            <View style={styles.dateHeader}>
              <Text style={[styles.dateText, { color: colors.textSecondary }]}>
                {format(new Date(date), 'EEE, dd MMM')}
              </Text>
              <Text style={[styles.dateTotal, { color: colors.textTertiary }]}>
                {formatCurrency(exps.reduce((s, e) => s + e.amount, 0))}
              </Text>
            </View>
            <View style={styles.padded}>
              {exps.map((expense) => (
                <ExpenseCard key={expense.id} expense={expense} />
              ))}
            </View>
          </View>
        ))}

        <View style={{ height: 100 }} />
      </ScrollView>

      <FAB onPress={() => router.push('/bills/addExpense')} icon="wallet-plus" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  padded: { paddingHorizontal: Theme.spacing.xl },
  budgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  budgetLabel: {
    fontSize: Theme.fontSize.sm,
    color: 'rgba(255,255,255,0.6)',
  },
  budgetValue: {
    fontSize: Theme.fontSize['3xl'],
    fontWeight: Theme.fontWeight.extrabold,
    color: '#FFFFFF',
    marginTop: 4,
  },
  budgetRight: { alignItems: 'flex-end' },
  progressBar: { marginTop: Theme.spacing.lg },
  progressBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  progressFill: { height: '100%', borderRadius: 3 },
  progressLabel: {
    fontSize: Theme.fontSize.xs,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 6,
    textAlign: 'right',
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: Theme.spacing.lg,
    paddingTop: Theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.15)',
    gap: Theme.spacing['3xl'],
  },
  statItem: {},
  statLabel: {
    fontSize: Theme.fontSize.xs,
    color: 'rgba(255,255,255,0.6)',
  },
  statValue: {
    fontSize: Theme.fontSize.lg,
    fontWeight: Theme.fontWeight.bold,
    color: '#FFFFFF',
    marginTop: 2,
  },
  chipRow: { maxHeight: 50, marginTop: Theme.spacing.md },
  chipContent: { paddingHorizontal: Theme.spacing.xl },
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Theme.spacing.md,
  },
  catDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: Theme.spacing.md,
  },
  catName: {
    flex: 1,
    fontSize: Theme.fontSize.md,
    fontWeight: Theme.fontWeight.medium,
  },
  catRight: { alignItems: 'flex-end' },
  catAmount: {
    fontSize: Theme.fontSize.md,
    fontWeight: Theme.fontWeight.semibold,
  },
  catPct: {
    fontSize: Theme.fontSize.xs,
    marginTop: 2,
  },
  dateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Theme.spacing.xl,
    marginTop: Theme.spacing.xl,
    marginBottom: Theme.spacing.sm,
  },
  dateText: {
    fontSize: Theme.fontSize.sm,
    fontWeight: Theme.fontWeight.semibold,
  },
  dateTotal: {
    fontSize: Theme.fontSize.sm,
    fontWeight: Theme.fontWeight.medium,
  },
});
