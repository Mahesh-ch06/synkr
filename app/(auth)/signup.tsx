import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSignUp } from '@clerk/expo';
import { useTheme } from '../../hooks/useTheme';
import { Theme } from '../../constants/theme';
import { InputField } from '../../components/ui/SharedComponents';

export default function SignupScreen() {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const { signUp, isLoaded, setActive } = useSignUp();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Verification state
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState('');

  const handleSignup = useCallback(async () => {
    if (!isLoaded || !signUp) return;
    if (!email || !password) {
      Alert.alert('Missing Info', 'Please enter email and password.');
      return;
    }

    setLoading(true);
    try {
      await signUp.create({
        emailAddress: email,
        password,
        firstName: name.split(' ')[0] || undefined,
        lastName: name.split(' ').slice(1).join(' ') || undefined,
      });

      // Send email verification code
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setPendingVerification(true);
    } catch (err: any) {
      const message = err?.errors?.[0]?.longMessage || err?.errors?.[0]?.message || err?.message || 'Sign up failed. Please try again.';
      Alert.alert('Sign Up Error', message);
    } finally {
      setLoading(false);
    }
  }, [isLoaded, signUp, email, password, name]);

  const handleVerification = useCallback(async () => {
    if (!isLoaded || !signUp) return;
    if (!code) {
      Alert.alert('Missing Code', 'Please enter the verification code from your email.');
      return;
    }

    setLoading(true);
    try {
      const result = await signUp.attemptEmailAddressVerification({ code });

      if (result.status === 'complete' && result.createdSessionId) {
        await setActive({ session: result.createdSessionId });
        // AuthRedirect in root layout handles navigation to /(tabs)
      } else {
        // Force navigate — AuthRedirect will pick up the session
        router.replace('/(tabs)');
      }
    } catch (err: any) {
      const message = err?.errors?.[0]?.longMessage || err?.errors?.[0]?.message || err?.message || 'Verification failed. Please try again.';
      Alert.alert('Verification Error', message);
    } finally {
      setLoading(false);
    }
  }, [isLoaded, signUp, code, setActive, router]);

  return (
    <LinearGradient
      colors={isDark ? ['#050511', '#1A1A2E', '#24243E'] : ['#8A2387', '#E94057', '#F27121']}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            <View 
              style={[styles.formCard, { backgroundColor: isDark ? 'rgba(30, 30, 45, 0.85)' : 'rgba(255, 255, 255, 0.95)' }]}
            >
              {!pendingVerification ? (
                <>
                  {/* Sign Up Form */}
                  <View style={styles.headerIcon}>
                    <View style={[styles.iconCircle, { backgroundColor: '#E94057' + '20' }]}>
                      <MaterialCommunityIcons name="account-plus" size={32} color="#E94057" />
                    </View>
                  </View>
                  <Text style={[styles.formTitle, { color: isDark ? '#FFF' : '#1A1A2E' }]}>Create Account</Text>
                  <Text style={[styles.formSubtitle, { color: isDark ? 'rgba(255,255,255,0.6)' : '#666' }]}>
                    Join the future of life management
                  </Text>

                  <InputField label="Full Name" value={name} onChangeText={setName} placeholder="Your name" icon="account-outline" />
                  <InputField label="Email" value={email} onChangeText={setEmail} placeholder="your@email.com" keyboardType="email-address" icon="email-outline" />
                  <InputField label="Password" value={password} onChangeText={setPassword} placeholder="Min 8 characters" icon="lock-outline" />

                  <TouchableOpacity activeOpacity={0.8} onPress={handleSignup} disabled={loading}>
                    <LinearGradient
                      colors={['#E94057', '#8A2387']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={[styles.signupBtn, loading && { opacity: 0.7 }]}
                    >
                      {loading ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <Text style={styles.signupBtnText}>Create Account</Text>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>

                  <View style={styles.loginRow}>
                    <Text style={[styles.loginText, { color: isDark ? 'rgba(255,255,255,0.5)' : '#888' }]}>Already have an account? </Text>
                    <TouchableOpacity onPress={() => router.back()}>
                      <Text style={[styles.loginLink, { color: '#E94057' }]}>Sign In</Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <>
                  {/* Email Verification */}
                  <View style={styles.verifyHeader}>
                    <View style={[styles.verifyIcon, { backgroundColor: '#E94057' + '15' }]}>
                      <MaterialCommunityIcons name="email-check-outline" size={44} color="#E94057" />
                    </View>
                    <Text style={[styles.formTitle, { color: isDark ? '#FFF' : '#1A1A2E', textAlign: 'center' }]}>Verify Email</Text>
                    <Text style={[styles.formSubtitle, { color: isDark ? 'rgba(255,255,255,0.6)' : '#666', textAlign: 'center' }]}>
                      We sent a verification code to{'\n'}
                      <Text style={{ fontWeight: '700' as any, color: isDark ? '#FFF' : '#1A1A2E' }}>{email}</Text>
                    </Text>
                  </View>

                  {/* OTP Input */}
                  <View style={styles.codeContainer}>
                    <TextInput
                      value={code}
                      onChangeText={setCode}
                      placeholder="000000"
                      placeholderTextColor={isDark ? 'rgba(255,255,255,0.2)' : '#ccc'}
                      keyboardType="number-pad"
                      maxLength={6}
                      style={[
                        styles.codeInput,
                        {
                          backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F8F9FA',
                          borderColor: isDark ? 'rgba(255,255,255,0.15)' : '#E0E0E0',
                          color: isDark ? '#FFF' : '#1A1A2E',
                        },
                      ]}
                    />
                  </View>

                  <TouchableOpacity activeOpacity={0.8} onPress={handleVerification} disabled={loading}>
                    <LinearGradient
                      colors={['#E94057', '#8A2387']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={[styles.signupBtn, loading && { opacity: 0.7 }]}
                    >
                      {loading ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <Text style={styles.signupBtnText}>Verify & Continue</Text>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.resendBtn}
                    onPress={async () => {
                      try {
                        await signUp?.prepareEmailAddressVerification({ strategy: 'email_code' });
                        Alert.alert('Code Sent', 'A new verification code has been sent to your email.');
                      } catch (err: any) {
                        Alert.alert('Error', 'Failed to resend code.');
                      }
                    }}
                  >
                    <Text style={[styles.resendText, { color: '#E94057' }]}>Resend Code</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.backBtn}
                    onPress={() => setPendingVerification(false)}
                  >
                    <Text style={[styles.backBtnText, { color: isDark ? 'rgba(255,255,255,0.5)' : '#888' }]}>← Back to Sign Up</Text>
                  </TouchableOpacity>
                </>
              )}
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
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: Theme.spacing.xl },
  formCard: {
    borderRadius: Theme.borderRadius['3xl'],
    padding: Theme.spacing['3xl'],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.15,
    shadowRadius: 30,
    elevation: 10,
  },
  headerIcon: {
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formTitle: { fontSize: Theme.fontSize['3xl'], fontWeight: Theme.fontWeight.bold, marginBottom: 6, textAlign: 'center', letterSpacing: -0.5 },
  formSubtitle: { fontSize: Theme.fontSize.md, marginBottom: Theme.spacing.xl, lineHeight: 22, textAlign: 'center' },
  signupBtn: {
    paddingVertical: Theme.spacing.xl,
    borderRadius: Theme.borderRadius['2xl'],
    alignItems: 'center',
    marginTop: Theme.spacing.md,
    shadowColor: '#E94057',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  signupBtnText: { color: '#FFF', fontSize: Theme.fontSize.lg, fontWeight: Theme.fontWeight.bold, letterSpacing: 0.5 },
  loginRow: { flexDirection: 'row', justifyContent: 'center', marginTop: Theme.spacing.xl },
  loginText: { fontSize: Theme.fontSize.md },
  loginLink: { fontSize: Theme.fontSize.md, fontWeight: Theme.fontWeight.bold },
  verifyHeader: {
    alignItems: 'center',
    marginBottom: Theme.spacing.xl,
  },
  verifyIcon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Theme.spacing.lg,
  },
  codeContainer: {
    marginBottom: Theme.spacing.lg,
  },
  codeInput: {
    fontSize: 32,
    fontWeight: '800' as any,
    textAlign: 'center',
    letterSpacing: 14,
    paddingVertical: Theme.spacing.xl,
    borderRadius: Theme.borderRadius.xl,
    borderWidth: 2,
  },
  resendBtn: {
    alignItems: 'center',
    marginTop: Theme.spacing.lg,
  },
  resendText: {
    fontSize: Theme.fontSize.md,
    fontWeight: Theme.fontWeight.semibold,
  },
  backBtn: {
    alignItems: 'center',
    marginTop: Theme.spacing.md,
  },
  backBtnText: {
    fontSize: Theme.fontSize.md,
  },
});
