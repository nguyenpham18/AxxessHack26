import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Colors, FontFamily, Shadow, Radius } from '@/constants/theme';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { getDailyInsight, getMe, listChildren, type ChildResponse, type DailyInsightResponse } from '@/lib/api';

export default function DashboardScreen() {
  const [selectedBaby, setSelectedBaby] = useState(0);
  const [children, setChildren] = useState<ChildResponse[]>([]);
  const [parentName, setParentName] = useState('');
  const [insightsByChild, setInsightsByChild] = useState<Record<number, DailyInsightResponse>>({});
  const [insightLoading, setInsightLoading] = useState(false);

  const todayLabel = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const formatAgeLabel = (age: ChildResponse['age']) => {
    if (age === null || age === undefined) {
      return 'Age not set';
    }

    const ageNumber = Number(age);
    if (!Number.isFinite(ageNumber) || ageNumber < 0) {
      return 'Age not set';
    }

    const roundedAge = Math.round(ageNumber);
    if (roundedAge < 12) {
      return `${roundedAge} month${roundedAge === 1 ? '' : 's'}`;
    }

    const years = Math.floor(roundedAge / 12);
    const months = roundedAge % 12;
    if (months === 0) {
      return `${years} year${years === 1 ? '' : 's'}`;
    }

    return `${years} year${years === 1 ? '' : 's'} ${months} month${months === 1 ? '' : 's'}`;
  };

  const getInsightVisual = (status?: DailyInsightResponse['status']) => {
    if (status === 'caution') {
      return {
        borderColor: Colors.red,
        iconName: 'warning' as const,
        iconColor: Colors.red,
      };
    }
    if (status === 'good') {
      return {
        borderColor: Colors.green,
        iconName: 'checkmark-circle' as const,
        iconColor: Colors.green,
      };
    }
    return {
      borderColor: Colors.yellow,
      iconName: 'alert-circle' as const,
      iconColor: Colors.yellow,
    };
  };

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const loadDashboard = async () => {
        const withTimeout = async <T,>(promise: Promise<T>, timeoutMs: number): Promise<T | null> => {
          return await Promise.race([
            promise,
            new Promise<null>((resolve) => setTimeout(() => resolve(null), timeoutMs)),
          ]);
        };

        try {
          const [user, fetchedChildren] = await Promise.all([
            getMe().catch(() => null),
            listChildren().catch(() => [] as ChildResponse[]),
          ]);

          if (!active) return;

          if (user?.first_name) {
            setParentName(user.first_name);
          }

          setChildren(fetchedChildren);

          if (fetchedChildren.length === 0) {
            setInsightsByChild({});
            return;
          }

          setInsightLoading(true);
          const insightPairs = await Promise.all(
            fetchedChildren.map(async (child) => {
              try {
                const insight = await withTimeout(getDailyInsight(child.user_key), 9000);
                return [child.user_key, insight] as const;
              } catch {
                return [child.user_key, null] as const;
              }
            })
          );

          if (!active) return;

          const nextInsights: Record<number, DailyInsightResponse> = {};
          insightPairs.forEach(([childKey, insight]) => {
            if (insight) {
              nextInsights[childKey] = insight;
            }
          });
          setInsightsByChild(nextInsights);
        } finally {
          if (active) setInsightLoading(false);
        }
      };

      loadDashboard();

      return () => {
        active = false;
      };
    }, [])
  );

  const handleAddBaby = () => {
    router.push('/(onboarding)/baby-profile');
  };

  const handleOpenBabyProfile = (index: number, userKey: number) => {
    setSelectedBaby(index);
    router.push({
      pathname: '/(tabs)/baby/[id]',
      params: { id: String(userKey) },
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Red header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.hi}>Good morning!</Text>
            <Text style={styles.name}>
              {parentName ? `Welcome back, ${parentName}!` : 'Welcome back!'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.wave} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Baby profiles ── */}
        <Text style={styles.sectionTitle}>Your Babies</Text>

        {children.length === 0 && (
          <Text style={styles.emptyText}>No baby profiles yet. Add one below.</Text>
        )}

        {children.map((child, index) => (
          <TouchableOpacity
            key={child.user_key}
            style={[styles.babyCard, selectedBaby === index && styles.babyCardActive]}
            onPress={() => handleOpenBabyProfile(index, child.user_key)}
            activeOpacity={0.85}
          >
            <View style={styles.babyAvatar}>
              <MaterialCommunityIcons name="baby-face" size={24} color={Colors.red} />
            </View>
            <View style={styles.babyInfo}>
              <Text style={styles.babyName}>{child.name ?? 'Baby'}</Text>
              <Text style={styles.babyAge}>
                {formatAgeLabel(child.age)}
              </Text>
            </View>
            <View style={[styles.badge, { backgroundColor: Colors.greenPale }]}>
              <Ionicons name="checkmark-circle" size={16} color={Colors.green} />
              <Text style={styles.badgeLabel}>Good</Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* Add baby */}
        <TouchableOpacity
          style={styles.addCard}
          activeOpacity={0.8}
          onPress={handleAddBaby}
        >
          <View style={styles.addCircle}>
            <Ionicons name="add" size={28} color={Colors.gray900} />
          </View>
          <View>
            <Text style={styles.addLabel}>Add another baby</Text>
            <Text style={styles.addSub}>Create a new profile</Text>
          </View>
        </TouchableOpacity>

        {children.length > 0 && (
          <Text style={styles.sectionTitle}>Today's Insights · {todayLabel}</Text>
        )}

        {children.map((child) => {
          const insight = insightsByChild[child.user_key];
          const visual = getInsightVisual(insight?.status);
          return (
            <View key={`insight-${child.user_key}`} style={[styles.insightCard, { borderLeftColor: visual.borderColor }]}
            >
              <Text style={styles.insightChildName}>Child: {child.name ?? 'Baby'}</Text>
              <View style={styles.insightTop}>
                <Ionicons name={visual.iconName} size={18} color={visual.iconColor} />
                <Text style={styles.insightTitle}>{insight?.title ?? `${child.name ?? 'Baby'} insight is loading`}</Text>
                <Text style={styles.insightTime}>Today</Text>
              </View>
              {insightLoading && !insight ? (
                <View style={styles.insightLoadingRow}>
                  <ActivityIndicator size="small" color={Colors.red} />
                  <Text style={styles.insightLoadingText}>Comparing current log with previous logs...</Text>
                </View>
              ) : (
                <>
                  <Text style={styles.insightDesc}>{insight?.description ?? 'No insight yet. Add another daily log to compare trends.'}</Text>
                  {!!insight?.suggestions?.length && (
                    <Text style={styles.insightSuggestion}>Suggestion: {insight.suggestions[0]}</Text>
                  )}
                </>
              )}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.gray100,
  },

  // Header
  header: {
    backgroundColor: Colors.red,
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 44,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  hi: {
    fontFamily: FontFamily.body,
    fontSize: 15,
    color: 'rgba(255,255,255,0.75)',
  },
  name: {
    fontFamily: FontFamily.display,
    fontSize: 24,
    color: Colors.white,
    textShadowColor: 'rgba(0,0,0,0.15)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  bellBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 2.5,
    borderColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Wave
  wave: {
    height: 32,
    backgroundColor: Colors.gray100,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -24,
  },

  // Scroll
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 24,
    gap: 12,
  },

  // Section title
  sectionTitle: {
    fontFamily: FontFamily.displayBold,
    fontSize: 17,
    color: Colors.gray700,
    marginTop: 4,
  },

  // Baby card
  babyCard: {
    backgroundColor: Colors.white,
    borderWidth: 3,
    borderColor: Colors.gray300,
    borderRadius: Radius.xl,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    shadowColor: Colors.gray300,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  babyCardActive: {
    borderColor: Colors.outline,
    backgroundColor: Colors.redPale,
    ...Shadow.md,
  },
  babyAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.redPale,
    borderWidth: 3,
    borderColor: Colors.outline,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.sm,
  },
  babyInfo: { flex: 1 },
  babyName: {
    fontFamily: FontFamily.display,
    fontSize: 18,
    color: Colors.gray900,
  },
  babyAge: {
    fontFamily: FontFamily.body,
    fontSize: 14,
    color: Colors.gray500,
    marginTop: 2,
  },
  badge: {
    alignItems: 'center',
    gap: 2,
    width: 52,
    paddingVertical: 6,
    borderRadius: Radius.lg,
    borderWidth: 2.5,
    borderColor: Colors.outline,
    ...Shadow.sm,
  },
  badgeLabel: {
    fontFamily: FontFamily.bodyBlack,
    fontSize: 9,
    color: Colors.gray700,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  emptyText: {
    fontFamily: FontFamily.body,
    fontSize: 15,
    color: Colors.gray500,
  },

  // Add baby card
  addCard: {
    backgroundColor: Colors.yellowPale,
    borderWidth: 3,
    borderColor: Colors.outline,
    borderStyle: 'dashed',
    borderRadius: Radius.xl,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
  },
  addCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.yellow,
    borderWidth: 3,
    borderColor: Colors.outline,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.sm,
  },
  addLabel: {
    fontFamily: FontFamily.display,
    fontSize: 17,
    color: Colors.gray900,
  },
  addSub: {
    fontFamily: FontFamily.body,
    fontSize: 14,
    color: Colors.gray500,
    marginTop: 1,
  },

  // Insight card
  insightCard: {
    backgroundColor: Colors.white,
    borderWidth: 3,
    borderColor: Colors.outline,
    borderLeftWidth: 6,
    borderRadius: Radius.xl,
    padding: 14,
    ...Shadow.md,
  },
  insightTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  insightIcon: { fontSize: 17 },
  insightChildName: {
    fontFamily: FontFamily.bodyBold,
    fontSize: 12,
    color: Colors.gray500,
    marginBottom: 6,
  },
  insightTitle: {
    fontFamily: FontFamily.displayBold,
    fontSize: 16,
    color: Colors.gray900,
    flex: 1,
  },
  insightTime: {
    fontFamily: FontFamily.bodyBlack,
    fontSize: 12,
    color: Colors.gray500,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  insightDesc: {
    fontFamily: FontFamily.body,
    fontSize: 15,
    color: Colors.gray700,
    lineHeight: 19,
  },
  insightSuggestion: {
    fontFamily: FontFamily.bodyBold,
    fontSize: 13,
    color: Colors.red,
    marginTop: 8,
  },
  insightLoadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  insightLoadingText: {
    fontFamily: FontFamily.body,
    fontSize: 13,
    color: Colors.gray500,
  },
  insightCta: {
    fontFamily: FontFamily.bodyBold,
    fontSize: 15,
    color: Colors.red,
    marginTop: 8,
  },
});
