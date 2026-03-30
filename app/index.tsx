import { Redirect } from 'expo-router';
import { useAuth } from '@clerk/expo';
import { View, ActivityIndicator } from 'react-native';
import { useTheme } from '../hooks/useTheme';

export default function Index() {
  const { isLoaded, isSignedIn } = useAuth();
  const { colors } = useTheme();

  // Show a blank loading screen while Clerk initializes
  if (!isLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Once initialized, route to either the tabs or login immediately.
  // We use <Redirect> for an instantaneous, flash-free routing step for `/` root.
  if (isSignedIn) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/(auth)/login" />;
}
