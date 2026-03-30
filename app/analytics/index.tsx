import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../hooks/useTheme';
import { Theme } from '../../constants/theme';
import { useExpenseStore } from '../../store/expenseStore';
import { useBillStore } from '../../store/billStore';
import { useSubscriptionStore } from '../../store/subscriptionStore';
import { useSettingsStore } from '../../store/settingsStore';
import { Card } from '../../components/cards/Card';
import { Header, SectionHeader } from '../../components/ui/SharedComponents';
import { ExpenseCategoryLabels, ExpenseCategory } from '../../models/expense';
import { CategoryColors } from '../../constants/colors';
import { formatCurrency, getPercentage } from '../../utils/helpers';

const screenWidth = Dimensions.get('window').width;

export default function AnalyticsScreen() {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const { getMonthlyTotal, getCategoryTotals, getMonthlyExpenses, getDailyAverage } = useExpenseStore();
  const { bills } = useBillStore();
  const { getMonthlyTotal: getSubTotal, subscriptions } = useSubscriptionStore();
  const { monthlyBudget } = useSettingsStore();

  const monthlyTotal = getMonthlyTotal();
  const categoryTotals = getCategoryTotals();
  const dailyAvg = getDailyAverage();
  const subTotal = Math.round(getSubTotal());

  const paidBills = bills.filter((b) => b.status === 'paid');
  const pendingBills = bills.filter((b) => b.status !== 'paid');
  const totalBillAmount = bills.reduce((s, b) => s + b.amount, 0);

  // Category chart data
  const sortedCats = useMemo(
    () => Object.entries(categoryTotals).sort(([, a], [, b]) => b - a),
    [categoryTotals]
  );

  const maxCatValue = sortedCats.length > 0 ? sortedCats[0][1] : 1;

  // Weekly trend — simulated
  const weekLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const weekData = [850, 1200, 430, 2100, 750, 1800, 600];
  const maxWeekVal = Math.max(...weekData);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Analytics" subtitle="Spending Insights" showBack onBack={() => router.back()} />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Top Stats */}
        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <MaterialCommunityIcons name="wallet" size={22} color={colors.primary} />
            <Text style={[styles.statValue, { color: colors.text }]}>{formatCurrency(monthlyTotal)}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Monthly Spend</Text>
          </Card>
          <Card style={styles.statCard}>
            <MaterialCommunityIcons name="chart-timeline-variant" size={22} color={colors.accent} />
            <Text style={[styles.statValue, { color: colors.text }]}>{formatCurrency(dailyAvg)}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Daily Average</Text>
          </Card>
          <Card style={styles.statCard}>
            <MaterialCommunityIcons name="receipt" size={22} color="#FDCB6E" />
            <Text style={[styles.statValue, { color: colors.text }]}>{formatCurrency(totalBillAmount)}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Bills</Text>
          </Card>
          <Card style={styles.statCard}>
            <MaterialCommunityIcons name="credit-card-clock" size={22} color="#A29BFE" />
            <Text style={[styles.statValue, { color: colors.text }]}>{formatCurrency(subTotal)}/mo</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Subscriptions</Text>
          </Card>
        </View>

        {/* Weekly Spending Chart */}
        <View>
          <SectionHeader title="Weekly Spending" />
          <View style={styles.padded}>
            <Card>
              <View style={styles.barChart}>
                {weekData.map((val, idx) => {
                  const barHeight = (val / maxWeekVal) * 120;
                  return (
                    <View key={idx} style={styles.barItem}>
                      <Text style={[styles.barValue, { color: colors.textTertiary }]}>
                        {formatCurrency(val)}
                      </Text>
                      <View style={styles.barTrack}>
                        <View
                          style={[
                            styles.barFill,
                            {
                              height: barHeight,
                              backgroundColor: idx === new Date().getDay() - 1 ? colors.primary : colors.primary + '40',
                              borderRadius: 6,
                            },
                          ]}
                        />
                      </View>
                      <Text style={[styles.barLabel, { color: colors.textSecondary }]}>{weekLabels[idx]}</Text>
                    </View>
                  );
                })}
              </View>
            </Card>
          </View>
        </View>

        {/* Category Breakdown */}
        <View>
          <SectionHeader title="Category Breakdown" />
          <View style={styles.padded}>
            <Card>
              {sortedCats.map(([cat, amount]) => {
                const catColor = CategoryColors[cat] || colors.primary;
                const pct = getPercentage(amount, monthlyTotal);
                const barWidth = (amount / maxCatValue) * 100;

                return (
                  <View key={cat} style={styles.catRow}>
                    <View style={styles.catHeader}>
                      <View style={[styles.catDot, { backgroundColor: catColor }]} />
                      <Text style={[styles.catName, { color: colors.text }]}>
                        {ExpenseCategoryLabels[cat as ExpenseCategory] || cat}
                      </Text>
                      <Text style={[styles.catAmount, { color: colors.text }]}>
                        {formatCurrency(amount)}
                      </Text>
                    </View>
                    <View style={styles.catBarBg}>
                      <View style={[styles.catBarFill, { width: `${barWidth}%`, backgroundColor: catColor }]} />
                    </View>
                    <Text style={[styles.catPct, { color: colors.textTertiary }]}>{pct}% of total</Text>
                  </View>
                );
              })}
            </Card>
          </View>
        </View>

        {/* Bills Overview */}
        <View>
          <SectionHeader title="Bills Overview" />
          <View style={styles.padded}>
            <Card>
              <View style={styles.billOverview}>
                <View style={styles.billStat}>
                  <View style={[styles.billDot, { backgroundColor: colors.success }]} />
                  <Text style={[styles.billLabel, { color: colors.textSecondary }]}>Paid</Text>
                  <Text style={[styles.billValue, { color: colors.text }]}>{paidBills.length}</Text>
                </View>
                <View style={styles.billStat}>
                  <View style={[styles.billDot, { backgroundColor: colors.warning }]} />
                  <Text style={[styles.billLabel, { color: colors.textSecondary }]}>Pending</Text>
                  <Text style={[styles.billValue, { color: colors.text }]}>{pendingBills.length}</Text>
                </View>
                <View style={styles.billStat}>
                  <View style={[styles.billDot, { backgroundColor: colors.primary }]} />
                  <Text style={[styles.billLabel, { color: colors.textSecondary }]}>Total</Text>
                  <Text style={[styles.billValue, { color: colors.text }]}>{bills.length}</Text>
                </View>
              </View>
              {/* Visual Bar */}
              <View style={styles.billBar}>
                <View
                  style={[
                    styles.billBarSection,
                    {
                      flex: paidBills.length || 1,
                      backgroundColor: colors.success,
                      borderTopLeftRadius: 6,
                      borderBottomLeftRadius: 6,
                    },
                  ]}
                />
                <View
                  style={[
                    styles.billBarSection,
                    {
                      flex: pendingBills.length || 1,
                      backgroundColor: colors.warning,
                      borderTopRightRadius: 6,
                      borderBottomRightRadius: 6,
                    },
                  ]}
                />
              </View>
            </Card>
          </View>
        </View>

        {/* Subscription Summary */}
        <View>
          <SectionHeader title="Subscription Summary" />
          <View style={styles.padded}>
            <Card>
              <View style={styles.subSummary}>
                <View style={styles.subSummaryRow}>
                  <Text style={[styles.subSummaryLabel, { color: colors.textSecondary }]}>Active Subscriptions</Text>
                  <Text style={[styles.subSummaryValue, { color: colors.text }]}>
                    {subscriptions.filter((s) => s.isActive).length}
                  </Text>
                </View>
                <View style={styles.subSummaryRow}>
                  <Text style={[styles.subSummaryLabel, { color: colors.textSecondary }]}>Monthly Cost</Text>
                  <Text style={[styles.subSummaryValue, { color: colors.primary }]}>
                    {formatCurrency(subTotal)}
                  </Text>
                </View>
                <View style={styles.subSummaryRow}>
                  <Text style={[styles.subSummaryLabel, { color: colors.textSecondary }]}>Yearly Cost</Text>
                  <Text style={[styles.subSummaryValue, { color: colors.error }]}>
                    {formatCurrency(subTotal * 12)}
                  </Text>
                </View>
              </View>
            </Card>
          </View>
        </View>

        {/* Budget Insight */}
        <View>
          <SectionHeader title="Budget Insight" />
          <View style={styles.padded}>
            <Card gradient gradientColors={isDark ? ['#302B63', '#24243E'] : ['#6C5CE7', '#A29BFE']}>
              <Text style={styles.insightLabel}>Monthly Budget Usage</Text>
              <View style={styles.insightRow}>
                <Text style={styles.insightValue}>{getPercentage(monthlyTotal, monthlyBudget)}%</Text>
                <Text style={styles.insightText}>
                  {monthlyTotal > monthlyBudget
                    ? `Over by ${formatCurrency(monthlyTotal - monthlyBudget)}`
                    : `${formatCurrency(monthlyBudget - monthlyTotal)} remaining`}
                </Text>
              </View>
              <View style={styles.insightBar}>
                <View
                  style={[
                    styles.insightBarFill,
                    {
                      width: `${Math.min(getPercentage(monthlyTotal, monthlyBudget), 100)}%`,
                      backgroundColor: monthlyTotal > monthlyBudget ? '#FF6B6B' : '#55EFC4',
                    },
                  ]}
                />
              </View>
            </Card>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  padded: { paddingHorizontal: Theme.spacing.xl },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Theme.spacing.xl,
    gap: Theme.spacing.md,
  },
  statCard: {
    width: '47%',
    alignItems: 'flex-start',
    gap: 6,
  },
  statValue: {
    fontSize: Theme.fontSize.lg,
    fontWeight: Theme.fontWeight.bold,
  },
  statLabel: {
    fontSize: Theme.fontSize.xs,
  },
  barChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 170,
    paddingTop: Theme.spacing.md,
  },
  barItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  barValue: {
    fontSize: 8,
    fontWeight: Theme.fontWeight.medium,
  },
  barTrack: {
    width: 24,
    height: 120,
    justifyContent: 'flex-end',
  },
  barFill: {},
  barLabel: {
    fontSize: Theme.fontSize.xs,
    fontWeight: Theme.fontWeight.medium,
  },
  catRow: {
    marginBottom: Theme.spacing.lg,
  },
  catHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  catDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  catName: {
    flex: 1,
    fontSize: Theme.fontSize.md,
    fontWeight: Theme.fontWeight.medium,
  },
  catAmount: {
    fontSize: Theme.fontSize.md,
    fontWeight: Theme.fontWeight.bold,
  },
  catBarBg: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(128,128,128,0.1)',
  },
  catBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  catPct: {
    fontSize: Theme.fontSize.xs,
    marginTop: 4,
  },
  billOverview: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Theme.spacing.md,
  },
  billStat: {
    alignItems: 'center',
    gap: 4,
  },
  billDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  billLabel: {
    fontSize: Theme.fontSize.xs,
  },
  billValue: {
    fontSize: Theme.fontSize.xl,
    fontWeight: Theme.fontWeight.bold,
  },
  billBar: {
    flexDirection: 'row',
    height: 12,
    borderRadius: 6,
    gap: 2,
  },
  billBarSection: {
    height: '100%',
  },
  subSummary: {
    gap: Theme.spacing.md,
  },
  subSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  subSummaryLabel: {
    fontSize: Theme.fontSize.md,
  },
  subSummaryValue: {
    fontSize: Theme.fontSize.md,
    fontWeight: Theme.fontWeight.bold,
  },
  insightLabel: {
    fontSize: Theme.fontSize.sm,
    color: 'rgba(255,255,255,0.7)',
  },
  insightRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 12,
    marginTop: 4,
  },
  insightValue: {
    fontSize: Theme.fontSize['5xl'],
    fontWeight: Theme.fontWeight.extrabold,
    color: '#FFFFFF',
  },
  insightText: {
    fontSize: Theme.fontSize.sm,
    color: 'rgba(255,255,255,0.6)',
  },
  insightBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginTop: Theme.spacing.md,
  },
  insightBarFill: {
    height: '100%',
    borderRadius: 4,
  },
});
