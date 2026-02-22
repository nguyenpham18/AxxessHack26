import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  GestureResponderEvent,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontFamily, Shadow, Radius } from '@/constants/theme';

// ─── Constants ─────────────────────────────────────────────
import { getCoachMessage, getChatReply, searchNutrition } from '@/lib/featherless';
import { createDailyLog, listChildren } from '@/lib/api';

const STOOL_TYPES = [
  { type: 1, label: 'Type 1', short: 'Hard lumps',  desc: 'Separate hard lumps, like pebbles. Difficult to pass — often a sign of constipation. Increase fluids and fiber.' },
  { type: 2, label: 'Type 2', short: 'Lumpy',       desc: 'Sausage-shaped but lumpy and hard. Mild constipation — may need more water, fruit, or movement.' },
  { type: 3, label: 'Type 3', short: 'Cracked',     desc: 'Sausage-shaped with cracks on the surface. Normal but on the firmer side.' },
  { type: 4, label: 'Type 4', short: 'Smooth',      desc: 'Smooth and soft, like a banana. This is the ideal, healthy stool for your baby.' },
  { type: 5, label: 'Type 5', short: 'Soft blobs',  desc: 'Soft blobs with clear edges. Normal and common in babies, especially with a varied diet.' },
  { type: 6, label: 'Type 6', short: 'Mushy',       desc: 'Fluffy, mushy pieces with ragged edges. May indicate mild diarrhea — monitor hydration.' },
  { type: 7, label: 'Type 7', short: 'Watery',      desc: 'Entirely liquid with no solid pieces. Diarrhea — keep baby hydrated and contact pediatrician if it persists.' },
];

const stoolColor = (type: number) => {
  if (type <= 2) return '#F5C842';
  if (type <= 5) return '#8B5E3C';
  return '#4CAF50';
};

const HYDRATION_OPTIONS = [
  { label: 'Low',    desc: 'Less than usual', icon: 'water-outline' as const },
  { label: 'Normal', desc: 'About right',     icon: 'water'         as const },
  { label: 'Good',   desc: 'More than usual', icon: 'thunderstorm'  as const },
];

const getServingGrams = (foodName: string): number => {
  const name = foodName.toLowerCase();
  if (name.includes('cereal') || name.includes('oatmeal')) return 30;
  if (name.includes('puree') || name.includes('baby food')) return 60;
  if (name.includes('banana')) return 120;
  if (name.includes('apple')) return 100;
  if (name.includes('milk') || name.includes('formula')) return 240;
  if (name.includes('yogurt')) return 150;
  if (name.includes('rice')) return 80;
  if (name.includes('bread')) return 30;
  if (name.includes('juice')) return 120;
  if (name.includes('egg')) return 50;
  if (name.includes('chicken') || name.includes('meat')) return 85;
  if (name.includes('cheese')) return 28;
  if (name.includes('chips')) return 28;
  return 100;
};

// ─── Types ─────────────────────────────────────────────────
interface NutritionInfo {
  calories: number | null;
  fiber:    number | null;
  sugar:    number | null;
  protein:  number | null;
}

interface FoodTag {
  id:        string;
  name:      string;
  servings:  number;
  gramsEst:  number;
  nutrition: NutritionInfo | null;
}

interface FoodSearchResult {
  name: string;
  fdcId: number;
  calories: number | null;
  fiber: number | null;
  sugar: number | null;
  protein: number | null;
  water: number | null;
  defaultServingSize?: number;
  defaultUnit?: string;
  availableUnits?: string[];
}

// ─── Helpers ───────────────────────────────────────────────
const scaleNutrition = (nutrition: NutritionInfo | null, grams: number) => {
  if (!nutrition) return null;
  const s = grams / 100;
  return {
    calories: nutrition.calories !== null ? Math.round(nutrition.calories * s)       : null,
    fiber:    nutrition.fiber    !== null ? +((nutrition.fiber    * s).toFixed(1))   : null,
    sugar:    nutrition.sugar    !== null ? +((nutrition.sugar    * s).toFixed(1))   : null,
    protein:  nutrition.protein  !== null ? +((nutrition.protein  * s).toFixed(1))   : null,
  };
};


// ─── Section Card ──────────────────────────────────────────
function SectionCard({
  iconName, title, children,
}: {
  iconName: keyof typeof Ionicons.glyphMap;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={cardStyles.card}>
      <View style={cardStyles.header}>
        <View style={cardStyles.iconBox}>
          <Ionicons name={iconName} size={18} color={Colors.red} />
        </View>
        <Text style={cardStyles.title}>{title}</Text>
      </View>
      <View style={cardStyles.body}>{children}</View>
    </View>
  );
}

const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderWidth: 3,
    borderColor: Colors.outline,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    ...Shadow.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderBottomWidth: 2,
    borderBottomColor: Colors.gray200,
    backgroundColor: Colors.gray100,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: Colors.redPale,
    borderWidth: 2,
    borderColor: Colors.outline,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: FontFamily.displayBold,
    fontSize: 15,
    color: Colors.gray900,
  },
  body: { padding: 14, gap: 12 },
});

function MiniLabel({ text }: { text: string }) {
  return <Text style={styles.miniLabel}>{text}</Text>;
}

// ─── Stool Slider ────────────────────────────────────────────
const SLIDER_PADDING = 16;
const THUMB_SIZE = 30;

function StoolSlider({ value, onChange }: { value: number | null; onChange: (v: number) => void }) {
  const trackLayout = useRef({ x: 0, width: 0 });
  const trackRef = useRef<View>(null);
  const [width, setWidth] = useState(0);

  const valueFromPageX = useCallback((pageX: number) => {
    const trackW = trackLayout.current.width;
    if (trackW <= 0) return 4;
    const rel = pageX - trackLayout.current.x - THUMB_SIZE / 2;
    const usable = trackW - THUMB_SIZE;
    const ratio = Math.max(0, Math.min(1, rel / usable));
    return Math.max(1, Math.min(7, Math.round(1 + ratio * 6)));
  }, []);

  const handleTouch = useCallback((e: GestureResponderEvent) => {
    onChange(valueFromPageX(e.nativeEvent.pageX));
  }, [onChange, valueFromPageX]);

  const positionForValue = (v: number) => width > 0 ? ((v - 1) / 6) * (width - THUMB_SIZE) : 0;
  const color = stoolColor(value ?? 4);

  return (
    <View style={sliderStyles.wrap}>
      <View style={sliderStyles.labels}>
        <Text style={sliderStyles.endLabel}>Hard</Text>
        <Text style={sliderStyles.endLabel}>Watery</Text>
      </View>
      <View
        ref={trackRef}
        style={sliderStyles.track}
        onLayout={(e) => {
          setWidth(e.nativeEvent.layout.width);
          trackRef.current?.measure((_fx, _fy, w, _h, px) => {
            trackLayout.current = { x: px, width: w };
          });
        }}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderGrant={handleTouch}
        onResponderMove={handleTouch}
      >
        <View style={sliderStyles.line} />
        {[1, 2, 3, 4, 5, 6, 7].map((n) => (
          <Text
            key={n}
            style={[
              sliderStyles.tickLabel,
              { left: width > 0 ? ((n - 1) / 6) * (width - THUMB_SIZE) + THUMB_SIZE / 2 - 6 : `${((n - 1) / 6) * 100}%` },
              value === n && sliderStyles.tickLabelSel,
            ]}
          >
            {n}
          </Text>
        ))}
        <View
          style={[
            sliderStyles.thumb,
            { left: positionForValue(value ?? 4), backgroundColor: color },
          ]}
        >
          <Text style={sliderStyles.thumbText}>{value ?? 4}</Text>
        </View>
      </View>
    </View>
  );
}

const sliderStyles = StyleSheet.create({
  wrap: { gap: 4, paddingHorizontal: 4 },
  labels: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4 },
  endLabel: { fontFamily: FontFamily.body, fontSize: 10, color: Colors.gray500, textTransform: 'uppercase', letterSpacing: 0.5 },
  track: { height: 90, justifyContent: 'center', position: 'relative' },
  line: {
    position: 'absolute',
    left: THUMB_SIZE / 2,
    right: THUMB_SIZE / 2,
    height: 6,
    backgroundColor: Colors.gray300,
    borderRadius: 3,
    borderWidth: 1.5,
    borderColor: Colors.outline,
  },
  tick: { display: 'none' },
  tickLabel: { position: 'absolute', top: 60, fontFamily: FontFamily.bodyBold, fontSize: 11, color: Colors.gray500, width: 12, textAlign: 'center' },
  tickLabelSel: { fontFamily: FontFamily.displayBold, fontSize: 13, color: Colors.redDark },
  thumb: {
    position: 'absolute',
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    borderWidth: 2,
    borderColor: Colors.outline,
    alignItems: 'center',
    justifyContent: 'center',
    top: 24,
    ...Shadow.sm,
  },
  thumbText: { fontFamily: FontFamily.displayBold, fontSize: 13, color: Colors.white },
});

// ─── Serving Prompt Modal ─────────────────────────────────
function QuantityPrompt({
  food, onConfirm, onCancel,
}: {
  food: { name: string; nutrition: NutritionInfo | null; availableUnits?: string[] };
  onConfirm: (servings: number) => void;
  onCancel: () => void;
}) {
  const [servings, setServings] = useState(1);
  const servingGrams = getServingGrams(food.name);
  const totalGrams = servings * servingGrams;
  const scaled = scaleNutrition(food.nutrition, totalGrams);

  return (
    <Modal transparent animationType="slide">
      <View style={promptStyles.overlay}>
        <View style={promptStyles.sheet}>
          <View style={promptStyles.handle} />
          <Text style={promptStyles.title}>How many servings?</Text>
          <Text style={promptStyles.foodName}>{food.name}</Text>
          <Text style={promptStyles.servingInfo}>1 serving ≈ {servingGrams}g</Text>

          <View style={promptStyles.stepperRow}>
            <TouchableOpacity
              onPress={() => setServings(Math.max(0.5, +(servings - 0.5).toFixed(1)))}
              style={promptStyles.stepBtn}
              activeOpacity={0.8}
            >
              <Ionicons name="remove" size={20} color={Colors.white} />
            </TouchableOpacity>
            <View style={promptStyles.quantityBox}>
              <Text style={promptStyles.quantityNum}>{servings}</Text>
              <Text style={promptStyles.quantityUnit}>{servings === 1 ? 'serving' : 'servings'}</Text>
            </View>
            <TouchableOpacity
              onPress={() => setServings(+(servings + 0.5).toFixed(1))}
              style={promptStyles.stepBtn}
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={20} color={Colors.white} />
            </TouchableOpacity>
          </View>

          {scaled && (
            <View style={promptStyles.nutritionPreview}>
              <Text style={promptStyles.nutritionPreviewTitle}>
                Estimated for {servings} {servings === 1 ? 'serving' : 'servings'} (~{Math.round(totalGrams)}g)
              </Text>
              <View style={promptStyles.pillRow}>
                {scaled.calories !== null && (
                  <View style={promptStyles.pill}>
                    <Ionicons name="flame-outline" size={12} color={Colors.gray700} />
                    <Text style={promptStyles.pillText}>{scaled.calories} kcal</Text>
                  </View>
                )}
                {scaled.fiber !== null && (
                  <View style={[promptStyles.pill, { backgroundColor: Colors.greenPale }]}>
                    <Ionicons name="leaf-outline" size={12} color={Colors.gray700} />
                    <Text style={promptStyles.pillText}>{scaled.fiber}g fiber</Text>
                  </View>
                )}
                {scaled.sugar !== null && (
                  <View style={[promptStyles.pill, { backgroundColor: Colors.yellowPale }]}>
                    <Ionicons name="cube-outline" size={12} color={Colors.gray700} />
                    <Text style={promptStyles.pillText}>{scaled.sugar}g sugar</Text>
                  </View>
                )}
                {scaled.protein !== null && (
                  <View style={[promptStyles.pill, { backgroundColor: Colors.redPale }]}>
                    <Ionicons name="barbell-outline" size={12} color={Colors.gray700} />
                    <Text style={promptStyles.pillText}>{scaled.protein}g protein</Text>
                  </View>
                )}
              </View>
            </View>
          )}

          <View style={promptStyles.btnRow}>
            <TouchableOpacity onPress={onCancel} style={promptStyles.cancelBtn} activeOpacity={0.8}>
              <Text style={promptStyles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onConfirm(servings)}
              style={promptStyles.confirmBtn}
              activeOpacity={0.8}
            >
              <Ionicons name="add-circle-outline" size={18} color={Colors.white} />
              <Text style={promptStyles.confirmBtnText}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const promptStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.cream,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 3,
    borderColor: Colors.outline,
    padding: 20,
    paddingBottom: 36,
    gap: 14,
  },
  handle: {
    width: 40,
    height: 5,
    backgroundColor: Colors.gray300,
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 4,
  },
  title: {
    fontFamily: FontFamily.display,
    fontSize: 20,
    color: Colors.gray900,
    textAlign: 'center',
  },
  foodName: {
    fontFamily: FontFamily.bodyBold,
    fontSize: 14,
    color: Colors.gray500,
    textAlign: 'center',
    marginTop: -8,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  stepBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.red,
    borderWidth: 3,
    borderColor: Colors.outline,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.sm,
  },
  quantityBox: { alignItems: 'center', minWidth: 80 },
  quantityNum: {
    fontFamily: FontFamily.display,
    fontSize: 42,
    color: Colors.gray900,
    lineHeight: 48,
  },
  quantityUnit: {
    fontFamily: FontFamily.body,
    fontSize: 13,
    color: Colors.gray500,
  },
  servingInfo: {
    fontFamily: FontFamily.body,
    fontSize: 13,
    color: Colors.gray500,
    textAlign: 'center',
    marginTop: -8,
  },
  nutritionPreview: {
    backgroundColor: Colors.white,
    borderWidth: 2.5,
    borderColor: Colors.outline,
    borderRadius: Radius.lg,
    padding: 12,
    gap: 8,
    ...Shadow.sm,
  },
  nutritionPreviewTitle: {
    fontFamily: FontFamily.bodyBlack,
    fontSize: 10,
    letterSpacing: 0.8,
    color: Colors.gray500,
    textTransform: 'uppercase',
  },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF3E0',
    borderRadius: Radius.pill,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderWidth: 1.5,
    borderColor: Colors.outline,
  },
  pillText: {
    fontFamily: FontFamily.bodyBold,
    fontSize: 11,
    color: Colors.gray700,
  },
  btnRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.outline,
    borderRadius: Radius.pill,
    backgroundColor: Colors.white,
    ...Shadow.sm,
  },
  cancelBtnText: {
    fontFamily: FontFamily.bodyBold,
    fontSize: 15,
    color: Colors.gray700,
  },
  confirmBtn: {
    flex: 2,
    flexDirection: 'row',
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 3,
    borderColor: Colors.outline,
    borderRadius: Radius.pill,
    backgroundColor: Colors.red,
    ...Shadow.md,
  },
  confirmBtnText: {
    fontFamily: FontFamily.displayBold,
    fontSize: 15,
    color: Colors.white,
  },
});

// ─── Food Tag Item ──────────────────────────────────────────
function FoodTagItem({
  tag, onRemove,
}: {
  tag: FoodTag;
  onRemove: (id: string) => void;
}) {
  const scaled = scaleNutrition(tag.nutrition, tag.gramsEst);
  return (
    <View style={tagStyles.tag}>
      <View style={tagStyles.tagRow}>
        <View style={tagStyles.tagIconBox}>
          <Ionicons name="restaurant" size={14} color={Colors.red} />
        </View>
        <View style={tagStyles.tagInfo}>
          <Text style={tagStyles.tagName}>{tag.name}</Text>
          <Text style={tagStyles.tagQty}>
            {tag.servings} {tag.servings === 1 ? 'serving' : 'servings'} · ~{Math.round(tag.gramsEst)}g
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => onRemove(tag.id)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="close-circle" size={20} color={Colors.gray500} />
        </TouchableOpacity>
      </View>

      {scaled && (
        <View style={tagStyles.pillRow}>
          {scaled.calories !== null && (
            <View style={tagStyles.pill}>
              <Ionicons name="flame-outline" size={10} color={Colors.gray700} />
              <Text style={tagStyles.pillText}>{scaled.calories}kcal</Text>
            </View>
          )}
          {scaled.fiber !== null && (
            <View style={[tagStyles.pill, { backgroundColor: Colors.greenPale }]}>
              <Ionicons name="leaf-outline" size={10} color={Colors.gray700} />
              <Text style={tagStyles.pillText}>{scaled.fiber}g fiber</Text>
            </View>
          )}
          {scaled.sugar !== null && (
            <View style={[tagStyles.pill, { backgroundColor: Colors.yellowPale }]}>
              <Ionicons name="cube-outline" size={10} color={Colors.gray700} />
              <Text style={tagStyles.pillText}>{scaled.sugar}g sugar</Text>
            </View>
          )}
          {scaled.protein !== null && (
            <View style={[tagStyles.pill, { backgroundColor: Colors.redPale }]}>
              <Ionicons name="barbell-outline" size={10} color={Colors.gray700} />
              <Text style={tagStyles.pillText}>{scaled.protein}g protein</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const tagStyles = StyleSheet.create({
  tag: {
    backgroundColor: Colors.white,
    borderWidth: 2.5,
    borderColor: Colors.outline,
    borderRadius: Radius.lg,
    padding: 10,
    gap: 8,
    ...Shadow.sm,
  },
  tagRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  tagIconBox: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: Colors.redPale,
    borderWidth: 2,
    borderColor: Colors.outline,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagInfo: { flex: 1 },
  tagName: {
    fontFamily: FontFamily.displayBold,
    fontSize: 13,
    color: Colors.gray900,
  },
  tagQty: {
    fontFamily: FontFamily.body,
    fontSize: 11,
    color: Colors.gray500,
    marginTop: 1,
  },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FFF3E0',
    borderRadius: Radius.pill,
    paddingVertical: 3,
    paddingHorizontal: 7,
    borderWidth: 1.5,
    borderColor: Colors.outline,
  },
  pillText: {
    fontFamily: FontFamily.bodyBold,
    fontSize: 10,
    color: Colors.gray700,
  },
});

// ─── Food Search Section ────────────────────────────────────
function FoodSearchSection({
  foodTags, onAdd, onRemove,
}: {
  foodTags: FoodTag[];
  onAdd: (tag: FoodTag) => void;
  onRemove: (id: string) => void;
}) {
  const [query,       setQuery]       = useState('');
  const [results,     setResults]     = useState<any[]>([]);
  const [searching,   setSearching]   = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [pending,     setPending]     = useState<{ name: string; nutrition: NutritionInfo | null; availableUnits?: string[] } | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);
    setShowResults(true);
    try {
      const data = await searchNutrition(query.trim());
      setResults(data.results || []);
    } catch {
      setResults([]);
    }
    setSearching(false);
  };

  const handleSelect = (result: any) => {
    setPending({
      name: result.name,
      nutrition: result.calories !== null ? {
        calories: result.calories,
        fiber:    result.fiber,
        sugar:    result.sugar,
        protein:  result.protein,
      } : null,
      availableUnits: result.availableUnits,
    });
    setResults([]);
    setShowResults(false);
    setQuery('');
  };

  const handleConfirm = (servings: number) => {
    if (!pending) return;
    const grams = servings * getServingGrams(pending.name);
    onAdd({
      id:        Date.now().toString(),
      name:      pending.name,
      servings,
      gramsEst:  grams,
      nutrition: pending.nutrition,
    });
    setPending(null);
  };

  // Totals
  const totals = foodTags.reduce(
    (acc, t) => {
      const s = scaleNutrition(t.nutrition, t.gramsEst);
      return {
        calories: acc.calories + (s?.calories ?? 0),
        fiber:    acc.fiber    + (s?.fiber    ?? 0),
        sugar:    acc.sugar    + (s?.sugar    ?? 0),
        protein:  acc.protein  + (s?.protein  ?? 0),
      };
    },
    { calories: 0, fiber: 0, sugar: 0, protein: 0 }
  );

  return (
    <View style={searchStyles.wrap}>
      {/* Search bar */}
      <View style={searchStyles.row}>
        <TextInput
          style={searchStyles.input}
          value={query}
          onChangeText={setQuery}
          placeholder="Search food (e.g. oatmeal, banana...)"
          placeholderTextColor={Colors.gray500}
          returnKeyType="search"
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity style={searchStyles.btn} onPress={handleSearch} activeOpacity={0.8}>
          {searching
            ? <ActivityIndicator size="small" color={Colors.white} />
            : <Ionicons name="search" size={18} color={Colors.white} />
          }
        </TouchableOpacity>
      </View>

      {/* Results dropdown */}
      {showResults && (
        <View style={searchStyles.dropdown}>
          {searching && (
            <View style={searchStyles.loadingRow}>
              <ActivityIndicator size="small" color={Colors.red} />
              <Text style={searchStyles.loadingText}>Searching...</Text>
            </View>
          )}
          {!searching && results.length > 0 && results.map((r, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => handleSelect(r)}
              style={[searchStyles.dropdownItem, i < results.length - 1 && searchStyles.dropdownBorder]}
              activeOpacity={0.8}
            >
              <Ionicons name="add-circle-outline" size={16} color={Colors.red} />
              <Text style={searchStyles.dropdownName} numberOfLines={1}>{r.name}</Text>
              {r.calories !== null && (
                <Text style={searchStyles.dropdownCal}>{Math.round(r.calories / 2)}kcal/srv</Text>
              )}
            </TouchableOpacity>
          ))}
          {!searching && results.length === 0 && (
            <TouchableOpacity
              style={searchStyles.dropdownItem}
              onPress={() => handleSelect({ name: query, calories: null, fiber: null, sugar: null, protein: null })}
              activeOpacity={0.8}
            >
              <Ionicons name="add-circle-outline" size={16} color={Colors.red} />
              <Text style={searchStyles.dropdownName}>Add "{query}" manually</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={() => setShowResults(false)} style={searchStyles.dismiss}>
            <Text style={searchStyles.dismissText}>Dismiss</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Food tags */}
      {foodTags.length > 0 && (
        <View style={searchStyles.tagList}>
          <MiniLabel text={`${foodTags.length} food${foodTags.length > 1 ? 's' : ''} added`} />
          {foodTags.map((tag) => (
            <FoodTagItem key={tag.id} tag={tag} onRemove={onRemove} />
          ))}
        </View>
      )}

      {/* Totals summary */}
      {foodTags.length > 0 && (
        <View style={searchStyles.totalsCard}>
          <Text style={searchStyles.totalsTitle}>Today's Nutrition Totals</Text>
          <View style={searchStyles.totalsRow}>
            {[
              { label: 'Calories', icon: 'flame-outline'   as const, value: totals.calories,            unit: 'kcal', color: Colors.red     },
              { label: 'Fiber',    icon: 'leaf-outline'    as const, value: +totals.fiber.toFixed(1),   unit: 'g',    color: Colors.green   },
              { label: 'Sugar',    icon: 'cube-outline'    as const, value: +totals.sugar.toFixed(1),   unit: 'g',    color: Colors.yellow  },
              { label: 'Protein',  icon: 'barbell-outline' as const, value: +totals.protein.toFixed(1), unit: 'g',    color: Colors.gray700 },
            ].map((stat, i) => (
              <View key={i} style={searchStyles.totalStat}>
                <Ionicons name={stat.icon} size={16} color={stat.color} />
                <Text style={searchStyles.totalValue}>{stat.value}</Text>
                <Text style={searchStyles.totalUnit}>{stat.unit}</Text>
                <Text style={searchStyles.totalLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Quantity prompt modal */}
      {pending && (
        <QuantityPrompt
          food={pending}
          onConfirm={handleConfirm}
          onCancel={() => setPending(null)}
        />
      )}
    </View>
  );
}

const searchStyles = StyleSheet.create({
  wrap: { gap: 10 },
  row: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  input: {
    flex: 1,
    backgroundColor: Colors.white,
    borderWidth: 3,
    borderColor: Colors.outline,
    borderRadius: Radius.lg,
    paddingVertical: 11,
    paddingHorizontal: 14,
    fontFamily: FontFamily.body,
    fontSize: 14,
    color: Colors.gray900,
    ...Shadow.sm,
  },
  btn: {
    width: 46,
    height: 46,
    backgroundColor: Colors.red,
    borderRadius: Radius.lg,
    borderWidth: 3,
    borderColor: Colors.outline,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.sm,
  },
  dropdown: {
    backgroundColor: Colors.white,
    borderWidth: 3,
    borderColor: Colors.outline,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    ...Shadow.md,
  },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 14 },
  loadingText: { fontFamily: FontFamily.body, fontSize: 13, color: Colors.gray500 },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  dropdownBorder: { borderBottomWidth: 1.5, borderBottomColor: Colors.gray200 },
  dropdownName: { fontFamily: FontFamily.bodyBold, fontSize: 13, color: Colors.gray900, flex: 1 },
  dropdownCal:  { fontFamily: FontFamily.body, fontSize: 11, color: Colors.gray500 },
  dismiss: {
    paddingVertical: 10,
    alignItems: 'center',
    borderTopWidth: 1.5,
    borderTopColor: Colors.gray200,
    backgroundColor: Colors.gray100,
  },
  dismissText: { fontFamily: FontFamily.bodyBold, fontSize: 12, color: Colors.gray500 },
  tagList: { gap: 8 },
  totalsCard: {
    backgroundColor: Colors.gray100,
    borderWidth: 2.5,
    borderColor: Colors.outline,
    borderRadius: Radius.lg,
    padding: 12,
    gap: 10,
  },
  totalsTitle: {
    fontFamily: FontFamily.bodyBlack,
    fontSize: 10,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: Colors.gray700,
  },
  totalsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  totalStat: { alignItems: 'center', gap: 2, flex: 1 },
  totalValue: { fontFamily: FontFamily.display, fontSize: 18, color: Colors.gray900 },
  totalUnit:  { fontFamily: FontFamily.body, fontSize: 10, color: Colors.gray500 },
  totalLabel: {
    fontFamily: FontFamily.bodyBlack,
    fontSize: 9,
    color: Colors.gray500,
    textTransform: 'uppercase',
  },
});

// ─── Main Screen ───────────────────────────────────────────
export default function DailyLogScreen() {
  const params = useLocalSearchParams<{ childId?: string | string[] }>();
  const [babyName,  setBabyName]  = useState('Baby');
  const [childUserKey, setChildUserKey] = useState<number | null>(null);
  const [stoolType, setStoolType] = useState<number | null>(4);
  const [frequency, setFrequency] = useState(0);
  const [hydration, setHydration] = useState<number | null>(null);
  const [foodTags,  setFoodTags]  = useState<FoodTag[]>([]);
  const [saved,     setSaved]     = useState(false);
  const [saving,    setSaving]    = useState(false);

  useEffect(() => {
    listChildren()
      .then((children) => {
        if (children.length === 0) {
          setChildUserKey(null);
          return;
        }

        const rawChildId = Array.isArray(params.childId) ? params.childId[0] : params.childId;
        const parsedChildId = rawChildId ? Number(rawChildId) : null;

        const selectedChild = parsedChildId
          ? children.find((child) => Number(child.user_key) === parsedChildId)
          : children[0];

        if (selectedChild) {
          setChildUserKey(selectedChild.user_key);
          if (selectedChild.name) {
            setBabyName(selectedChild.name);
          }
        }
      })
      .catch(() => {});
  }, [params.childId]);

  const addFoodTag    = (tag: FoodTag) => setFoodTags((prev) => [...prev, tag]);
  const removeFoodTag = (id: string)   => setFoodTags((prev) => prev.filter((t) => t.id !== id));

  const handleSave = async () => {
    if (!childUserKey) {
      Alert.alert('Missing child', 'Please create or select a child profile first.', [{ text: 'OK' }]);
      return;
    }

    if (stoolType === null || hydration === null) {
      Alert.alert('Missing info', 'Please select a stool type and hydration level.', [{ text: 'OK' }]);
      return;
    }

    setSaving(true);

    try {
      await createDailyLog({
        childUserKey,
        logDate: new Date().toISOString().split('T')[0],
        stoolType,
        stoolFrequency: frequency,
        hydration: HYDRATION_OPTIONS[hydration].label,
        foodIntake: foodTags.map((t) => ({
          name: t.name,
          quantity: t.servings,
          unit: 'serving',
          gramsEst: t.gramsEst,
          nutrition: scaleNutrition(t.nutrition, t.gramsEst),
        })),
      });

      setStoolType(4);
      setFrequency(0);
      setHydration(null);
      setFoodTags([]);
      setSaved(true);
    } catch (error: any) {
      Alert.alert('Save failed', error?.message ?? 'Could not save daily log. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setStoolType(null);
    setFrequency(0);
    setHydration(null);
    setFoodTags([]);
    setSaved(false);
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>Daily Log</Text>
            <Text style={styles.headerSub}>
              {babyName} · {new Date().toLocaleDateString('en-US', {
                weekday: 'long', month: 'short', day: 'numeric',
              })}
            </Text>
          </View>
          <View style={styles.headerIcon}>
            <Ionicons name="clipboard-outline" size={26} color={Colors.white} />
          </View>
        </View>
      </View>
      <View style={styles.wave} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── 1. Stool Type ── */}
        <SectionCard iconName="medical-outline" title="Stool Type">
          <MiniLabel text="Bristol Stool Scale — slide to select" />
          <StoolSlider value={stoolType} onChange={setStoolType} />
          {stoolType !== null && (() => {
            const selected = STOOL_TYPES.find((s) => s.type === stoolType)!;
            const isWarning = stoolType <= 2 || stoolType >= 6;
            const bgColor = stoolType <= 2 ? '#FFF3E0' : stoolType >= 6 ? Colors.redPale : Colors.greenPale;
            const iconColor = stoolType <= 2 ? '#F5A623' : stoolType >= 6 ? Colors.red : Colors.green;
            return (
              <View style={[styles.hintBox, { backgroundColor: bgColor }]}>
                <Ionicons
                  name={isWarning ? 'warning-outline' : 'checkmark-circle-outline'}
                  size={16}
                  color={iconColor}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.hintTitle}>{selected.label} — {selected.short}</Text>
                  <Text style={styles.hintText}>{selected.desc}</Text>
                </View>
              </View>
            );
          })()}
        </SectionCard>

        {/* ── 2. Stool Frequency ── */}
        <SectionCard iconName="repeat-outline" title="Stool Frequency">
          <MiniLabel text="How many times today?" />
          <View style={styles.freqRow}>
            <TouchableOpacity
              onPress={() => setFrequency(Math.max(0, frequency - 1))}
              style={styles.freqBtn} activeOpacity={0.8}
            >
              <Ionicons name="remove" size={24} color={Colors.white} />
            </TouchableOpacity>
            <View style={styles.freqDisplay}>
              <Text style={styles.freqNumber}>{frequency}</Text>
              <Text style={styles.freqUnit}>times</Text>
            </View>
            <TouchableOpacity
              onPress={() => setFrequency(frequency + 1)}
              style={styles.freqBtn} activeOpacity={0.8}
            >
              <Ionicons name="add" size={24} color={Colors.white} />
            </TouchableOpacity>
          </View>
          {frequency === 0 && (
            <View style={styles.hintBox}>
              <Ionicons name="information-circle-outline" size={14} color={Colors.gray500} />
              <Text style={styles.hintText}>
                No bowel movement today — worth noting if this continues for 2+ days.
              </Text>
            </View>
          )}
        </SectionCard>

        {/* ── 3. Hydration ── */}
        <SectionCard iconName="water-outline" title="Hydration">
          <MiniLabel text={`How much did ${babyName} drink today?`} />
          <View style={styles.hydrationRow}>
            {HYDRATION_OPTIONS.map((opt, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => setHydration(i)}
                style={[styles.hydrationBtn, hydration === i && styles.hydrationBtnSel]}
                activeOpacity={0.8}
              >
                <Ionicons name={opt.icon} size={24} color={hydration === i ? Colors.red : Colors.gray500} />
                <Text style={[styles.hydrationLabel, hydration === i && styles.hydrationLabelSel]}>
                  {opt.label}
                </Text>
                <Text style={styles.hydrationDesc}>{opt.desc}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </SectionCard>

        {/* ── 4. Food Intake ── */}
        <SectionCard iconName="restaurant-outline" title="Food Intake">
          <MiniLabel text={`What did ${babyName} eat today?`} />
          <FoodSearchSection
            foodTags={foodTags}
            onAdd={addFoodTag}
            onRemove={removeFoodTag}
          />
          <View style={styles.hintBox}>
            <Ionicons name="bulb-outline" size={14} color={Colors.gray500} />
            <Text style={styles.hintText}>
              Note any new foods — we'll watch for reactions over 72 hours
            </Text>
          </View>
        </SectionCard>

        {/* ── Save / Saved ── */}
        {!saved ? (
          <TouchableOpacity
            style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
            onPress={handleSave}
            activeOpacity={0.85}
            disabled={saving}
          >
            <Ionicons name={saving ? 'hourglass-outline' : 'save-outline'} size={20} color={Colors.white} />
            <Text style={styles.saveBtnText}>{saving ? 'Saving...' : "Save Today's Log"}</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.savedCard}>
            <Ionicons name="checkmark-circle" size={48} color={Colors.green} />
            <Text style={styles.savedTitle}>Log saved!</Text>
            <Text style={styles.savedDesc}>
              Great job tracking today. Check the dashboard for AI insights based on {babyName}'s patterns.
            </Text>
            <TouchableOpacity onPress={handleReset} style={styles.resetBtn}>
              <Ionicons name="add-circle-outline" size={16} color={Colors.gray900} />
              <Text style={styles.resetBtnText}>Log another entry</Text>
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.gray100 },
  header: {
    backgroundColor: Colors.red,
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 44,
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  headerTitle: {
    fontFamily: FontFamily.display,
    fontSize: 26,
    color: Colors.white,
    textShadowColor: 'rgba(0,0,0,0.15)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  headerSub: { fontFamily: FontFamily.body, fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 2.5,
    borderColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wave: {
    height: 32,
    backgroundColor: Colors.gray100,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -24,
  },
  scroll: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 32, gap: 14 },
  miniLabel: {
    fontFamily: FontFamily.bodyBlack,
    fontSize: 10,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: Colors.gray500,
    marginBottom: 6,
  },

  // Stool

  // Hint
  hintBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    backgroundColor: Colors.gray100,
    borderRadius: Radius.md,
    padding: 10,
    borderWidth: 1.5,
    borderColor: Colors.gray300,
  },
  hintTitle: { fontFamily: FontFamily.displayBold, fontSize: 13, color: Colors.gray900, marginBottom: 2 },
  hintText: { fontFamily: FontFamily.body, fontSize: 12, color: Colors.gray700, lineHeight: 18, flex: 1 },

  // Frequency
  freqRow:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 20 },
  freqBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.red,
    borderWidth: 3,
    borderColor: Colors.outline,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.sm,
  },
  freqDisplay: { alignItems: 'center', minWidth: 80 },
  freqNumber:  { fontFamily: FontFamily.display, fontSize: 48, color: Colors.gray900, lineHeight: 54 },
  freqUnit:    { fontFamily: FontFamily.body, fontSize: 12, color: Colors.gray500 },

  // Hydration
  hydrationRow: { flexDirection: 'row', gap: 8 },
  hydrationBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderWidth: 3,
    borderColor: Colors.gray300,
    borderRadius: Radius.lg,
    backgroundColor: Colors.white,
    gap: 4,
    shadowColor: Colors.gray300,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  hydrationBtnSel:   { borderColor: Colors.outline, backgroundColor: Colors.redPale, ...Shadow.sm },
  hydrationLabel:    { fontFamily: FontFamily.bodyBold, fontSize: 13, color: Colors.gray900 },
  hydrationLabelSel: { fontFamily: FontFamily.displayBold, color: Colors.redDark },
  hydrationDesc:     { fontFamily: FontFamily.body, fontSize: 10, color: Colors.gray500 },

  // Save
  saveBtn: {
    width: '100%',
    paddingVertical: 16,
    backgroundColor: Colors.red,
    borderRadius: Radius.pill,
    borderWidth: 3,
    borderColor: Colors.outline,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    ...Shadow.md,
    marginTop: 4,
  },
  saveBtnDisabled: { backgroundColor: Colors.gray300, borderColor: Colors.gray500 },
  saveBtnText:     { fontFamily: FontFamily.displayBold, fontSize: 16, color: Colors.white },

  // Saved
  savedCard: {
    backgroundColor: Colors.greenPale,
    borderWidth: 3,
    borderColor: Colors.outline,
    borderRadius: Radius.xl,
    padding: 20,
    alignItems: 'center',
    gap: 8,
    ...Shadow.md,
  },
  savedTitle: { fontFamily: FontFamily.display, fontSize: 22, color: Colors.gray900 },
  savedDesc:  { fontFamily: FontFamily.body, fontSize: 13, color: Colors.gray700, textAlign: 'center', lineHeight: 20 },
  resetBtn: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: Colors.white,
    borderWidth: 2.5,
    borderColor: Colors.outline,
    borderRadius: Radius.pill,
    ...Shadow.sm,
  },
  resetBtnText: { fontFamily: FontFamily.bodyBold, fontSize: 13, color: Colors.gray900 },
});