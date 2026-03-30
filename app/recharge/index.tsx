import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../hooks/useTheme';
import { Theme } from '../../constants/theme';
import { Card } from '../../components/cards/Card';
import { Header, SectionHeader } from '../../components/ui/SharedComponents';
import { PopularPlans } from '../../models/recharge';
import { estimateDataExhaustion } from '../../services/smartEngine/predictions';
import { formatCurrency, getPercentage } from '../../utils/helpers';

export default function RechargeScreen() {
  const { colors, isDark } = useTheme();
  const router = useRouter();

  // Simulated current plan state
  const [currentPlan] = useState({
    provider: 'Jio',
    amount: 299,
    validity: 28,
    dataPerDay: 2,
    totalData: 56,
    rechargeDate: '2026-03-18',
    dataUsedGB: 24,
    daysElapsed: 12,
  });

  const estimation = estimateDataExhaustion(
    currentPlan.totalData,
    currentPlan.dataUsedGB,
    currentPlan.validity,
    currentPlan.daysElapsed
  );

  const daysRemaining = currentPlan.validity - currentPlan.daysElapsed;
  const dataRemaining = currentPlan.totalData - currentPlan.dataUsedGB;
  const dataUsedPercent = getPercentage(currentPlan.dataUsedGB, currentPlan.totalData);

  const openUPI = (app: string) => {
    const urls: Record<string, string> = {
      gpay: 'https://pay.google.com',
      phonepe: 'https://phonepe.com',
    };
    Linking.openURL(urls[app] || urls.gpay).catch(() => {});
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Recharge Tracker" showBack onBack={() => router.back()} />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Current Plan */}
        <View style={styles.padded}>
          <Card gradient gradientColors={isDark ? ['#1A1A3E', '#302B63'] : ['#FDCB6E', '#F8A500']}>
            <View style={styles.planHeader}>
              <View>
                <Text style={styles.planProvider}>{currentPlan.provider}</Text>
                <Text style={styles.planAmount}>{formatCurrency(currentPlan.amount)} Plan</Text>
              </View>
              <View style={[styles.validityBadge]}>
                <Text style={styles.validityText}>{daysRemaining} days left</Text>
              </View>
            </View>

            {/* Data Usage */}
            <View style={styles.dataSection}>
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Data Used</Text>
                <Text style={styles.dataValue}>{currentPlan.dataUsedGB}GB / {currentPlan.totalData}GB</Text>
              </View>
              <View style={styles.progressBg}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${dataUsedPercent}%`,
                      backgroundColor: dataUsedPercent > 80 ? '#FF6B6B' : '#FFFFFF',
                    },
                  ]}
                />
              </View>
              <Text style={styles.dataRemaining}>{dataRemaining}GB remaining</Text>
            </View>

            {/* Stats */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Daily Usage</Text>
                <Text style={styles.statValue}>{estimation.dailyUsageGB.toFixed(1)}GB/day</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Data Per Day</Text>
                <Text style={styles.statValue}>{currentPlan.dataPerDay}GB/day</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Est. Exhaustion</Text>
                <Text style={[styles.statValue, estimation.willExhaustEarly && { color: '#FF6B6B' }]}>
                  {estimation.estimatedDaysLeft}d
                </Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Smart Alert */}
        {estimation.willExhaustEarly && (
          <View style={styles.padded}>
            <Card style={{ borderLeftColor: colors.error, borderLeftWidth: 3 }}>
              <View style={styles.alertRow}>
                <MaterialCommunityIcons name="alert" size={24} color={colors.error} />
                <View style={styles.alertContent}>
                  <Text style={[styles.alertTitle, { color: colors.error }]}>Data running low!</Text>
                  <Text style={[styles.alertMsg, { color: colors.textSecondary }]}>
                    At current usage, your data will exhaust {estimation.estimatedDaysLeft} days before plan expiry. Consider recharging early.
                  </Text>
                </View>
              </View>
            </Card>
          </View>
        )}

        {/* Quick Recharge */}
        <SectionHeader title="Quick Recharge" />
        <View style={styles.upiRow}>
          <TouchableOpacity
            style={[styles.upiBtn, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
            onPress={() => openUPI('gpay')}
          >
            <MaterialCommunityIcons name="google" size={24} color="#4285F4" />
            <Text style={[styles.upiBtnText, { color: colors.text }]}>Google Pay</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.upiBtn, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
            onPress={() => openUPI('phonepe')}
          >
            <MaterialCommunityIcons name="cellphone" size={24} color="#5F259F" />
            <Text style={[styles.upiBtnText, { color: colors.text }]}>PhonePe</Text>
          </TouchableOpacity>
        </View>

        {/* Suggested Plans */}
        <SectionHeader title="Suggested Plans" />
        <View style={styles.padded}>
          {PopularPlans.map((plan) => (
            <Card key={plan.id} style={styles.planCard}>
              <View style={styles.planRow}>
                <View style={styles.planInfo}>
                  <View style={styles.planNameRow}>
                    <Text style={[styles.planName, { color: colors.text }]}>{plan.provider}</Text>
                    {plan.isPopular && (
                      <View style={[styles.popularBadge, { backgroundColor: colors.success + '20' }]}>
                        <Text style={[styles.popularText, { color: colors.success }]}>Popular</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.planDetails, { color: colors.textSecondary }]}>
                    {plan.dataPerDay}GB/day · {plan.validity} days · {plan.calls}
                  </Text>
                </View>
                <View style={styles.planPricing}>
                  <Text style={[styles.planPrice, { color: colors.primary }]}>{formatCurrency(plan.amount)}</Text>
                  <Text style={[styles.planTotal, { color: colors.textTertiary }]}>{plan.totalData}GB total</Text>
                </View>
              </View>
            </Card>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  padded: { paddingHorizontal: Theme.spacing.xl },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  planProvider: {
    fontSize: Theme.fontSize.sm,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: Theme.fontWeight.medium,
  },
  planAmount: {
    fontSize: Theme.fontSize['3xl'],
    fontWeight: Theme.fontWeight.extrabold,
    color: '#FFFFFF',
    marginTop: 2,
  },
  validityBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Theme.borderRadius.full,
  },
  validityText: {
    fontSize: Theme.fontSize.sm,
    fontWeight: Theme.fontWeight.semibold,
    color: '#FFFFFF',
  },
  dataSection: { marginTop: Theme.spacing.xl },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dataLabel: { fontSize: Theme.fontSize.sm, color: 'rgba(255,255,255,0.6)' },
  dataValue: { fontSize: Theme.fontSize.sm, color: '#FFFFFF', fontWeight: Theme.fontWeight.semibold },
  progressBg: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  progressFill: { height: '100%', borderRadius: 4 },
  dataRemaining: {
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
  },
  statItem: { flex: 1, alignItems: 'center' },
  statLabel: { fontSize: Theme.fontSize.xs, color: 'rgba(255,255,255,0.6)' },
  statValue: { fontSize: Theme.fontSize.md, fontWeight: Theme.fontWeight.bold, color: '#FFFFFF', marginTop: 4 },
  alertRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Theme.spacing.md },
  alertContent: { flex: 1 },
  alertTitle: { fontSize: Theme.fontSize.md, fontWeight: Theme.fontWeight.semibold },
  alertMsg: { fontSize: Theme.fontSize.sm, marginTop: 4, lineHeight: 20 },
  upiRow: {
    flexDirection: 'row',
    paddingHorizontal: Theme.spacing.xl,
    gap: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
  },
  upiBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.xl,
    borderWidth: 1,
    gap: 8,
  },
  upiBtnText: { fontSize: Theme.fontSize.md, fontWeight: Theme.fontWeight.semibold },
  planCard: { marginBottom: Theme.spacing.sm },
  planRow: { flexDirection: 'row', alignItems: 'center' },
  planInfo: { flex: 1 },
  planNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  planName: { fontSize: Theme.fontSize.lg, fontWeight: Theme.fontWeight.semibold },
  popularBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: Theme.borderRadius.sm },
  popularText: { fontSize: Theme.fontSize.xs, fontWeight: Theme.fontWeight.bold },
  planDetails: { fontSize: Theme.fontSize.sm, marginTop: 4 },
  planPricing: { alignItems: 'flex-end' },
  planPrice: { fontSize: Theme.fontSize.xl, fontWeight: Theme.fontWeight.bold },
  planTotal: { fontSize: Theme.fontSize.xs, marginTop: 2 },
});
