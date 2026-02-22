import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Colors, FontFamily, Shadow, Radius } from '@/constants/theme';
import { AppButton } from '@/components/shared/AppButton';
import { loginUser, registerUser } from '@/lib/api';
import { setAccessToken } from '@/lib/session';

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (loading) return;
    setError('');
    setLoading(true);

    try {
      await registerUser({ first_name: name, username, password });
      const token = await loginUser({ username, password });
      setAccessToken(token.access_token);
      router.replace('/(onboarding)/mom-profile');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Signup failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        {/* Red wave header */}
        <View style={styles.header}>
          <Text style={styles.headerEmoji}></Text>
          <Text style={styles.headerTitle}>Join{'\n'}Happy Tummy!</Text>
          <Text style={styles.headerSub}>Set up your account in 2 minutes</Text>
        </View>

        {/* Wave curve */}
        <View style={styles.wave} />

        <ScrollView
          contentContainerStyle={styles.body}
          keyboardShouldPersistTaps="handled"
        >
          {/* First name */}
          <View>
            <Text style={styles.label}>FIRST NAME</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="e.g. Sarah"
              placeholderTextColor={Colors.gray500}
            />
          </View>

          {/* Username */}
          <View>
            <Text style={styles.label}>USERNAME</Text>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholder="choose a username"
              placeholderTextColor={Colors.gray500}
              autoCapitalize="none"
            />
          </View>

          {/* Email */}
          <View>
            <Text style={styles.label}>EMAIL</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="your@email.com"
              placeholderTextColor={Colors.gray500}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Password */}
          <View>
            <Text style={styles.label}>PASSWORD</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="min. 8 characters"
              placeholderTextColor={Colors.gray500}
              secureTextEntry
            />
          </View>

          {/* Create account button */}
          <AppButton
            label={loading ? 'Creating Account...' : 'Create Account'}
            variant="red"
            onPress={handleSignup}
            style={{ marginTop: 8 }}
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {/* Sign in link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text style={styles.footerLink}>Sign in</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.cream,
  },

  // Header
  header: {
    backgroundColor: Colors.red,
    paddingTop: 20,
    paddingHorizontal: 24,
    paddingBottom: 48,
  },
  headerEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  headerTitle: {
    fontFamily: FontFamily.display,
    fontSize: 28,
    color: Colors.white,
    textShadowColor: 'rgba(0,0,0,0.15)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
    lineHeight: 34,
  },
  headerSub: {
    fontFamily: FontFamily.body,
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 6,
  },

  // Wave curve
  wave: {
    height: 32,
    backgroundColor: Colors.cream,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -28,
  },

  // Body
  body: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 40,
    gap: 16,
  },

  // Input
  label: {
    fontFamily: FontFamily.bodyBlack,
    fontSize: 11,
    letterSpacing: 1,
    color: Colors.gray700,
    marginBottom: 6,
  },
  input: {
    backgroundColor: Colors.white,
    borderWidth: 3,
    borderColor: Colors.outline,
    borderRadius: Radius.lg,
    paddingVertical: 13,
    paddingHorizontal: 16,
    fontFamily: FontFamily.body,
    fontSize: 15,
    color: Colors.gray900,
    ...Shadow.sm,
  },

  // Footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 4,
  },
  footerText: {
    fontFamily: FontFamily.body,
    fontSize: 14,
    color: Colors.gray500,
  },
  footerLink: {
    fontFamily: FontFamily.bodyBold,
    fontSize: 14,
    color: Colors.red,
    textDecorationLine: 'underline',
  },
  errorText: {
    fontFamily: FontFamily.body,
    fontSize: 13,
    color: Colors.redDark,
    textAlign: 'center',
  },
});