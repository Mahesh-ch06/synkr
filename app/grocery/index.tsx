import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../hooks/useTheme';
import { Theme } from '../../constants/theme';
import { useGroceryStore } from '../../store/groceryStore';
import { Card } from '../../components/cards/Card';
import { Header, SectionHeader } from '../../components/ui/SharedComponents';
import { GroceryFrequencyDays } from '../../models/grocery';
import { predictGroceryPurchase } from '../../services/smartEngine/predictions';
import { formatCurrency, getDaysUntil } from '../../utils/helpers';

export default function GroceryScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { items, markPurchased, getDueItems, getUpcomingItems } = useGroceryStore();

  const dueItems = getDueItems();
  const upcomingItems = getUpcomingItems(7);
  const totalEstCost = items.reduce((s, i) => s + (i.estimatedPrice || 0), 0);

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return colors.error;
      case 'medium': return colors.warning;
      default: return colors.success;
    }
  };

  const getFrequencyLabel = (freq: string) => {
    switch (freq) {
      case 'daily': return 'Daily';
      case 'weekly': return 'Weekly';
      case 'biweekly': return 'Bi-weekly';
      case 'monthly': return 'Monthly';
      default: return freq;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Grocery Essentials" showBack onBack={() => router.back()} />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Overview */}
        <View style={styles.padded}>
          <View style={styles.overviewRow}>
            <Card style={styles.overviewCard}>
              <MaterialCommunityIcons name="alert-circle" size={24} color={colors.error} />
              <Text style={[styles.overviewValue, { color: colors.text }]}>{dueItems.length}</Text>
              <Text style={[styles.overviewLabel, { color: colors.textSecondary }]}>Due Now</Text>
            </Card>
            <Card style={styles.overviewCard}>
              <MaterialCommunityIcons name="clock-outline" size={24} color={colors.warning} />
              <Text style={[styles.overviewValue, { color: colors.text }]}>{upcomingItems.length}</Text>
              <Text style={[styles.overviewLabel, { color: colors.textSecondary }]}>This Week</Text>
            </Card>
            <Card style={styles.overviewCard}>
              <MaterialCommunityIcons name="package-variant" size={24} color={colors.success} />
              <Text style={[styles.overviewValue, { color: colors.text }]}>{items.length}</Text>
              <Text style={[styles.overviewLabel, { color: colors.textSecondary }]}>Total Items</Text>
            </Card>
          </View>
        </View>

        {/* Due Items */}
        {dueItems.length > 0 && (
          <>
            <SectionHeader title="🔴 Needs Buying" />
            <View style={styles.padded}>
              {dueItems.map((item) => (
                <Card key={item.id} style={{...styles.itemCard, borderLeftColor: colors.error, borderLeftWidth: 3 }}>
                  <View style={styles.itemRow}>
                    <View style={[styles.itemIcon, { backgroundColor: colors.error + '15' }]}>
                      <MaterialCommunityIcons name="cart-arrow-down" size={22} color={colors.error} />
                    </View>
                    <View style={styles.itemContent}>
                      <Text style={[styles.itemName, { color: colors.text }]}>{item.name}</Text>
                      <View style={styles.itemMeta}>
                        <Text style={[styles.itemFreq, { color: colors.textTertiary }]}>
                          {getFrequencyLabel(item.frequency)} · {item.quantity || ''}
                        </Text>
                        {item.estimatedPrice && (
                          <Text style={[styles.itemPrice, { color: colors.textSecondary }]}>
                            ~{formatCurrency(item.estimatedPrice)}
                          </Text>
                        )}
                      </View>
                    </View>
                    <TouchableOpacity
                      style={[styles.buyBtn, { backgroundColor: colors.success + '15' }]}
                      onPress={() => markPurchased(item.id)}
                    >
                      <MaterialCommunityIcons name="check" size={20} color={colors.success} />
                      <Text style={[styles.buyBtnText, { color: colors.success }]}>Bought</Text>
                    </TouchableOpacity>
                  </View>
                </Card>
              ))}
            </View>
          </>
        )}

        {/* All Items */}
        <SectionHeader title="All Essentials" />
        <View style={styles.padded}>
          {items.map((item) => {
            const prediction = predictGroceryPurchase(item);
            const urgencyColor = getUrgencyColor(prediction.urgency);
            const daysUntil = getDaysUntil(item.nextPurchaseDate);

            return (
              <Card key={item.id} style={styles.itemCard}>
                <View style={styles.itemRow}>
                  <View style={[styles.itemIcon, { backgroundColor: urgencyColor + '15' }]}>
                    <MaterialCommunityIcons name="package-variant-closed" size={22} color={urgencyColor} />
                  </View>
                  <View style={styles.itemContent}>
                    <Text style={[styles.itemName, { color: colors.text }]}>{item.name}</Text>
                    <Text style={[styles.itemFreq, { color: colors.textTertiary }]}>
                      {getFrequencyLabel(item.frequency)} · {item.category}
                    </Text>
                    <Text style={[styles.nextDate, { color: urgencyColor }]}>
                      {daysUntil <= 0 ? 'Due now!' : daysUntil === 1 ? 'Due tomorrow' : `In ${daysUntil} days`}
                    </Text>
                  </View>
                  {item.estimatedPrice && (
                    <Text style={[styles.price, { color: colors.textSecondary }]}>
                      {formatCurrency(item.estimatedPrice)}
                    </Text>
                  )}
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
  overviewRow: {
    flexDirection: 'row',
    gap: Theme.spacing.md,
  },
  overviewCard: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  overviewValue: {
    fontSize: Theme.fontSize['2xl'],
    fontWeight: Theme.fontWeight.bold,
  },
  overviewLabel: {
    fontSize: Theme.fontSize.xs,
  },
  itemCard: { marginBottom: Theme.spacing.sm },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemIcon: {
    width: 44,
    height: 44,
    borderRadius: Theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Theme.spacing.md,
  },
  itemContent: { flex: 1 },
  itemName: {
    fontSize: Theme.fontSize.lg,
    fontWeight: Theme.fontWeight.semibold,
  },
  itemMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  itemFreq: {
    fontSize: Theme.fontSize.sm,
  },
  itemPrice: {
    fontSize: Theme.fontSize.sm,
    fontWeight: Theme.fontWeight.medium,
  },
  nextDate: {
    fontSize: Theme.fontSize.xs,
    fontWeight: Theme.fontWeight.medium,
    marginTop: 2,
  },
  price: {
    fontSize: Theme.fontSize.md,
    fontWeight: Theme.fontWeight.semibold,
  },
  buyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.full,
    gap: 4,
  },
  buyBtnText: {
    fontSize: Theme.fontSize.sm,
    fontWeight: Theme.fontWeight.semibold,
  },
});
