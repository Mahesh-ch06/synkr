import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useUser, useClerk } from '@clerk/expo';
import { useTheme } from '../../hooks/useTheme';
import { Theme } from '../../constants/theme';
import { useSettingsStore } from '../../store/settingsStore';
import { useExpenseStore } from '../../store/expenseStore';
import { useSubscriptionStore } from '../../store/subscriptionStore';
import { Card } from '../../components/cards/Card';
import { ToggleRow } from '../../components/ui/SharedComponents';
import { formatCurrency } from '../../utils/helpers';

export default function ProfileScreen() {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const { user } = useUser();
  const { signOut } = useClerk();
  const settings = useSettingsStore();
  const monthlySpent = useExpenseStore((s) => s.getMonthlyTotal());
  const subCount = useSubscriptionStore((s) => s.subscriptions.filter((s) => s.isActive).length);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => signOut() },
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>
              {user?.firstName?.charAt(0).toUpperCase() || user?.emailAddresses?.[0]?.emailAddress?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
          <Text style={[styles.name, { color: colors.text }]}>
            {user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'User'}
          </Text>
          <Text style={[styles.email, { color: colors.textSecondary }]}>
            {user?.emailAddresses?.[0]?.emailAddress || ''}
          </Text>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Text style={[styles.statValue, { color: colors.primary }]}>{formatCurrency(monthlySpent)}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>This Month</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Text style={[styles.statValue, { color: colors.accent }]}>{formatCurrency(settings.monthlyBudget)}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Budget</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Text style={[styles.statValue, { color: colors.success }]}>{subCount}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Active Subs</Text>
          </View>
        </View>

        {/* Navigation Items */}
        <View style={[styles.section, { borderTopColor: colors.borderLight }]}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>FEATURES</Text>
          {[
            { icon: 'credit-card-clock', label: 'Subscriptions', route: '/subscriptions', color: '#A29BFE' },
            { icon: 'cellphone-wireless', label: 'Recharge Tracker', route: '/recharge', color: '#FDCB6E' },
            { icon: 'cart', label: 'Grocery Essentials', route: '/grocery', color: '#00B894' },
            { icon: 'chart-bar', label: 'Analytics', route: '/analytics', color: '#FF7675' },
          ].map((item) => (
            <TouchableOpacity
              key={item.label}
              style={[styles.menuRow, { borderBottomColor: colors.borderLight }]}
              onPress={() => router.push(item.route as any)}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIcon, { backgroundColor: item.color + '15' }]}>
                <MaterialCommunityIcons name={item.icon as any} size={20} color={item.color} />
              </View>
              <Text style={[styles.menuLabel, { color: colors.text }]}>{item.label}</Text>
              <MaterialCommunityIcons name="chevron-right" size={22} color={colors.textTertiary} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Settings */}
        <View style={[styles.section, { borderTopColor: colors.borderLight }]}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>PREFERENCES</Text>

          {/* Theme Toggle */}
          <TouchableOpacity
            style={[styles.menuRow, { borderBottomColor: colors.borderLight }]}
            onPress={() => settings.setThemeMode(isDark ? 'light' : 'dark')}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIcon, { backgroundColor: colors.primary + '15' }]}>
              <MaterialCommunityIcons
                name={isDark ? 'weather-night' : 'white-balance-sunny'}
                size={20}
                color={colors.primary}
              />
            </View>
            <Text style={[styles.menuLabel, { color: colors.text }]}>
              {isDark ? 'Dark Mode' : 'Light Mode'}
            </Text>
            <View style={[styles.themeBadge, { backgroundColor: isDark ? colors.primary + '20' : colors.warning + '20' }]}>
              <Text style={[styles.themeBadgeText, { color: isDark ? colors.primary : '#F59E0B' }]}>
                {isDark ? 'ON' : 'OFF'}
              </Text>
            </View>
          </TouchableOpacity>

          <ToggleRow
            label="Smart Reminders"
            description="Bill, grocery & budget alerts"
            icon="bell-ring-outline"
            value={settings.remindersEnabled}
            onToggle={settings.toggleReminders}
          />
          <ToggleRow
            label="Bill Reminders"
            icon="receipt"
            value={settings.billReminders}
            onToggle={settings.toggleBillReminders}
          />
          <ToggleRow
            label="Expense Alerts"
            description="Overspending notifications"
            icon="wallet-outline"
            value={settings.expenseAlerts}
            onToggle={settings.toggleExpenseAlerts}
          />
          <ToggleRow
            label="Grocery Reminders"
            icon="cart-outline"
            value={settings.groceryReminders}
            onToggle={settings.toggleGroceryReminders}
          />
        </View>

        {/* Monthly Budget Setting */}
        <View style={[styles.section, { borderTopColor: colors.borderLight }]}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>BUDGET</Text>
          <Card>
            <Text style={[styles.budgetTitle, { color: colors.textSecondary }]}>Monthly Budget Limit</Text>
            <Text style={[styles.budgetValue, { color: colors.text }]}>{formatCurrency(settings.monthlyBudget)}</Text>
            <View style={styles.budgetButtons}>
              {[15000, 20000, 25000, 30000, 50000].map((val) => (
                <TouchableOpacity
                  key={val}
                  style={[
                    styles.budgetBtn,
                    {
                      backgroundColor: settings.monthlyBudget === val ? colors.primary : colors.surfaceElevated,
                      borderColor: settings.monthlyBudget === val ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => settings.setMonthlyBudget(val)}
                >
                  <Text
                    style={[
                      styles.budgetBtnText,
                      { color: settings.monthlyBudget === val ? '#FFF' : colors.textSecondary },
                    ]}
                  >
                    {formatCurrency(val)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>
        </View>

        {/* About & Logout */}
        <View style={[styles.section, { borderTopColor: colors.borderLight }]}>
          <TouchableOpacity
            style={[styles.menuRow, { borderBottomColor: colors.borderLight }]}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIcon, { backgroundColor: colors.info + '15' }]}>
              <MaterialCommunityIcons name="information-outline" size={20} color={colors.info} />
            </View>
            <Text style={[styles.menuLabel, { color: colors.text }]}>About Synkr</Text>
            <Text style={[styles.versionText, { color: colors.textTertiary }]}>v1.0.0</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.logoutRow]}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="logout" size={20} color={colors.error} />
            <Text style={[styles.logoutText, { color: colors.error }]}>Logout</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: Theme.spacing['3xl'],
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Theme.spacing.md,
  },
  avatarText: {
    fontSize: Theme.fontSize['4xl'],
    fontWeight: Theme.fontWeight.bold,
    color: '#FFFFFF',
  },
  name: {
    fontSize: Theme.fontSize['2xl'],
    fontWeight: Theme.fontWeight.bold,
  },
  email: {
    fontSize: Theme.fontSize.md,
    marginTop: 4,
  },
  phone: {
    fontSize: Theme.fontSize.sm,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: Theme.spacing.xl,
    gap: Theme.spacing.md,
    marginBottom: Theme.spacing.lg,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.xl,
    borderWidth: 1,
  },
  statValue: {
    fontSize: Theme.fontSize.lg,
    fontWeight: Theme.fontWeight.bold,
  },
  statLabel: {
    fontSize: Theme.fontSize.xs,
    marginTop: 4,
  },
  section: {
    paddingHorizontal: Theme.spacing.xl,
    paddingTop: Theme.spacing.lg,
    marginTop: Theme.spacing.sm,
    borderTopWidth: 6,
  },
  sectionTitle: {
    fontSize: Theme.fontSize.xs,
    fontWeight: Theme.fontWeight.bold,
    letterSpacing: 1,
    marginBottom: Theme.spacing.md,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Theme.spacing.lg,
    borderBottomWidth: 1,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Theme.spacing.md,
  },
  menuLabel: {
    flex: 1,
    fontSize: Theme.fontSize.lg,
    fontWeight: Theme.fontWeight.medium,
  },
  themeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Theme.borderRadius.full,
  },
  themeBadgeText: {
    fontSize: Theme.fontSize.xs,
    fontWeight: Theme.fontWeight.bold,
  },
  versionText: {
    fontSize: Theme.fontSize.sm,
  },
  budgetTitle: {
    fontSize: Theme.fontSize.sm,
    fontWeight: Theme.fontWeight.medium,
    marginBottom: 4,
  },
  budgetValue: {
    fontSize: Theme.fontSize['3xl'],
    fontWeight: Theme.fontWeight.bold,
    marginBottom: Theme.spacing.md,
  },
  budgetButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.sm,
  },
  budgetBtn: {
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.full,
    borderWidth: 1,
  },
  budgetBtnText: {
    fontSize: Theme.fontSize.sm,
    fontWeight: Theme.fontWeight.semibold,
  },
  logoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xl,
    marginTop: Theme.spacing.md,
  },
  logoutText: {
    fontSize: Theme.fontSize.lg,
    fontWeight: Theme.fontWeight.semibold,
  },
});
