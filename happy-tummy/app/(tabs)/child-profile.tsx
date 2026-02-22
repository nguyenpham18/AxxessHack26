import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, FontFamily, Shadow, Radius } from '@/constants/theme';
import {
  getChildSummary,
  getMealRecommendations,
  listChildren,
  ChildResponse,
  ChildSummaryResponse,
  MealRecommendationsResponse,
} from '@/lib/api';
import { router } from 'expo-router';

export default function ChildProfileScreen() {
  const [childData, setChildData] = useState<ChildResponse | null>(null);
  const [childSummary, setChildSummary] = useState<ChildSummaryResponse | null>(null);
  const [mealRecommendations, setMealRecommendations] = useState<MealRecommendationsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const children = await listChildren();
        if (children.length > 0) {
          const child = children[0];
          setChildData(child);
          const [summary, recommendations] = await Promise.all([
            getChildSummary(child.user_key),
            getMealRecommendations(child.user_key),
          ]);
          setChildSummary(summary);
          setMealRecommendations(recommendations);
        }
      } catch (err) {
        console.error('Failed to load child profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Child Profile</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={Colors.red} />
          </View>
        ) : (
          <>
            <View style={styles.summaryCard}>
              <View style={styles.summaryHeader}>
                <View style={styles.avatar}>
                  <MaterialCommunityIcons name="baby-face" size={24} color={Colors.red} />
                </View>
                <View style={styles.summaryTitleWrap}>
                  <Text style={styles.childName}>{childData?.name ?? 'Child'}</Text>
                  <Text style={styles.subtitle}>Recent digestion summary</Text>
                </View>
              </View>
              <Text style={styles.summaryText}>{childSummary?.summary ?? 'No logs yet.'}</Text>
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

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Meal Recommendations</Text>
              <Text style={styles.sectionSubtitle}>Grouped by category</Text>
            </View>

            <View style={styles.recommendationsCard}>
              {mealRecommendations?.recommendations?.map((group, index) => (
                <View key={index} style={styles.recommendationGroup}>
                  <View style={styles.recommendationHeader}>
                    <Text style={styles.recommendationTitle}>{group.category}</Text>
                    <Text style={styles.recommendationReason}>{group.reason}</Text>
                  </View>
                  {group.items.map((item, itemIndex) => (
                    <View key={itemIndex} style={styles.recommendationItem}>
                      <Text style={styles.recommendationName}>{item.name ?? 'Unknown'}</Text>
                      <Text style={styles.recommendationMeta}>
                        {item.quantity ?? '-'} {item.unit ?? ''}
                      </Text>
                      <Text style={styles.recommendationMeta}>
                        Calories {item.nutrients.calories ?? 0} · Protein {item.nutrients.protein ?? 0}g · Fiber {item.nutrients.fiber ?? 0}g · Sugar {item.nutrients.sugar ?? 0}g
                      </Text>
                    </View>
                  ))}
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.gray100 },
  header: {
    backgroundColor: Colors.red,
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: FontFamily.display,
    fontSize: 20,
    color: Colors.white,
  },
  scroll: {
    padding: 16,
    gap: 16,
  },
  loadingBox: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  summaryCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: 16,
    gap: 12,
    ...Shadow.md,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.redPale,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryTitleWrap: { flex: 1 },
  childName: {
    fontFamily: FontFamily.displayBold,
    fontSize: 18,
    color: Colors.gray900,
  },
  subtitle: {
    fontFamily: FontFamily.body,
    fontSize: 12,
    color: Colors.gray500,
  },
  summaryText: {
    fontFamily: FontFamily.body,
    fontSize: 13,
    color: Colors.gray700,
    lineHeight: 18,
  },
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  sectionHeader: {
    gap: 4,
  },
  sectionTitle: {
    fontFamily: FontFamily.displayBold,
    fontSize: 16,
    color: Colors.gray900,
  },
  sectionSubtitle: {
    fontFamily: FontFamily.body,
    fontSize: 12,
    color: Colors.gray500,
  },
  recommendationsCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: 16,
    gap: 16,
    ...Shadow.md,
  },
  recommendationGroup: { gap: 10 },
  recommendationHeader: { gap: 4 },
  recommendationTitle: {
    fontFamily: FontFamily.displayBold,
    fontSize: 14,
    color: Colors.red,
  },
  recommendationReason: {
    fontFamily: FontFamily.body,
    fontSize: 12,
    color: Colors.gray500,
  },
  recommendationItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
  },
  recommendationName: {
    fontFamily: FontFamily.bodyBold,
    fontSize: 13,
    color: Colors.gray900,
  },
  recommendationMeta: {
    fontFamily: FontFamily.body,
    fontSize: 11,
    color: Colors.gray500,
  },
});
