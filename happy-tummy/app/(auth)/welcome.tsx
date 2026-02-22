import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { Colors, FontFamily, Shadow, Radius } from '@/constants/theme';

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.bg}>

        {/* Decorative blobs */}
        <View style={styles.blob1} />
        <View style={styles.blob2} />

        {/* Logo */}
        <View style={styles.logoWrap}>
          <Text style={styles.logoEmoji}>🍼</Text>
        </View>

        {/* App name */}
        <Text style={styles.appName}>Happy Tummy</Text>
        <Text style={styles.tagline}>
          Your baby's digestive health,{'\n'}made simple & stress-free
        </Text>

        {/* Buttons */}
        <View style={styles.btnGroup}>
          <TouchableOpacity
            style={styles.btnWhite}
            onPress={() => router.push('/(auth)/signup')}
            activeOpacity={0.85}
          >
            <Text style={styles.btnWhiteText}>Get Started!</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btnGhost}
            onPress={() => router.push('/(auth)/login')}
            activeOpacity={0.85}
          >
            <Text style={styles.btnGhostText}>I already have an account</Text>
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.red,
  },
  bg: {
    flex: 1,
    backgroundColor: Colors.red,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    overflow: 'hidden',
  },

  // Blobs
  blob1: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(255,255,255,0.07)',
    top: -60,
    right: -60,
  },
  blob2: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.05)',
    bottom: 80,
    left: -40,
  },

  // Logo
  logoWrap: {
    width: 110,
    height: 110,
    backgroundColor: Colors.white,
    borderRadius: 34,
    borderWidth: 4,
    borderColor: Colors.outline,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    ...Shadow.lg,
  },
  logoEmoji: { fontSize: 52 },

  // Text
  appName: {
    fontFamily: FontFamily.display,
    fontSize: 38,
    color: Colors.white,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
    marginBottom: 8,
  },
  tagline: {
    fontFamily: FontFamily.body,
    fontSize: 15,
    color: 'rgba(255,255,255,0.82)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  stars: {
    fontSize: 22,
    letterSpacing: 4,
    marginBottom: 6,
  },
  social: {
    fontFamily: FontFamily.body,
    fontSize: 12,
    color: 'rgba(255,255,255,0.65)',
    marginBottom: 52,
  },

  // Buttons
  btnGroup: {
    width: '100%',
    gap: 12,
  },
  btnWhite: {
    width: '100%',
    paddingVertical: 15,
    backgroundColor: Colors.white,
    borderRadius: Radius.pill,
    borderWidth: 3,
    borderColor: Colors.outline,
    alignItems: 'center',
    ...Shadow.md,
  },
  btnWhiteText: {
    fontFamily: FontFamily.bodyBold,
    fontSize: 16,
    color: Colors.gray900,
  },
  btnGhost: {
    width: '100%',
    paddingVertical: 15,
    backgroundColor: 'transparent',
    borderRadius: Radius.pill,
    borderWidth: 2.5,
    borderColor: 'rgba(255,255,255,0.45)',
    alignItems: 'center',
  },
  btnGhostText: {
    fontFamily: FontFamily.body,
    fontSize: 15,
    color: 'rgba(255,255,255,0.9)',
  },
});