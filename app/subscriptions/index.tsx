import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../hooks/useTheme';
import { Theme } from '../../constants/theme';
import { useSubscriptionStore } from '../../store/subscriptionStore';
import { Card } from '../../components/cards/Card';
import { Header, SectionHeader } from '../../components/ui/SharedComponents';
import { SubscriptionIcons, SubscriptionCategoryLabels } from '../../models/subscription';
import { formatCurrency, getDaysUntil, getDaysLabel } from '../../utils/helpers';

export default function SubscriptionsScreen() {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const { subscriptions, getMonthlyTotal, getUnusedSubscriptions, toggleActive } = useSubscriptionStore();

  const monthlyTotal = Math.round(getMonthlyTotal());
  const unusedSubs = getUnusedSubscriptions();
  const activeSubs = subscriptions.filter((s) => s.isActive);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Subscriptions" showBack onBack={() => router.back()} />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Total Card */}
        <View style={styles.padded}>
          <Card gradient gradientColors={isDark ? ['#302B63', '#24243E'] : ['#A29BFE', '#6C5CE7']}>
            <Text style={styles.totalLabel}>Monthly Subscription Cost</Text>
            <Text style={styles.totalValue}>{formatCurrency(monthlyTotal)}/mo</Text>
            <View style={styles.totalRow}>
              <Text style={styles.totalSub}>{activeSubs.length} active subscriptions</Text>
              {unusedSubs.length > 0 && (
                <View style={styles.warningBadge}>
                  <Text style={styles.warningText}>{unusedSubs.length} unused</Text>
                </View>
              )}
            </View>
          </Card>
        </View>

        {/* Unused Alert */}
        {unusedSubs.length > 0 && (
          <>
            <SectionHeader title="⚠️ Unused Subscriptions" />
            <View style={styles.padded}>
              {unusedSubs.map((sub) => (
                <Card key={sub.id} style={{...styles.subCard, borderLeftColor: colors.warning, borderLeftWidth: 3}}>
                  <View style={styles.subRow}>
                    <View style={[styles.subIcon, { backgroundColor: colors.warning + '15' }]}>
                      <MaterialCommunityIcons
                        name={(SubscriptionIcons[sub.name] || SubscriptionIcons.Default) as any}
                        size={22}
                        color={colors.warning}
                      />
                    </View>
                    <View style={styles.subContent}>
                      <Text style={[styles.subName, { color: colors.text }]}>{sub.name}</Text>
                      <Text style={[styles.subMeta, { color: colors.textTertiary }]}>
                        Not used in 30+ days
                      </Text>
                    </View>
                    <View style={styles.subRight}>
                      <Text style={[styles.subAmount, { color: colors.text }]}>{formatCurrency(sub.amount)}</Text>
                      <TouchableOpacity
                        onPress={() =>
                          Alert.alert('Cancel?', `Cancel ${sub.name}?`, [
                            { text: 'No' },
                            { text: 'Cancel It', onPress: () => toggleActive(sub.id), style: 'destructive' },
                          ])
                        }
                      >
                        <Text style={[styles.cancelBtn, { color: colors.error }]}>Cancel</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </Card>
              ))}
            </View>
          </>
        )}

        {/* Active Subscriptions */}
        <SectionHeader title="Active Subscriptions" />
        <View style={styles.padded}>
          {activeSubs.map((sub) => {
            const daysUntil = getDaysUntil(sub.renewalDate);
            return (
              <Card key={sub.id} style={styles.subCard}>
                <View style={styles.subRow}>
                  <View style={[styles.subIcon, { backgroundColor: colors.primary + '15' }]}>
                    <MaterialCommunityIcons
                      name={(SubscriptionIcons[sub.name] || SubscriptionIcons.Default) as any}
                      size={22}
                      color={colors.primary}
                    />
                  </View>
                  <View style={styles.subContent}>
                    <Text style={[styles.subName, { color: colors.text }]}>{sub.name}</Text>
                    <Text style={[styles.subMeta, { color: colors.textTertiary }]}>
                      {SubscriptionCategoryLabels[sub.category]} · {sub.billingCycle}
                    </Text>
                    <Text style={[styles.subRenewal, { color: daysUntil <= 5 ? colors.warning : colors.textTertiary }]}>
                      Renews {getDaysLabel(daysUntil).toLowerCase()}
                    </Text>
                  </View>
                  <Text style={[styles.subAmount, { color: colors.text }]}>
                    {formatCurrency(sub.amount)}
                  </Text>
                </View>
              </Card>
            );
          })}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  padded: { paddingHorizontal: Theme.spacing.xl },
  totalLabel: {
    fontSize: Theme.fontSize.sm,
    color: 'rgba(255,255,255,0.7)',
  },
  totalValue: {
    fontSize: Theme.fontSize['5xl'],
    fontWeight: Theme.fontWeight.extrabold,
    color: '#FFFFFF',
    marginTop: 4,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Theme.spacing.sm,
    gap: Theme.spacing.sm,
  },
  totalSub: {
    fontSize: Theme.fontSize.sm,
    color: 'rgba(255,255,255,0.6)',
  },
  warningBadge: {
    backgroundColor: 'rgba(253,203,110,0.3)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Theme.borderRadius.sm,
  },
  warningText: {
    fontSize: Theme.fontSize.xs,
    fontWeight: Theme.fontWeight.semibold,
    color: '#FFEAA7',
  },
  subCard: {
    marginBottom: Theme.spacing.sm,
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subIcon: {
    width: 44,
    height: 44,
    borderRadius: Theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Theme.spacing.md,
  },
  subContent: { flex: 1 },
  subName: {
    fontSize: Theme.fontSize.lg,
    fontWeight: Theme.fontWeight.semibold,
  },
  subMeta: {
    fontSize: Theme.fontSize.sm,
    marginTop: 2,
  },
  subRenewal: {
    fontSize: Theme.fontSize.xs,
    marginTop: 2,
  },
  subRight: { alignItems: 'flex-end' },
  subAmount: {
    fontSize: Theme.fontSize.xl,
    fontWeight: Theme.fontWeight.bold,
  },
  cancelBtn: {
    fontSize: Theme.fontSize.sm,
    fontWeight: Theme.fontWeight.semibold,
    marginTop: 4,
  },
});
