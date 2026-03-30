import React, { useMemo, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useTheme } from '../../hooks/useTheme';
import { Theme } from '../../constants/theme';
import { useUser } from '@clerk/expo';
import { useBillStore } from '../../store/billStore';
import { useExpenseStore } from '../../store/expenseStore';
import { useSubscriptionStore } from '../../store/subscriptionStore';
import { useGroceryStore } from '../../store/groceryStore';
import { useSettingsStore } from '../../store/settingsStore';
import { Card, StatCard, AlertCard } from '../../components/cards/Card';
import { BillCard } from '../../components/cards/BillCard';
import { SectionHeader } from '../../components/ui/SharedComponents';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatCurrency, getGreeting, getPercentage } from '../../utils/helpers';
import { generateSmartAlerts } from '../../services/smartEngine/predictions';

export default function DashboardScreen() {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const { user } = useUser();
  const { bills, getUpcomingBills, getTotalPending, markPaid, fetchBills } = useBillStore();
  const { getMonthlyTotal, getDailyAverage, fetchExpenses } = useExpenseStore();
  const { getMonthlyTotal: getSubTotal, getUnusedSubscriptions, fetchSubscriptions } = useSubscriptionStore();
  const { getDueItems, fetchItems } = useGroceryStore();
  const { monthlyBudget } = useSettingsStore();

  const [refreshing, setRefreshing] = React.useState(false);

  const monthlySpent = getMonthlyTotal();
  const budgetPercentage = getPercentage(monthlySpent, monthlyBudget);
  const upcomingBills = getUpcomingBills(7);
  const totalPending = getTotalPending();
  const subTotal = Math.round(getSubTotal());
  const dailyAvg = getDailyAverage();
  const unusedSubs = getUnusedSubscriptions();
  const dueGrocery = getDueItems();

  const alerts = useMemo(
    () => generateSmartAlerts(bills, monthlySpent, monthlyBudget, unusedSubs.length, dueGrocery.length),
    [bills, monthlySpent, monthlyBudget, unusedSubs.length, dueGrocery.length]
  );

  const hasNoData = bills.length === 0 && monthlySpent === 0 && subTotal === 0;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      fetchBills(),
      fetchExpenses(),
      fetchSubscriptions(),
      fetchItems(),
    ]);
    setRefreshing(false);
  }, [fetchBills, fetchExpenses, fetchSubscriptions, fetchItems]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: colors.textSecondary }]}>{getGreeting()},</Text>
            <Text style={[styles.userName, { color: colors.text }]}>{user?.firstName || 'User'} 👋</Text>
          </View>
          <TouchableOpacity
            style={[styles.notifButton, { backgroundColor: colors.surfaceElevated }]}
            onPress={() => {}}
          >
            <MaterialCommunityIcons name="bell-outline" size={22} color={colors.text} />
            {alerts.length > 0 && <View style={[styles.notifDot, { backgroundColor: colors.error }]} />}
          </TouchableOpacity>
        </View>

        {/* Budget Overview Card */}
        <View style={styles.sectionPadded}>
          <Card gradient gradientColors={isDark ? ['#302B63', '#24243E'] : ['#6C5CE7', '#A29BFE']}>
            <View style={styles.budgetHeader}>
              <View>
                <Text style={[styles.budgetLabel, { color: 'rgba(255,255,255,0.7)' }]}>
                  Monthly Spending
                </Text>
                <Text style={styles.budgetAmount}>
                  {formatCurrency(monthlySpent)}
                </Text>
              </View>
              <View style={styles.budgetRight}>
                <Text style={[styles.budgetOf, { color: 'rgba(255,255,255,0.6)' }]}>
                  of {formatCurrency(monthlyBudget)}
                </Text>
              </View>
            </View>
            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBg}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.min(budgetPercentage, 100)}%`,
                      backgroundColor: budgetPercentage > 100 ? '#FF6B6B' : budgetPercentage > 85 ? '#FDCB6E' : '#55EFC4',
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {budgetPercentage}% used
              </Text>
            </View>
            {/* Quick Stats */}
            <View style={styles.quickStats}>
              <View style={styles.quickStat}>
                <Text style={styles.quickStatLabel}>Daily Avg</Text>
                <Text style={styles.quickStatValue}>{formatCurrency(dailyAvg)}</Text>
              </View>
              <View style={[styles.quickStatDivider, { backgroundColor: 'rgba(255,255,255,0.2)' }]} />
              <View style={styles.quickStat}>
                <Text style={styles.quickStatLabel}>Pending Bills</Text>
                <Text style={styles.quickStatValue}>{formatCurrency(totalPending)}</Text>
              </View>
              <View style={[styles.quickStatDivider, { backgroundColor: 'rgba(255,255,255,0.2)' }]} />
              <View style={styles.quickStat}>
                <Text style={styles.quickStatLabel}>Subscriptions</Text>
                <Text style={styles.quickStatValue}>{formatCurrency(subTotal)}/mo</Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          {[
            { icon: 'plus-circle', label: 'Add Bill', route: '/bills/add', color: colors.primary },
            { icon: 'wallet-plus', label: 'Add Expense', route: '/bills/addExpense', color: colors.accent },
            { icon: 'chart-bar', label: 'Analytics', route: '/analytics', color: '#FF7675' },
            { icon: 'cellphone', label: 'Recharge', route: '/recharge', color: '#FDCB6E' },
          ].map((action) => (
            <TouchableOpacity
              key={action.label}
              style={styles.quickActionItem}
              onPress={() => router.push(action.route as any)}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: action.color + '15' }]}>
                <MaterialCommunityIcons name={action.icon as any} size={24} color={action.color} />
              </View>
              <Text style={[styles.quickActionLabel, { color: colors.textSecondary }]}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Smart Alerts */}
        {alerts.length > 0 && (
          <>
            <SectionHeader title="Smart Alerts" actionLabel={`${alerts.length} alerts`} />
            <View style={styles.sectionPadded}>
              {alerts.slice(0, 3).map((alert) => (
                <AlertCard
                  key={alert.id}
                  title={alert.title}
                  message={alert.message}
                  icon={alert.icon}
                  color={alert.color}
                  actionLabel={alert.actionLabel}
                  onAction={() => alert.actionRoute && router.push(alert.actionRoute as any)}
                />
              ))}
            </View>
          </>
        )}

        {/* Upcoming Bills or Empty State */}
        {hasNoData ? (
          <View style={styles.sectionPadded}>
            <EmptyState
              icon="rocket-launch-outline"
              title="Welcome to Synkr!"
              subtitle="Start by adding your first bill, expense, or subscription to see your financial dashboard come alive."
              actionLabel="Add Your First Bill"
              onAction={() => router.push('/bills/add' as any)}
              iconColor="#6C5CE7"
            />
          </View>
        ) : (
          <>
            <SectionHeader
              title="Upcoming Bills"
              actionLabel="View All"
              onAction={() => router.push('/(tabs)/bills')}
            />
            <View style={styles.sectionPadded}>
              {upcomingBills.length > 0 ? (
                upcomingBills.slice(0, 4).map((bill) => (
                  <BillCard key={bill.id} bill={bill} onMarkPaid={() => markPaid(bill.id)} />
                ))
              ) : (
                <Card>
                  <View style={styles.emptyMini}>
                    <MaterialCommunityIcons name="check-circle" size={32} color={colors.success} />
                    <Text style={[styles.emptyMiniText, { color: colors.textSecondary }]}>
                      All bills are cleared! 🎉
                    </Text>
                  </View>
                </Card>
              )}
            </View>
          </>
        )}

        {/* Feature Cards */}
        <SectionHeader title="Quick Access" />
        <View style={styles.featureGrid}>
          {[
            { icon: 'credit-card-clock', title: 'Subscriptions', subtitle: `${formatCurrency(subTotal)}/mo`, route: '/subscriptions', color: '#A29BFE' },
            { icon: 'cart', title: 'Grocery', subtitle: `${dueGrocery.length} items due`, route: '/grocery', color: '#00B894' },
            { icon: 'cellphone-wireless', title: 'Recharge', subtitle: 'Track data usage', route: '/recharge', color: '#FDCB6E' },
            { icon: 'chart-pie', title: 'Analytics', subtitle: 'Spending insights', route: '/analytics', color: '#FF7675' },
          ].map((item) => (
            <TouchableOpacity
              key={item.title}
              style={[styles.featureCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
              onPress={() => router.push(item.route as any)}
              activeOpacity={0.7}
            >
              <View style={[styles.featureIcon, { backgroundColor: item.color + '15' }]}>
                <MaterialCommunityIcons name={item.icon as any} size={24} color={item.color} />
              </View>
              <Text style={[styles.featureTitle, { color: colors.text }]}>{item.title}</Text>
              <Text style={[styles.featureSubtitle, { color: colors.textTertiary }]}>{item.subtitle}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.xl,
    paddingTop: Theme.spacing.lg,
    paddingBottom: Theme.spacing.md,
  },
  greeting: {
    fontSize: Theme.fontSize.md,
    fontWeight: Theme.fontWeight.medium,
  },
  userName: {
    fontSize: Theme.fontSize['3xl'],
    fontWeight: Theme.fontWeight.bold,
    marginTop: 2,
  },
  notifButton: {
    width: 44,
    height: 44,
    borderRadius: Theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  sectionPadded: {
    paddingHorizontal: Theme.spacing.xl,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  budgetLabel: {
    fontSize: Theme.fontSize.sm,
    fontWeight: Theme.fontWeight.medium,
  },
  budgetAmount: {
    fontSize: Theme.fontSize['4xl'],
    fontWeight: Theme.fontWeight.extrabold,
    color: '#FFFFFF',
    marginTop: 4,
  },
  budgetRight: {
    alignItems: 'flex-end',
  },
  budgetOf: {
    fontSize: Theme.fontSize.sm,
  },
  progressContainer: {
    marginTop: Theme.spacing.lg,
  },
  progressBg: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: Theme.fontSize.xs,
    marginTop: 6,
    textAlign: 'right',
  },
  quickStats: {
    flexDirection: 'row',
    marginTop: Theme.spacing.lg,
    paddingTop: Theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.15)',
  },
  quickStat: {
    flex: 1,
    alignItems: 'center',
  },
  quickStatLabel: {
    fontSize: Theme.fontSize.xs,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 4,
  },
  quickStatValue: {
    fontSize: Theme.fontSize.md,
    fontWeight: Theme.fontWeight.bold,
    color: '#FFFFFF',
  },
  quickStatDivider: {
    width: 1,
    height: 30,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: Theme.spacing.xl,
    paddingVertical: Theme.spacing.xl,
  },
  quickActionItem: {
    alignItems: 'center',
    gap: 6,
  },
  quickActionIcon: {
    width: 52,
    height: 52,
    borderRadius: Theme.borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionLabel: {
    fontSize: Theme.fontSize.xs,
    fontWeight: Theme.fontWeight.medium,
  },
  emptyMini: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: Theme.spacing.sm,
  },
  emptyMiniText: {
    fontSize: Theme.fontSize.md,
    fontWeight: Theme.fontWeight.medium,
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Theme.spacing.xl,
    gap: Theme.spacing.md,
  },
  featureCard: {
    width: '47%',
    borderRadius: Theme.borderRadius.xl,
    padding: Theme.spacing.lg,
    borderWidth: 1,
    ...Theme.shadow.sm,
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: Theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Theme.spacing.md,
  },
  featureTitle: {
    fontSize: Theme.fontSize.lg,
    fontWeight: Theme.fontWeight.semibold,
  },
  featureSubtitle: {
    fontSize: Theme.fontSize.sm,
    marginTop: 4,
  },
});
