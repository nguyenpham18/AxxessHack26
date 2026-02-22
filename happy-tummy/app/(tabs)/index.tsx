import React, { useEffect, useState } from 'react';
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
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ChildResponse, getMe, listChildren } from '@/lib/api';

export default function DashboardScreen() {
  const [selectedBaby, setSelectedBaby] = useState(0);
  const [children, setChildren] = useState<ChildResponse[]>([]);
  const [parentName, setParentName] = useState('');

  const todayLabel = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const getTodayInsight = (child: ChildResponse) => {
    const hasAllergyFlag = child.allergies === 1;
    const isEarlyBorn = child.early_born === 1;

    if (hasAllergyFlag) {
      return {
        borderColor: Colors.yellow,
        iconName: 'warning',
        iconColor: Colors.yellow,
        title: `${child.name ?? 'Baby'} may need allergy-safe meals today`,
        desc: 'Use familiar foods first and introduce only one new food at a time. Track stool and comfort after meals.',
      };
    }

    if (isEarlyBorn) {
      return {
        borderColor: Colors.red,
        iconName: 'heart',
        iconColor: Colors.red,
        title: `${child.name ?? 'Baby'} needs gentle feeding pacing today`,
        desc: 'Keep portions small and frequent with hydration breaks to support digestion and comfort throughout the day.',
      };
    }

    return {
      borderColor: Colors.green,
      iconName: 'checkmark-circle',
      iconColor: Colors.green,
      title: `${child.name ?? 'Baby'} is on track today`,
      desc: 'Maintain balanced meals with fruits, vegetables, and water to keep bowel movement and tummy comfort stable.',
    };
  };

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        const [me, kids] = await Promise.all([getMe(), listChildren()]);
        if (!isMounted) return;
        setParentName(me.first_name ?? me.username);
        setChildren(kids);
      } catch {
        if (!isMounted) return;
        setChildren([]);
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, []);

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
                {child.age ? `${child.age} months` : 'Age not set'}
              </Text>
            </View>
            <View style={[styles.badge, { backgroundColor: Colors.greenPale }]}>
              <Ionicons name="checkmark-circle" size={16} color={Colors.green} />
              <Text style={styles.badgeLabel}>Good</Text>
            </View>
          </TouchableOpacity>
        ))}

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
          const insight = getTodayInsight(child);
          return (
            <View key={`insight-${child.user_key}`} style={[styles.insightCard, { borderLeftColor: insight.borderColor }]}
            >
              <View style={styles.insightTop}>
                <Ionicons name={insight.iconName as any} size={18} color={insight.iconColor} />
                <Text style={styles.insightTitle}>{insight.title}</Text>
                <Text style={styles.insightTime}>Today</Text>
              </View>
              <Text style={styles.insightDesc}>{insight.desc}</Text>
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
  insightCta: {
    fontFamily: FontFamily.bodyBold,
    fontSize: 15,
    color: Colors.red,
    marginTop: 8,
  },
});
