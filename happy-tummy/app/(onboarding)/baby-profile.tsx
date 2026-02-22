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
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { setChildDraft } from '@/lib/childDraft';

let DateTimePicker: any;
let DateTimePickerEvent: any;
if (Platform.OS !== 'web') {
  DateTimePicker = require('@react-native-community/datetimepicker').default;
  DateTimePickerEvent = require('@react-native-community/datetimepicker').DateTimePickerEvent;
}

const AVATARS = [
  { IconComponent: MaterialCommunityIcons, iconName: 'baby-face' as const, color: '#FF6B9D', label: 'Baby Girl' },
  { IconComponent: MaterialCommunityIcons, iconName: 'baby-face-outline' as const, color: '#2196F3', label: 'Baby Boy' }
];

const GENDERS = ['Girl', 'Boy'];

export default function BabyProfileScreen() {
  const [avatar, setAvatar] = useState(0);
  const [babyName, setBabyName] = useState('');
  const [dob, setDob] = useState<Date | null>(null);
  const [gender, setGender] = useState(0);
  const [showPicker, setShowPicker] = useState(false);

  const calculateAgeInMonthsFromDate = (date: Date | null): number | null => {
    if (!date) return null;

    const today = new Date();
    let months = (today.getFullYear() - date.getFullYear()) * 12;
    months += today.getMonth() - date.getMonth();

    if (today.getDate() < date.getDate()) {
      months--;
    }

    return Math.max(0, months);
  };

  const formatAgeDisplay = (months: number | null) => {
    if (months === null || !Number.isFinite(months)) return '';
    if (months < 12) return `${months} month${months === 1 ? '' : 's'}`;

    const years = Math.floor(months / 12);
    const remMonths = months % 12;
    if (remMonths === 0) {
      return `${years} year${years === 1 ? '' : 's'}`;
    }
    return `${years} year${years === 1 ? '' : 's'} ${remMonths} month${remMonths === 1 ? '' : 's'}`;
  };

  const ageMonths = calculateAgeInMonthsFromDate(dob);
  const canContinue = babyName.trim().length > 0 && ageMonths !== null;

  const formatDob = (date: Date | null) => {
    if (!date) return '';
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${mm}/${dd}/${yyyy}`;
  };

  const onDobChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    if (selectedDate) {
      setDob(selectedDate);
      if (Platform.OS === 'ios') {
        setShowPicker(false);
      }
    }
  };

  const handleContinue = () => {
    if (!canContinue) return;

    setChildDraft({
      name: babyName.trim(),
      dob: formatDob(dob),
      ageMonths,
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
            {Platform.OS === 'web' ? (
              <input
                type="date"
                value={dob ? dob.toISOString().split('T')[0] : ''}
                onChange={(e) => {
                  if (e.target.value) {
                    setDob(new Date(e.target.value + 'T00:00:00'))
                  }
                }}
                max={new Date().toISOString().split('T')[0]}
                style={{
                  width: '100%',
                  paddingBottom: 13,
                  paddingTop: 16,
                  paddingLeft: 13,
                  paddingRight: 12,
                  fontSize: 15,
                  borderWidth: 3,
                  borderColor: Colors.outline,
                  borderBottomLeftRadius: 22,
                  borderBottomRightRadius: 22,
                  borderTopLeftRadius: 22,
                  borderTopRightRadius: 22,
                  borderStyle: 'solid',
                  fontFamily: FontFamily.body,
                  color: Colors.gray900,
                  backgroundColor: Colors.white,
                  boxSizing: 'border-box',
                  boxShadow: '3px 3px 0px rgba(61, 31, 39, 1.00)',
                } as any}
              />
            ) : (
              <>
                <TouchableOpacity
                  style={styles.input}
                  onPress={() => setShowPicker(true)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.inputText, !dob && styles.inputPlaceholder]}>
                    {dob ? formatDob(dob) : 'MM / DD / YYYY'}
                  </Text>
                </TouchableOpacity>

                {showPicker && DateTimePicker && (
                  <DateTimePicker
                    value={dob ?? new Date()}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    maximumDate={new Date()}
                    onChange={onDobChange}
                  />
                )}
              </>
            )}
            {!!formatAgeDisplay(ageMonths) && (
              <Text style={styles.ageHint}>Age detected: {formatAgeDisplay(ageMonths)}</Text>
            )}
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
            style={{ marginTop: 8, opacity: canContinue ? 1 : 0.55 }}
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
  inputText: {
    fontFamily: FontFamily.body,
    fontSize: 15,
    color: Colors.gray900,
  },
  inputPlaceholder: {
    color: Colors.gray500,
  },
  ageHint: {
    marginTop: 8,
    fontFamily: FontFamily.body,
    fontSize: 12,
    color: Colors.gray700,
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