import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { Theme } from '../../constants/theme';
import { View, StyleSheet, Platform } from 'react-native';

export default function TabLayout() {
  const { colors, isDark } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.tabBarActive,
        tabBarInactiveTintColor: colors.tabBarInactive,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.tabBarBorder,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 88 : 65,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
          ...Theme.shadow.lg,
        },
        tabBarLabelStyle: {
          fontSize: Theme.fontSize.xs,
          fontWeight: Theme.fontWeight.semibold,
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? [styles.activeTab, { backgroundColor: color + '15' }] : undefined}>
              <MaterialCommunityIcons
                name={focused ? 'home' : 'home-outline'}
                size={24}
                color={color}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="bills"
        options={{
          title: 'Bills',
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? [styles.activeTab, { backgroundColor: color + '15' }] : undefined}>
              <MaterialCommunityIcons
                name={focused ? 'receipt' : 'receipt'}
                size={24}
                color={color}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="expenses"
        options={{
          title: 'Expenses',
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? [styles.activeTab, { backgroundColor: color + '15' }] : undefined}>
              <MaterialCommunityIcons
                name={focused ? 'wallet' : 'wallet-outline'}
                size={24}
                color={color}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? [styles.activeTab, { backgroundColor: color + '15' }] : undefined}>
              <MaterialCommunityIcons
                name={focused ? 'account-circle' : 'account-circle-outline'}
                size={24}
                color={color}
              />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  activeTab: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: Theme.borderRadius.full,
  },
});
