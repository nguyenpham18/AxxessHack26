import React, { useEffect, useMemo, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Colors, FontFamily, Radius, Shadow } from '@/constants/theme';
import { ChildResponse, listChildren } from '@/lib/api';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

type NutrientProgress = {
  label: string;
  value: number;
};

function ProgressBar({ label, value }: NutrientProgress) {
  return (
    <View style={styles.progressRow}>
      <View style={styles.progressLabelRow}>
        <Text style={styles.progressLabel}>{label}</Text>
        <Text style={styles.progressValue}>{value}%</Text>
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${Math.max(0, Math.min(100, value))}%` }]} />
      </View>
    </View>
  );
}

export default function BabyProfileDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [child, setChild] = useState<ChildResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadChild = async () => {
      try {
        const children = await listChildren();
        if (!mounted) return;

        const selected = children.find((item) => String(item.user_key) === String(id));
        setChild(selected ?? null);
      } catch {
        if (!mounted) return;
        setChild(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadChild();
    return () => {
      mounted = false;
    };
  }, [id]);

  const aiConditionSummary = useMemo(() => {
    if (!child) return [] as string[];

    const summary: string[] = [];

    if (child.allergies === 1) {
      summary.push('Potential food sensitivity. Introduce one new food at a time and monitor stool changes.');
    } else {
      summary.push('No allergy flag in profile. Continue balanced food exposure with normal observation.');
    }

    if (child.early_born === 1) {
      summary.push('Premature history noted. Prioritize hydration and fiber consistency before large meal changes.');
    }

    if ((child.weight ?? 0) > 0) {
      summary.push(`Current tracked weight: ${child.weight} lbs. Keep weekly trend checks for growth consistency.`);
    }

    if (summary.length === 0) {
      summary.push('Profile has limited signals. Keep daily logs updated for stronger AI recommendations.');
    }

    return summary;
  }, [child]);

  const mealPlan = useMemo(() => {
    if (!child) return [] as string[];

    return [
      'Breakfast: Oatmeal with mashed banana and warm water.',
      'Lunch: Soft rice porridge with pumpkin and shredded chicken.',
      'Snack: Pear puree or steamed apple slices (age-appropriate texture).',
      'Dinner: Sweet potato mash with spinach and lean protein.',
      child.allergies === 1
        ? 'Note: Avoid known trigger foods and reintroduce new foods one at a time.'
        : 'Note: Rotate fruits and vegetables daily for fiber variety.',
    ];
  }, [child]);

  const nutrientProgress = useMemo(() => {
    const hasAllergies = child?.allergies === 1;
    return [
      { label: 'Hydration', value: hasAllergies ? 72 : 80 },
      { label: 'Fiber', value: hasAllergies ? 68 : 77 },
      { label: 'Protein', value: 74 },
      { label: 'Healthy Fats', value: 70 },
      { label: 'Micronutrients', value: hasAllergies ? 66 : 75 },
    ];
  }, [child]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centerWrap}>
          <Text style={styles.loadingText}>Loading baby profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!child) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centerWrap}>
          <Text style={styles.emptyTitle}>Baby profile not found</Text>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{child.name ?? 'Baby'}'s Profile</Text>
        <View style={styles.iconBtnPlaceholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.infoCard}>
          <View style={styles.avatarWrap}>
            <MaterialCommunityIcons name="baby-face" size={34} color={Colors.red} />
          </View>
          <View style={styles.infoTextWrap}>
            <Text style={styles.infoName}>{child.name ?? 'Baby'}</Text>
            <Text style={styles.infoSub}>Age: {child.age ?? 0} months</Text>
            <Text style={styles.infoSub}>Gender: {child.gender ?? 'Not set'}</Text>
            <Text style={styles.infoSub}>Weight: {child.weight ? `${child.weight} lbs` : 'Not set'}</Text>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>AI Condition Analysis</Text>
          {aiConditionSummary.map((item, index) => (
            <View key={index} style={styles.bulletRow}>
              <Ionicons name="sparkles" size={14} color={Colors.red} />
              <Text style={styles.sectionText}>{item}</Text>
            </View>
          ))}
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Recommended Meal Plan</Text>
          {mealPlan.map((item, index) => (
            <View key={index} style={styles.bulletRow}>
              <Ionicons name="restaurant" size={14} color={Colors.gray700} />
              <Text style={styles.sectionText}>{item}</Text>
            </View>
          ))}
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Nutrient Intake Progress</Text>
          {nutrientProgress.map((item) => (
            <ProgressBar key={item.label} label={item.label} value={item.value} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.gray100,
  },
  centerWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 12,
  },
  loadingText: {
    fontFamily: FontFamily.body,
    color: Colors.gray700,
    fontSize: 14,
  },
  emptyTitle: {
    fontFamily: FontFamily.displayBold,
    fontSize: 20,
    color: Colors.gray900,
  },
  backBtn: {
    backgroundColor: Colors.red,
    borderWidth: 3,
    borderColor: Colors.outline,
    borderRadius: Radius.lg,
    paddingVertical: 10,
    paddingHorizontal: 16,
    ...Shadow.sm,
  },
  backBtnText: {
    fontFamily: FontFamily.bodyBold,
    color: Colors.white,
    fontSize: 14,
  },
  header: {
    backgroundColor: Colors.red,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  iconBtnPlaceholder: {
    width: 36,
    height: 36,
  },
  headerTitle: {
    fontFamily: FontFamily.displayBold,
    fontSize: 18,
    color: Colors.white,
  },
  scroll: {
    padding: 16,
    gap: 12,
  },
  infoCard: {
    backgroundColor: Colors.white,
    borderWidth: 3,
    borderColor: Colors.outline,
    borderRadius: Radius.xl,
    padding: 14,
    flexDirection: 'row',
    gap: 12,
    ...Shadow.md,
  },
  avatarWrap: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: Colors.redPale,
    borderWidth: 3,
    borderColor: Colors.outline,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.sm,
  },
  infoTextWrap: {
    flex: 1,
    gap: 2,
  },
  infoName: {
    fontFamily: FontFamily.displayBold,
    fontSize: 20,
    color: Colors.gray900,
  },
  infoSub: {
    fontFamily: FontFamily.body,
    fontSize: 13,
    color: Colors.gray700,
  },
  sectionCard: {
    backgroundColor: Colors.white,
    borderWidth: 3,
    borderColor: Colors.outline,
    borderRadius: Radius.xl,
    padding: 14,
    gap: 10,
    ...Shadow.md,
  },
  sectionTitle: {
    fontFamily: FontFamily.displayBold,
    fontSize: 15,
    color: Colors.gray900,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  sectionText: {
    flex: 1,
    fontFamily: FontFamily.body,
    fontSize: 13,
    color: Colors.gray700,
    lineHeight: 19,
  },
  progressRow: {
    gap: 4,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    fontFamily: FontFamily.bodyBold,
    fontSize: 13,
    color: Colors.gray700,
  },
  progressValue: {
    fontFamily: FontFamily.bodyBlack,
    fontSize: 11,
    color: Colors.gray500,
  },
  progressTrack: {
    height: 10,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: Colors.outline,
    backgroundColor: Colors.gray200,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.green,
  },
});