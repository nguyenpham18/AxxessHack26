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
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { setChildDraft } from '@/lib/childDraft';

const AVATARS = [
  { IconComponent: MaterialCommunityIcons, iconName: 'baby-face' as const, color: '#FF6B9D', label: 'Baby Girl' },
  { IconComponent: MaterialCommunityIcons, iconName: 'baby-face-outline' as const, color: '#2196F3', label: 'Baby Boy' }
];

const GENDERS = ['Girl', 'Boy', 'Other'];

export default function BabyProfileScreen() {
  const [avatar, setAvatar] = useState(0);
  const [babyName, setBabyName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState(0);

  const handleContinue = () => {
    setChildDraft({
      name: babyName,
      dob,
      gender: GENDERS[gender],
    });
    router.push('/(onboarding)/baby-details');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        {/* Step indicator */}
        <View style={styles.stepWrap}>
          <View style={styles.segRow}>
            <View style={[styles.seg, styles.segActive]} />
            <View style={styles.seg} />
            <View style={styles.seg} />
          </View>
          <Text style={styles.stepInfo}>Step 1 of 3 · Your Baby</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.body}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Meet your little{'\n'}one!</Text>
          <Text style={styles.sub}>Tell us about your baby</Text>

          {/* Avatar picker */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarRow}>
              {AVATARS.map((avatarData, i) => {
                const IconComponent = avatarData.IconComponent;
                return (
                  <TouchableOpacity
                    key={i}
                    onPress={() => setAvatar(i)}
                    style={[styles.avatarOpt, avatar === i && styles.avatarOptSel]}
                    activeOpacity={0.8}
                  >
                    <IconComponent 
                      name={avatarData.iconName} 
                      size={28} 
                      color={avatarData.color} 
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
            <View style={styles.avatarLabels}>
              {AVATARS.map((avatarData, i) => (
                <Text 
                  key={i} 
                  style={[
                    styles.avatarLabel, 
                    avatar === i && styles.avatarLabelSel
                  ]}
                >
                  {avatarData.label}
                </Text>
              ))}
            </View>
          </View>

          {/* Baby name */}
          <View>
            <Text style={styles.label}>BABY'S NAME</Text>
            <TextInput
              style={styles.input}
              value={babyName}
              onChangeText={setBabyName}
              placeholder="e.g. Maya"
              placeholderTextColor={Colors.gray500}
            />
          </View>

          {/* Date of birth */}
          <View>
            <Text style={styles.label}>DATE OF BIRTH</Text>
            <TextInput
              style={styles.input}
              value={dob}
              onChangeText={setDob}
              placeholder="MM / DD / YYYY"
              placeholderTextColor={Colors.gray500}
              keyboardType="numeric"
            />
          </View>

          {/* Gender */}
          <View>
            <Text style={styles.label}>GENDER</Text>
            <View style={styles.genderRow}>
              {GENDERS.map((g, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => setGender(i)}
                  style={[styles.genderBtn, gender === i && styles.genderBtnSel]}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.genderLabel, gender === i && styles.genderLabelSel]}>
                    {g}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <AppButton
            label="Continue →"
            variant="red"
            onPress={handleContinue}
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
  segDone:   { backgroundColor: Colors.redMid },
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
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  avatarRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginBottom: 8,
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
  avatarLabels: {
    flexDirection: 'row',
    gap: 24,
    paddingHorizontal: 6,
  },
  avatarLabel: {
    fontFamily: FontFamily.bodyBlack,
    fontSize: 9,
    color: Colors.gray500,
    textAlign: 'center',
    width: 60,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  avatarLabelSel: {
    color: Colors.redDark,
    fontFamily: FontFamily.bodyBold,
  },

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

  // Gender selector
  genderRow: {
    flexDirection: 'row',
    gap: 10,
  },
  genderBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.gray300,
    borderRadius: Radius.lg,
    backgroundColor: Colors.white,
    shadowColor: Colors.gray300,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  genderBtnSel: {
    borderColor: Colors.outline,
    backgroundColor: Colors.redPale,
    ...Shadow.sm,
  },
  genderLabel: {
    fontFamily: FontFamily.body,
    fontSize: 13,
    color: Colors.gray900,
  },
  genderLabelSel: {
    fontFamily: FontFamily.bodyBold,
    color: Colors.redDark,
  },
});