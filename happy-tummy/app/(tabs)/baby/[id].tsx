import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Colors, FontFamily, Radius, Shadow } from '@/constants/theme';
import {
  ChildResponse,
  ChildSummaryResponse,
  MealRecommendationsResponse,
  getChildSummary,
  getMealRecommendations,
  listChildren,
} from '@/lib/api';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

export default function BabyProfileDetailScreen() {
  const params = useLocalSearchParams();
  const childId = useMemo(() => {
    const raw = Array.isArray(params.id) ? params.id[0] : params.id;
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : null;
  }, [params.id]);

  const [child, setChild] = useState<ChildResponse | null>(null);
  const [childSummary, setChildSummary] = useState<ChildSummaryResponse | null>(null);
  const [mealRecommendations, setMealRecommendations] = useState<MealRecommendationsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const formatAgeLabel = (age: number | null) => {
    if (age === null || age === undefined) return 'Age not set';
    const ageNumber = Math.round(Number(age));
    if (!Number.isFinite(ageNumber) || ageNumber < 0) return 'Age not set';
    if (ageNumber < 12) return `${ageNumber} month${ageNumber === 1 ? '' : 's'}`;
    const years = Math.floor(ageNumber / 12);
    const months = ageNumber % 12;
    if (months === 0) return `${years} year${years === 1 ? '' : 's'}`;
    return `${years} year${years === 1 ? '' : 's'} ${months} month${months === 1 ? '' : 's'}`;
  };

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const loadChild = async () => {
        setLoading(true);
        try {
          const children = await listChildren();
          if (!active) return;

          const selected = childId
            ? children.find((item) => Number(item.user_key) === childId)
            : children[0];

          if (!selected) {
            setChild(null);
            return;
          }

          setChild(selected);

          const [summaryResult, recommendationsResult] = await Promise.allSettled([
            getChildSummary(selected.user_key),
            getMealRecommendations(selected.user_key),
          ]);

          if (!active) return;

          if (summaryResult.status === 'fulfilled') {
            setChildSummary(summaryResult.value);
          } else {
            console.error('Failed to load child summary:', summaryResult.reason);
            setChildSummary(null);
          }

          if (recommendationsResult.status === 'fulfilled') {
            setMealRecommendations(recommendationsResult.value);
          } else {
            console.error('Failed to load meal recommendations:', recommendationsResult.reason);
            setMealRecommendations(null);
          }
        } catch (err) {
          if (!active) return;
          console.error('Failed to load child profile:', err);
          setChild(null);
        } finally {
          if (active) setLoading(false);
        }
      };

      loadChild();

      return () => {
        active = false;
      };
    }, [childId])
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centerWrap}>
          <ActivityIndicator size="large" color={Colors.red} />
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
            <Text style={styles.infoSub}>Age: {formatAgeLabel(child.age)}</Text>
            <Text style={styles.infoSub}>Gender: {child.gender ?? 'Not set'}</Text>
            <Text style={styles.infoSub}>Weight: {child.weight ? `${child.weight} lbs` : 'Not set'}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.logBtn}
          activeOpacity={0.85}
          onPress={() =>
            router.push({
              pathname: '/(tabs)/logs',
              params: { childId: String(child.user_key) },
            })
          }
        >
          <Ionicons name="clipboard-outline" size={18} color={Colors.white} />
          <Text style={styles.logBtnText}>Daily Log for {child.name ?? 'this child'}</Text>
        </TouchableOpacity>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>AI Summary</Text>
          <Text style={styles.sectionText}>{childSummary?.summary ?? 'No logs yet.'}</Text>
          <View style={styles.nutritionRow}>
            <View style={styles.nutritionStat}>
              <Text style={styles.nutritionValue}>{Math.round(childSummary?.nutritionTotals.calories ?? 0)}</Text>
              <Text style={styles.nutritionLabel}>Calories</Text>
            </View>
            <View style={styles.nutritionStat}>
              <Text style={styles.nutritionValue}>{(childSummary?.nutritionTotals.protein ?? 0).toFixed(1)}</Text>
              <Text style={styles.nutritionLabel}>Protein (g)</Text>
            </View>
            <View style={styles.nutritionStat}>
              <Text style={styles.nutritionValue}>{(childSummary?.nutritionTotals.fiber ?? 0).toFixed(1)}</Text>
              <Text style={styles.nutritionLabel}>Fiber (g)</Text>
            </View>
            <View style={styles.nutritionStat}>
              <Text style={styles.nutritionValue}>{(childSummary?.nutritionTotals.sugar ?? 0).toFixed(1)}</Text>
              <Text style={styles.nutritionLabel}>Sugar (g)</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Meal Recommendations</Text>
          <Text style={styles.sectionSubtitle}>
            {mealRecommendations?.feedingGuidance?.message ?? 'Recommendations are based on current logs and age.'}
          </Text>
          <View style={styles.recommendationsList}>
            {(mealRecommendations?.mealRecommendations ?? []).map((meal, index) => (
              <View key={`${meal.name ?? 'meal'}-${index}`} style={styles.recommendationGroup}>
                <View style={styles.recommendationHeader}>
                  <Text style={styles.recommendationTitle}>{meal.name ?? 'Meal option'}</Text>
                  <Text style={styles.recommendationReason}>
                    {meal.mealType ?? 'meal'} · {meal.texture ?? 'texture'}
                  </Text>
                  <Text style={styles.recommendationReason}>{meal.description ?? ''}</Text>
                  <Text style={styles.recommendationReason}>
                    Calories {meal.nutrients.calories ?? 0} · Protein {meal.nutrients.protein ?? 0}g · Fiber {meal.nutrients.fiber ?? 0}g · Sugar {meal.nutrients.sugar ?? 0}g
                  </Text>
                </View>
              </View>
            ))}
            {(mealRecommendations?.mealRecommendations ?? []).length === 0 && (
              <Text style={styles.recommendationReason}>No meal recommendations available yet.</Text>
            )}
          </View>
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
  logBtn: {
    backgroundColor: Colors.red,
    borderWidth: 3,
    borderColor: Colors.outline,
    borderRadius: Radius.xl,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...Shadow.md,
  },
  logBtnText: {
    fontFamily: FontFamily.bodyBold,
    fontSize: 14,
    color: Colors.white,
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
  sectionSubtitle: {
    fontFamily: FontFamily.body,
    fontSize: 12,
    color: Colors.gray500,
  },
  sectionText: {
    fontFamily: FontFamily.body,
    fontSize: 13,
    color: Colors.gray700,
    lineHeight: 19,
  },
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  nutritionStat: {
    alignItems: 'center',
    flex: 1,
  },
  nutritionValue: {
    fontFamily: FontFamily.display,
    fontSize: 16,
    color: Colors.gray900,
  },
  nutritionLabel: {
    fontFamily: FontFamily.body,
    fontSize: 10,
    color: Colors.gray500,
    marginTop: 2,
  },
  recommendationsList: {
    gap: 12,
  },
  recommendationGroup: {
    gap: 8,
  },
  recommendationHeader: {
    gap: 4,
  },
  recommendationTitle: {
    fontFamily: FontFamily.displayBold,
    fontSize: 14,
    color: Colors.red,
  },
  recommendationReason: {
    fontFamily: FontFamily.body,
    fontSize: 12,
    color: Colors.gray700,
  },
});