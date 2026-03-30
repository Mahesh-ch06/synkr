import { ClerkProvider, ClerkLoaded, useAuth } from '@clerk/expo';
import { tokenCache } from '@clerk/expo/token-cache';
import { Stack, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../hooks/useTheme';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { useExpenseStore } from '../store/expenseStore';
import { useBillStore } from '../store/billStore';
import { useGroceryStore } from '../store/groceryStore';
import { useSubscriptionStore } from '../store/subscriptionStore';
const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error('Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in .env');
}

function AuthRedirect({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded, userId } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();
  const { colors } = useTheme();

  useEffect(() => {
    // Only fire the redirect if both Clerk and the Navigation Root are fully mounted
    if (!isLoaded || !rootNavigationState?.key) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (isSignedIn && userId) {
      // Sync user to stores and fetch remote
      useAuthStore.getState().setUserId(userId);
      useExpenseStore.getState().fetchExpenses();
      useBillStore.getState().fetchBills();
      useGroceryStore.getState().fetchItems();
      useSubscriptionStore.getState().fetchSubscriptions();
      
      // Signed in but on auth screen → redirect to main app
      if (inAuthGroup) {
        router.replace('/(tabs)');
      }
    } else if (!isSignedIn) {
      useAuthStore.getState().setUserId(null);
      
      // Not signed in and not on auth screen → redirect to login
      if (!inAuthGroup) {
        router.replace('/(auth)/login');
      }
    }
  }, [isSignedIn, isLoaded, segments, userId, rootNavigationState?.key]);

  if (!isLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return <>{children}</>;
}

export default function RootLayout() {
  const { colors, isDark } = useTheme();

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <ClerkLoaded>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <AuthRedirect>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.background },
              animation: 'slide_from_right',
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="bills" options={{ headerShown: false }} />
            <Stack.Screen name="subscriptions" options={{ headerShown: false }} />
            <Stack.Screen name="recharge" options={{ headerShown: false }} />
            <Stack.Screen name="grocery" options={{ headerShown: false }} />
            <Stack.Screen name="analytics" options={{ headerShown: false }} />
          </Stack>
        </AuthRedirect>
      </ClerkLoaded>
    </ClerkProvider>
  );
}
