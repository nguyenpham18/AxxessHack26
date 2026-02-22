import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { Colors, FontFamily, Shadow, Radius } from '@/constants/theme';
import { AppButton } from '@/components/shared/AppButton';
import { createChild } from '@/lib/api';
import { getChildDraft, resetChildDraft } from '@/lib/childDraft';

// ─── Age Range Selector ────────────────────────────────────
type AgeRange = '6to12' | '12to24';

// ─── Yes/No Question Component ────────────────────────────
function YesNoQuestion({
  question,
  value,
  onChange,
  hint,
}: {
  question: string;
  value: boolean | null;
  onChange: (v: boolean) => void;
  hint?: string;
}) {
  return (
    <View style={styles.questionWrap}>
      <Text style={styles.questionText}>{question}</Text>
      {hint && <Text style={styles.questionHint}>{hint}</Text>}
      <View style={styles.pairRow}>
        {['Yes', 'No'].map((opt, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => onChange(i === 0)}
            style={[
              styles.pairBtn,
              value !== null && value === (i === 0) && styles.pairBtnSel,
            ]}
            activeOpacity={0.8}
          >
            <Text style={[
              styles.pairLabel,
              value !== null && value === (i === 0) && styles.pairLabelSel,
            ]}>
              {opt}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// ─── Main Screen ───────────────────────────────────────────
export default function BabyIntakeScreen() {
  const [ageRange, setAgeRange] = useState<AgeRange | null>(null);

  // 6–12 months questions
  const [drinksWater,  setDrinksWater]  = useState<boolean | null>(null); // Q7
  const [drinksMilk,  setDrinksMilk]   = useState<boolean | null>(null); // Q8

  // 12–24 months questions
  const [milkUnder16, setMilkUnder16]  = useState<boolean | null>(null); // Q9
  const [waterUnder16,setWaterUnder16] = useState<boolean | null>(null); // Q10
  const [hardStool,   setHardStool]    = useState<boolean | null>(null); // Q11
  const [eatsFruits,  setEatsFruits]   = useState<boolean | null>(null); // Q12
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const AGE_OPTIONS: { label: string; value: AgeRange }[] = [
    { label: '6–12 months', value: '6to12'   },
    { label: '12–24 months',value: '12to24'  },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      {/* Step indicator */}
      <View style={styles.stepWrap}>
        <View style={styles.segRow}>
          <View style={[styles.seg, styles.segDone]} />
          <View style={[styles.seg, styles.segDone]} />
          <View style={[styles.seg, styles.segActive]} />
        </View>
        <Text style={styles.stepInfo}>Step 3 of 3 · Nutrition Check</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Quick nutrition{'\n'}check-in</Text>
        <Text style={styles.sub}>A few more questions based on baby's age</Text>

        {/* Age range selector */}
        <View>
          <Text style={styles.label}>WHAT IS YOUR BABY'S AGE RANGE?</Text>
          <View style={styles.ageRow}>
            {AGE_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                onPress={() => setAgeRange(opt.value)}
                style={[styles.ageBtn, ageRange === opt.value && styles.ageBtnSel]}
                activeOpacity={0.8}
              >
                <Text style={[styles.ageLabel, ageRange === opt.value && styles.ageLabelSel]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        {/* ── 6–12 months questions ── */}
        {ageRange === '6to12' && (
          <View style={styles.questionsWrap}>
            <View style={styles.sectionBadge}>
              <Text style={styles.sectionBadgeText}>For babies 6–12 months</Text>
            </View>

            <YesNoQuestion
              question="Does your baby drink about 4–8 oz of water per day?"
              value={drinksWater}
              onChange={setDrinksWater}
            />

            <YesNoQuestion
              question="Does your baby drink about 22–32 oz of milk per day?"
              value={drinksMilk}
              onChange={setDrinksMilk}
            />
          </View>
        )}

        {/* ── 12–24 months questions ── */}
        {ageRange === '12to24' && (
          <View style={styles.questionsWrap}>
            <View style={styles.sectionBadge}>
              <Text style={styles.sectionBadgeText}>For babies 12–24 months</Text>
            </View>

            <YesNoQuestion
              question="Does your baby drink less than 16 oz of milk per day?"
              value={milkUnder16}
              onChange={setMilkUnder16}
            />

            <YesNoQuestion
              question="Does your baby drink less than 16 oz of water per day?"
              value={waterUnder16}
              onChange={setWaterUnder16}
            />

            <YesNoQuestion
              question="Does your baby's stool look like small hard pieces?"
              hint="Like corn or grapes in size and shape"
              value={hardStool}
              onChange={setHardStool}
            />

            {/* Stool chart placeholder */}
                <View style={styles.stoolChart}>
                <Text style={styles.stoolChartLabel}>📊 STOOL REFERENCE CHART</Text>
                <View style={styles.stoolRow}>
                    <View style={styles.stoolItem}><Text style={styles.stoolEmoji}>🟤</Text><Text style={styles.stoolLabel}>{'Type 1\nHard lumps'}</Text></View>
                    <View style={styles.stoolItem}><Text style={styles.stoolEmoji}>🟫</Text><Text style={styles.stoolLabel}>{'Type 2\nLumpy'}</Text></View>
                    <View style={styles.stoolItem}><Text style={styles.stoolEmoji}>🟡</Text><Text style={styles.stoolLabel}>{'Type 3\nCracked'}</Text></View>
                    <View style={styles.stoolItem}><Text style={styles.stoolEmoji}>💛</Text><Text style={styles.stoolLabel}>{'Type 4\nSmooth'}</Text></View>
                    <View style={styles.stoolItem}><Text style={styles.stoolEmoji}>🫗</Text><Text style={styles.stoolLabel}>{'Type 5\nSoft blobs'}</Text></View>
                    <View style={styles.stoolItem}><Text style={styles.stoolEmoji}>💧</Text><Text style={styles.stoolLabel}>{'Type 6\nFluffy'}</Text></View>
                    <View style={styles.stoolItem}><Text style={styles.stoolEmoji}>🌊</Text><Text style={styles.stoolLabel}>{'Type 7\nWatery'}</Text></View>
                </View>
              <Text style={styles.stoolNote}>
                💡 Types 1–2 may indicate constipation · Types 6–7 may indicate diarrhea
              </Text>
            </View>

            <YesNoQuestion
              question="Does your baby eat fruits or vegetables more than once a day?"
              value={eatsFruits}
              onChange={setEatsFruits}
            />
          </View>
        )}

        {/* Done button — always visible once age is selected */}
        {ageRange !== null && (
          <AppButton
            label={loading ? 'Saving...' : "All done! Let's go!"}
            variant="yellow"
            onPress={async () => {
              if (loading) return;
              setError('');
              setLoading(true);

              try {
                const draft = getChildDraft();
                await createChild({
                  name: draft.name ?? 'Baby',
                  age: null,
                  gender: draft.gender ?? null,
                  weight: draft.weight ?? null,
                  allergies: draft.allergies ? 1 : 0,
                  early_born: draft.earlyBorn ? 1 : 0,
                  delivery_method: draft.deliveryMethod ?? null,
                  envi_change: null,
                });
                resetChildDraft();
                router.replace('/(tabs)');
              } catch (err) {
                const message = err instanceof Error ? err.message : 'Failed to save baby profile';
                setError(message);
              } finally {
                setLoading(false);
              }
            }}
            style={{ marginTop: 8 }}
          />
        )}

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
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
  errorText: {
    fontFamily: FontFamily.body,
    fontSize: 13,
    color: Colors.redDark,
    textAlign: 'center',
  },

  // Age range selector
  ageRow: {
    flexDirection: 'column',
    gap: 8,
  },
  ageBtn: {
    paddingVertical: 14,
    paddingHorizontal: 16,
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
  ageBtnSel: {
    borderColor: Colors.outline,
    backgroundColor: Colors.redPale,
    ...Shadow.sm,
  },
  ageLabel: {
    fontFamily: FontFamily.body,
    fontSize: 15,
    color: Colors.gray900,
  },
  ageLabelSel: {
    fontFamily: FontFamily.bodyBold,
    color: Colors.redDark,
  },

  // Skip card (under 6 months)
  skipCard: {
    backgroundColor: Colors.yellowPale,
    borderWidth: 3,
    borderColor: Colors.outline,
    borderRadius: Radius.xl,
    padding: 20,
    alignItems: 'center',
    gap: 8,
    ...Shadow.md,
  },
  skipEmoji: { fontSize: 36 },
  skipTitle: {
    fontFamily: FontFamily.display,
    fontSize: 20,
    color: Colors.gray900,
  },
  skipDesc: {
    fontFamily: FontFamily.body,
    fontSize: 13,
    color: Colors.gray700,
    textAlign: 'center',
    lineHeight: 20,
  },

  // Questions section
  questionsWrap: { gap: 18 },
  sectionBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.red,
    borderRadius: Radius.pill,
    borderWidth: 2.5,
    borderColor: Colors.outline,
    paddingVertical: 5,
    paddingHorizontal: 14,
    ...Shadow.sm,
  },
  sectionBadgeText: {
    fontFamily: FontFamily.bodyBold,
    fontSize: 12,
    color: Colors.white,
  },

  // Individual question
  questionWrap: { gap: 8 },
  questionText: {
    fontFamily: FontFamily.bodyBold,
    fontSize: 14,
    color: Colors.gray900,
    lineHeight: 20,
  },
  questionHint: {
    fontFamily: FontFamily.body,
    fontSize: 12,
    color: Colors.gray500,
    marginTop: -4,
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

  // Stool chart
  stoolChart: {
    backgroundColor: Colors.white,
    borderWidth: 3,
    borderColor: Colors.outline,
    borderRadius: Radius.xl,
    padding: 14,
    gap: 10,
    ...Shadow.md,
  },
  stoolChartLabel: {
    fontFamily: FontFamily.bodyBlack,
    fontSize: 10,
    letterSpacing: 1,
    color: Colors.gray700,
    textTransform: 'uppercase',
  },
  stoolRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stoolItem: {
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  stoolEmoji: { fontSize: 22 },
  stoolLabel: {
    fontFamily: FontFamily.bodyBlack,
    fontSize: 8,
    color: Colors.gray500,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  stoolNote: {
    fontFamily: FontFamily.body,
    fontSize: 11,
    color: Colors.gray500,
    lineHeight: 16,
  },
});