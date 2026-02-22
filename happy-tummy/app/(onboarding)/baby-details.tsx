import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { Colors, FontFamily, Shadow, Radius } from '@/constants/theme';
import { AppButton } from '@/components/shared/AppButton';

export default function BabyDetailsScreen() {
  const [weight, setWeight] = useState('');
  const [hasAllergy, setHasAllergy] = useState<boolean | null>(null);
  const [allergyText, setAllergyText] = useState('');
  const [premature, setPremature] = useState<boolean | null>(null);
  const [delivery, setDelivery] = useState<number | null>(null);

  return (
    <SafeAreaView style={styles.safe}>
      {/* Step indicator */}
      <View style={styles.stepWrap}>
        <View style={styles.segRow}>
          <View style={[styles.seg, styles.segDone]} />
          <View style={[styles.seg, styles.segActive]} />
          <View style={[styles.seg, styles.seg]} />
        </View>
        <Text style={styles.stepInfo}>Step 2 of 3 · Baby Details</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>A little more{'\n'}about baby</Text>
        <Text style={styles.sub}>Helps us give you accurate advice</Text>

        {/* Q1 — Weight */}
        <View>
          <Text style={styles.label}>WHAT IS YOUR BABY'S CURRENT WEIGHT?</Text>
          <View style={styles.weightRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={weight}
              onChangeText={setWeight}
              placeholder="e.g. 14.5"
              placeholderTextColor={Colors.gray500}
              keyboardType="decimal-pad"
            />
            <View style={styles.unitBadge}>
              <Text style={styles.unitLabel}>lbs</Text>
            </View>
          </View>
        </View>

        {/* Q2 — Food allergies */}
        <View>
          <Text style={styles.label}>DOES YOUR BABY HAVE ANY FOOD ALLERGIES?</Text>
          <View style={styles.pairRow}>
            {['No', 'Yes'].map((opt, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => {
                  setHasAllergy(i === 1);
                  setAllergyText('');
                }}
                style={[
                  styles.pairBtn,
                  hasAllergy !== null && hasAllergy === (i === 1) && styles.pairBtnSel,
                ]}
                activeOpacity={0.8}
              >
                <Text style={[
                  styles.pairLabel,
                  hasAllergy !== null && hasAllergy === (i === 1) && styles.pairLabelSel,
                ]}>
                  {opt}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Free text — only shown when Yes */}
          {hasAllergy && (
            <View style={styles.allergyInputWrap}>
              <TextInput
                style={styles.allergyInput}
                value={allergyText}
                onChangeText={setAllergyText}
                placeholder="e.g. Milk, Peanuts, Eggs..."
                placeholderTextColor={Colors.gray500}
                multiline
              />
              <Text style={styles.allergyHint}>
                Separate multiple allergies with a comma
              </Text>
            </View>
          )}
        </View>

        {/* Q3 — Premature */}
        <View>
          <Text style={styles.label}>WAS YOUR BABY BORN BEFORE 37 WEEKS?</Text>
          <View style={styles.pairRow}>
            {['Yes', 'No'].map((opt, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => setPremature(i === 0)}
                style={[
                  styles.pairBtn,
                  premature !== null && premature === (i === 0) && styles.pairBtnSel,
                ]}
                activeOpacity={0.8}
              >
                <Text style={[
                  styles.pairLabel,
                  premature !== null && premature === (i === 0) && styles.pairLabelSel,
                ]}>
                  {opt}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Q4 — Delivery */}
        <View>
          <Text style={styles.label}>HOW WAS YOUR BABY DELIVERED?</Text>
          <View style={styles.pairRow}>
            {['Natural birth', 'C-section'].map((opt, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => setDelivery(i)}
                style={[styles.pairBtn, delivery === i && styles.pairBtnSel]}
                activeOpacity={0.8}
              >
                <Text style={[styles.pairLabel, delivery === i && styles.pairLabelSel]}>
                  {opt}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <AppButton
          label="Continue →"
          variant="red"
          onPress={() => router.replace('/(onboarding)/baby-intake')}
          style={{ marginTop: 8 }}
        />
      </ScrollView>
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
    gap: 20,
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
  label: {
    fontFamily: FontFamily.bodyBlack,
    fontSize: 11,
    letterSpacing: 1,
    color: Colors.gray700,
    marginBottom: 10,
  },

  // Weight input
  weightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
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
  unitBadge: {
    paddingVertical: 13,
    paddingHorizontal: 18,
    backgroundColor: Colors.gray200,
    borderWidth: 3,
    borderColor: Colors.outline,
    borderRadius: Radius.lg,
    ...Shadow.sm,
  },
  unitLabel: {
    fontFamily: FontFamily.bodyBold,
    fontSize: 15,
    color: Colors.gray700,
  },

  // Pair buttons
  pairRow: {
    flexDirection: 'row',
    gap: 10,
  },
  pairBtn: {
    flex: 1,
    paddingVertical: 13,
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
  pairBtnSel: {
    borderColor: Colors.outline,
    backgroundColor: Colors.redPale,
    ...Shadow.sm,
  },
  pairLabel: {
    fontFamily: FontFamily.body,
    fontSize: 14,
    color: Colors.gray900,
  },
  pairLabelSel: {
    fontFamily: FontFamily.bodyBold,
    color: Colors.redDark,
  },

  // Allergy text input
  allergyInputWrap: {
    marginTop: 10,
  },
  allergyInput: {
    backgroundColor: Colors.white,
    borderWidth: 3,
    borderColor: Colors.outline,
    borderRadius: Radius.lg,
    paddingVertical: 13,
    paddingHorizontal: 16,
    fontFamily: FontFamily.body,
    fontSize: 15,
    color: Colors.gray900,
    minHeight: 80,
    textAlignVertical: 'top',
    ...Shadow.sm,
  },
  allergyHint: {
    fontFamily: FontFamily.body,
    fontSize: 11,
    color: Colors.gray500,
    marginTop: 6,
  },
});