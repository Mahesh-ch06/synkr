import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../../hooks/useTheme';
import { Theme } from '../../constants/theme';
import { useExpenseStore } from '../../store/expenseStore';
import { Header, InputField } from '../../components/ui/SharedComponents';
import { ExpenseCategory, ExpenseCategoryLabels, ExpenseCategoryIcons } from '../../models/expense';
import { CategoryColors } from '../../constants/colors';
import { generateId } from '../../utils/helpers';
import { format } from 'date-fns';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const categories: ExpenseCategory[] = [
  'food', 'travel', 'shopping', 'groceries', 'health', 'education', 'entertainment', 'bills', 'rent', 'other',
];

export default function AddExpenseScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { addExpense } = useExpenseStore();

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('food');
  const [notes, setNotes] = useState('');

  const handleSave = () => {
    if (!title.trim() || !amount.trim()) {
      Alert.alert('Error', 'Please fill in title and amount');
      return;
    }

    addExpense({
      id: generateId(),
      title: title.trim(),
      amount: parseFloat(amount),
      category,
      date: format(new Date(), 'yyyy-MM-dd'),
      notes: notes.trim() || undefined,
      isRecurring: false,
      createdAt: new Date().toISOString(),
    });

    router.back();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Add Expense" showBack onBack={() => router.back()} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <InputField label="Title" value={title} onChangeText={setTitle} placeholder="e.g. Zomato - Dinner" icon="receipt" />

        <InputField label="Amount" value={amount} onChangeText={setAmount} placeholder="0" keyboardType="numeric" prefix="₹" />

        {/* Category Grid */}
        <Text style={[styles.label, { color: colors.textSecondary }]}>Category</Text>
        <View style={styles.catGrid}>
          {categories.map((cat) => {
            const catColor = CategoryColors[cat] || colors.primary;
            const isSelected = category === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.catItem,
                  {
                    backgroundColor: isSelected ? catColor + '20' : colors.surfaceElevated,
                    borderColor: isSelected ? catColor : colors.border,
                  },
                ]}
                onPress={() => setCategory(cat)}
              >
                <MaterialCommunityIcons
                  name={ExpenseCategoryIcons[cat] as any}
                  size={22}
                  color={isSelected ? catColor : colors.textTertiary}
                />
                <Text
                  style={[
                    styles.catText,
                    { color: isSelected ? catColor : colors.textSecondary },
                  ]}
                  numberOfLines={1}
                >
                  {ExpenseCategoryLabels[cat].split(' ')[0]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <InputField label="Notes (optional)" value={notes} onChangeText={setNotes} placeholder="Add any notes..." icon="note-text-outline" multiline />

        <TouchableOpacity activeOpacity={0.8} onPress={handleSave} style={styles.saveBtn}>
          <LinearGradient
            colors={colors.gradientAccent as [string, string]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.saveBtnGradient}
          >
            <MaterialCommunityIcons name="wallet-plus" size={22} color="#FFF" />
            <Text style={styles.saveBtnText}>Add Expense</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Theme.spacing.xl, paddingBottom: 40 },
  label: {
    fontSize: Theme.fontSize.sm,
    fontWeight: Theme.fontWeight.medium,
    marginBottom: 8,
  },
  catGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.sm,
    marginBottom: Theme.spacing.xl,
  },
  catItem: {
    width: '31%',
    alignItems: 'center',
    paddingVertical: Theme.spacing.md,
    borderRadius: Theme.borderRadius.xl,
    borderWidth: 1,
    gap: 6,
  },
  catText: {
    fontSize: Theme.fontSize.xs,
    fontWeight: Theme.fontWeight.semibold,
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
