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

const AVATARS = ['👩', '👩🏽', '👩🏿', '👩🏻'];

const COMM_STYLES = [
  { label: 'Yes' },
  { label: 'No'},
];

export default function ParentProfileScreen() {
  const [avatar, setAvatar] = useState(0);
  const [name, setName] = useState('');
  const [commStyle, setCommStyle] = useState(0);

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >

        <ScrollView
          contentContainerStyle={styles.body}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Tell us about{'\n'}yourself</Text>
          <Text style={styles.sub}>We'll personalize everything for you</Text>

          {/* Name input */}
          <View>
            <Text style={styles.label}>YOUR FIRST NAME</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="e.g. Sarah"
              placeholderTextColor={Colors.gray500}
            />
          </View>

          {/* first-time parent */}
          <View>
            <Text style={styles.label}>Are you a first-time parent?</Text>
            <View style={styles.radioList}>
              {COMM_STYLES.map((opt, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => setCommStyle(i)}
                  style={[styles.radioCard, commStyle === i && styles.radioCardSel]}
                  activeOpacity={0.8}
                >
                  <View style={[styles.radioDot, commStyle === i && styles.radioDotSel]} />
                  <Text style={styles.radioEmoji}></Text>
                  <Text style={[styles.radioLabel, commStyle === i && styles.radioLabelSel]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>


          <AppButton
            label="Continue →"
            variant="red"
            onPress={() => router.push('/(onboarding)/baby-profile')}
            style={{ marginTop: 8 }}
          />
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

  // Step indicator
  stepWrap: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: Colors.cream,
  },
  segRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 8,
  },
  seg: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    borderWidth: 1.5,
    borderColor: Colors.outline,
    backgroundColor: Colors.gray200,
  },
  segActive: { backgroundColor: Colors.red },
  segDone:  { backgroundColor: Colors.redMid },
  stepInfo: {
    fontFamily: FontFamily.bodyBlack,
    fontSize: 11,
    letterSpacing: 1,
    color: Colors.gray500,
    textTransform: 'uppercase',
  },

  // Body
  body: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
    gap: 18,
  },
  title: {
    fontFamily: FontFamily.display,
    fontSize: 28,
    color: Colors.gray900,
    lineHeight: 34,
  },
  sub: {
    fontFamily: FontFamily.body,
    fontSize: 13,
    color: Colors.gray500,
    marginTop: -10,
  },

  // Avatar picker
  avatarRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  avatarOpt: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.cream2,
    borderWidth: 3,
    borderColor: Colors.gray300,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.gray300,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  avatarOptSel: {
    borderColor: Colors.outline,
    backgroundColor: Colors.redPale,
    ...Shadow.sm,
    transform: [{ scale: 1.1 }],
  },
  avatarEmoji: { fontSize: 26 },

  // Input
  label: {
    fontFamily: FontFamily.bodyBlack,
    fontSize: 11,
    letterSpacing: 1,
    color: Colors.gray700,
    marginBottom: 8,
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

  // Radio cards
  radioList: { gap: 10 },
  radioCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 13,
    paddingHorizontal: 14,
    backgroundColor: Colors.white,
    borderWidth: 3,
    borderColor: Colors.gray300,
    borderRadius: Radius.lg,
    shadowColor: Colors.gray300,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  radioCardSel: {
    borderColor: Colors.outline,
    backgroundColor: Colors.redPale,
    ...Shadow.sm,
  },
  radioDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: Colors.gray300,
    backgroundColor: Colors.white,
  },
  radioDotSel: {
    borderColor: Colors.red,
    backgroundColor: Colors.red,
  },
  radioEmoji: { fontSize: 17 },
  radioLabel: {
    fontFamily: FontFamily.body,
    fontSize: 14,
    color: Colors.gray900,
    flex: 1,
  },
  radioLabelSel: {
    fontFamily: FontFamily.bodyBold,
    color: Colors.redDark,
  },
});