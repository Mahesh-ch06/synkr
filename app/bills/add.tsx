import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '../../hooks/useTheme';
import { Theme } from '../../constants/theme';
import { useBillStore } from '../../store/billStore';
import { Header, InputField, Chip } from '../../components/ui/SharedComponents';
import { Card } from '../../components/cards/Card';
import { BillCategory, BillCategoryLabels, BillCategoryIcons } from '../../models/bill';
import { generateId } from '../../utils/helpers';
import { format, addDays } from 'date-fns';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const categories: BillCategory[] = [
  'electricity', 'rent', 'wifi', 'ott', 'insurance', 'water', 'gas', 'phone', 'education', 'other',
];

export default function AddBillScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ billId?: string }>();
  const { bills, addBill, updateBill, deleteBill } = useBillStore();

  const existingBill = params.billId ? bills.find((b) => b.id === params.billId) : undefined;
  const isEditing = !!existingBill;

  const [name, setName] = useState(existingBill?.name || '');
  const [amount, setAmount] = useState(existingBill?.amount?.toString() || '');
  const [category, setCategory] = useState<BillCategory>(existingBill?.category || 'electricity');
  const [isAutopay, setIsAutopay] = useState(existingBill?.isAutopay || false);
  const [isRecurring, setIsRecurring] = useState(existingBill?.isRecurring ?? true);
  const [notes, setNotes] = useState(existingBill?.notes || '');

  const handleSave = () => {
    if (!name.trim() || !amount.trim()) {
      Alert.alert('Error', 'Please fill in name and amount');
      return;
    }

    const billData = {
      id: existingBill?.id || generateId(),
      name: name.trim(),
      amount: parseFloat(amount),
      dueDate: existingBill?.dueDate || format(addDays(new Date(), 15), 'yyyy-MM-dd'),
      category,
      isAutopay,
      isRecurring,
      recurringInterval: 'monthly' as const,
      status: existingBill?.status || 'pending' as const,
      remindDaysBefore: 3,
      notes: notes.trim() || undefined,
      createdAt: existingBill?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (isEditing) {
      updateBill(existingBill!.id, billData);
    } else {
      addBill(billData);
    }
    router.back();
  };

  const handleDelete = () => {
    Alert.alert('Delete Bill', 'Are you sure you want to delete this bill?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteBill(existingBill!.id);
          router.back();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title={isEditing ? 'Edit Bill' : 'Add Bill'}
        showBack
        onBack={() => router.back()}
        rightIcon={isEditing ? 'delete' : undefined}
        onRightPress={isEditing ? handleDelete : undefined}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <InputField
          label="Bill Name"
          value={name}
          onChangeText={setName}
          placeholder="e.g. Electricity - BESCOM"
          icon="receipt"
        />

        <InputField
          label="Amount"
          value={amount}
          onChangeText={setAmount}
          placeholder="0"
          keyboardType="numeric"
          prefix="₹"
        />

        {/* Category Selection */}
        <Text style={[styles.label, { color: colors.textSecondary }]}>Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catRow}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.catItem,
                {
                  backgroundColor: category === cat ? colors.primary + '20' : colors.surfaceElevated,
                  borderColor: category === cat ? colors.primary : colors.border,
                },
              ]}
              onPress={() => setCategory(cat)}
            >
              <MaterialCommunityIcons
                name={BillCategoryIcons[cat] as any}
                size={20}
                color={category === cat ? colors.primary : colors.textSecondary}
              />
              <Text
                style={[
                  styles.catText,
                  { color: category === cat ? colors.primary : colors.textSecondary },
                ]}
              >
                {BillCategoryLabels[cat]}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Toggles */}
        <View style={styles.togglesContainer}>
          <TouchableOpacity
            style={[styles.toggleCard, { backgroundColor: colors.card, borderColor: isAutopay ? colors.success : colors.cardBorder }]}
            onPress={() => setIsAutopay(!isAutopay)}
          >
            <MaterialCommunityIcons
              name={isAutopay ? 'check-circle' : 'circle-outline'}
              size={24}
              color={isAutopay ? colors.success : colors.textTertiary}
            />
            <View style={styles.toggleInfo}>
              <Text style={[styles.toggleTitle, { color: colors.text }]}>Autopay</Text>
              <Text style={[styles.toggleDesc, { color: colors.textTertiary }]}>Automatic payment enabled</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toggleCard, { backgroundColor: colors.card, borderColor: isRecurring ? colors.primary : colors.cardBorder }]}
            onPress={() => setIsRecurring(!isRecurring)}
          >
            <MaterialCommunityIcons
              name={isRecurring ? 'check-circle' : 'circle-outline'}
              size={24}
              color={isRecurring ? colors.primary : colors.textTertiary}
            />
            <View style={styles.toggleInfo}>
              <Text style={[styles.toggleTitle, { color: colors.text }]}>Recurring</Text>
              <Text style={[styles.toggleDesc, { color: colors.textTertiary }]}>Repeats every month</Text>
            </View>
          </TouchableOpacity>
        </View>

        <InputField
          label="Notes (optional)"
          value={notes}
          onChangeText={setNotes}
          placeholder="Add any notes..."
          icon="note-text-outline"
          multiline
        />

        {/* Save Button */}
        <TouchableOpacity activeOpacity={0.8} onPress={handleSave} style={styles.saveBtn}>
          <LinearGradient
            colors={colors.gradient as [string, string]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.saveBtnGradient}
          >
            <MaterialCommunityIcons name={isEditing ? 'check' : 'plus'} size={22} color="#FFF" />
            <Text style={styles.saveBtnText}>{isEditing ? 'Update Bill' : 'Add Bill'}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    padding: Theme.spacing.xl,
    paddingBottom: 40,
  },
  label: {
    fontSize: Theme.fontSize.sm,
    fontWeight: Theme.fontWeight.medium,
    marginBottom: 8,
  },
  catRow: {
    marginBottom: Theme.spacing.xl,
  },
  catItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.full,
    borderWidth: 1,
    marginRight: Theme.spacing.sm,
    gap: 6,
  },
  catText: {
    fontSize: Theme.fontSize.sm,
    fontWeight: Theme.fontWeight.medium,
  },
  togglesContainer: {
    flexDirection: 'row',
    gap: Theme.spacing.md,
    marginBottom: Theme.spacing.xl,
  },
  toggleCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.xl,
    borderWidth: 1,
    gap: Theme.spacing.md,
  },
  toggleInfo: {},
  toggleTitle: {
    fontSize: Theme.fontSize.md,
    fontWeight: Theme.fontWeight.semibold,
  },
  toggleDesc: {
    fontSize: Theme.fontSize.xs,
    marginTop: 2,
  },
  saveBtn: {
    marginTop: Theme.spacing.xl,
    ...Theme.shadow.lg,
  },
  saveBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.xl,
    gap: 8,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: Theme.fontSize.lg,
    fontWeight: Theme.fontWeight.bold,
  },
});
