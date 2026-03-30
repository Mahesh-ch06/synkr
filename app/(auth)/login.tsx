import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSignIn } from '@clerk/expo';
import { useTheme } from '../../hooks/useTheme';
import { Theme } from '../../constants/theme';
import { InputField } from '../../components/ui/SharedComponents';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const { signIn, isLoaded, setActive } = useSignIn();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);



  const handleLogin = useCallback(async () => {
    if (!signIn) return;
    if (!email || !password) {
      Alert.alert('Missing Info', 'Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
      } else {
        Alert.alert('Sign In', 'Additional verification may be required.');
      }
    } catch (err: any) {
      const message = err?.errors?.[0]?.longMessage || err?.errors?.[0]?.message || err?.message || 'Sign in failed. Please try again.';
      Alert.alert('Sign In Error', message);
    } finally {
      setLoading(false);
    }
  }, [signIn, setActive, email, password]);

  return (
    <LinearGradient
      colors={isDark ? ['#050511', '#1A1A2E', '#24243E'] : ['#8A2387', '#E94057', '#F27121']}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scrollContent}>
            
            {/* Logo & Branding */}
            <View style={styles.branding}>
              <View style={styles.logoBlurWrapper}>
                <View style={styles.logoContainer}>
                  <MaterialCommunityIcons name="lightning-bolt-circle" size={56} color="#FFFFFF" />
                </View>
              </View>
              <Text style={styles.appName}>Synkr</Text>
              <Text style={styles.tagline}>Advanced Lifestyle Orchestration</Text>
            </View>

            {/* Login Form */}
            <View style={[styles.formCard, { backgroundColor: isDark ? 'rgba(30, 30, 45, 0.85)' : 'rgba(255, 255, 255, 0.95)' }]}>
              <Text style={[styles.formTitle, { color: isDark ? '#FFF' : '#1A1A2E' }]}>Welcome Back</Text>
              <Text style={[styles.formSubtitle, { color: isDark ? 'rgba(255,255,255,0.6)' : '#666' }]}>
                Login to access your ecosystem
              </Text>

              <InputField
                label="Email Address"
                value={email}
                onChangeText={setEmail}
                placeholder="hello@synkr.app"
                keyboardType="email-address"
                icon="email-outline"
              />

              <InputField
                label="Password"
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                icon="lock-outline"
              />

              <TouchableOpacity style={styles.forgotBtn}>
                <Text style={[styles.forgotText, { color: '#E94057' }]}>Recover Password</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                activeOpacity={0.9} 
                onPress={handleLogin} 
                disabled={loading}
                style={styles.loginBtnOuter}
              >
                <LinearGradient
                  colors={['#E94057', '#8A2387']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.loginBtn}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Text style={styles.loginBtnText}>Secure Sign In</Text>
                      <MaterialCommunityIcons name="arrow-right" size={20} color="#FFFFFF" style={{ marginLeft: 8 }} />
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Sign Up */}
              <View style={styles.signupRow}>
                <Text style={[styles.signupText, { color: isDark ? 'rgba(255,255,255,0.5)' : '#888' }]}>
                  New to Synkr?{' '}
                </Text>
                <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
                  <Text style={[styles.signupLink, { color: '#E94057' }]}>Create an Account</Text>
                </TouchableOpacity>
              </View>
            </View>

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1 },
  keyboardView: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Theme.spacing.xl,
  },
  branding: {
    alignItems: 'center',
    marginBottom: Theme.spacing['4xl'],
  },
  logoBlurWrapper: {
    padding: 4,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginBottom: Theme.spacing.lg,
  },
  logoContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: {
    fontSize: Theme.fontSize['6xl'],
    fontWeight: Theme.fontWeight.extrabold,
    color: '#FFFFFF',
    letterSpacing: 3,
  },
  tagline: {
    fontSize: Theme.fontSize.md,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 6,
    letterSpacing: 0.5,
  },
  formCard: {
    borderRadius: Theme.borderRadius['3xl'],
    padding: Theme.spacing['3xl'],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.15,
    shadowRadius: 30,
    elevation: 10,
  },
  formTitle: {
    fontSize: Theme.fontSize['3xl'],
    fontWeight: Theme.fontWeight.bold,
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  formSubtitle: {
    fontSize: Theme.fontSize.md,
    marginBottom: Theme.spacing['2xl'],
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: Theme.spacing['2xl'],
    marginTop: -4,
  },
  forgotText: {
    fontSize: Theme.fontSize.sm,
    fontWeight: Theme.fontWeight.bold,
  },
  loginBtnOuter: {
    shadowColor: '#E94057',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  loginBtn: {
    flexDirection: 'row',
    paddingVertical: Theme.spacing.xl,
    borderRadius: Theme.borderRadius['2xl'],
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginBtnText: {
    color: '#FFFFFF',
    fontSize: Theme.fontSize.lg,
    fontWeight: Theme.fontWeight.bold,
    letterSpacing: 0.5,
  },
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Theme.spacing['2xl'],
  },
  signupText: {
    fontSize: Theme.fontSize.md,
  },
  signupLink: {
    fontSize: Theme.fontSize.md,
    fontWeight: Theme.fontWeight.bold,
  },
});
