import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Colors, FontFamily, Shadow, Radius } from '@/constants/theme';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';

// ─── Icon Scale Component ─────────────────────────────────
function IconScale({
  options,
  selected,
  onSelect,
}: {
  options: { IconComponent: any; iconName: string; label: string; color?: string }[];
  selected: number;
  onSelect: (i: number) => void;
}) {
  return (
    <View>
      <View style={scaleStyles.track}>
        {options.map((opt, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => onSelect(i)}
            style={[scaleStyles.opt, selected === i && scaleStyles.optSel]}
            activeOpacity={0.8}
          >
            <opt.IconComponent 
              name={opt.iconName} 
              size={22} 
              color={opt.color || Colors.gray500} 
            />
          </TouchableOpacity>
        ))}
      </View>
      <View style={scaleStyles.labelRow}>
        {options.map((opt, i) => (
          <Text key={i} style={scaleStyles.label}>{opt.label}</Text>
        ))}
      </View>
    </View>
  );
}

const scaleStyles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    backgroundColor: Colors.gray100,
    borderWidth: 2.5,
    borderColor: Colors.outline,
    borderRadius: Radius.pill,
    padding: 4,
    gap: 2,
  },
  opt: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    borderRadius: 20,
  },
  optSel: { backgroundColor: Colors.redPale },
  labelRow: {
    flexDirection: 'row',
    marginTop: 4,
    paddingHorizontal: 4,
  },
  label: {
    fontFamily: FontFamily.bodyBlack,
    fontSize: 9,
    color: Colors.gray500,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    flex: 1,
    textAlign: 'center',
  },
});

// ─── Log Card Component ────────────────────────────────────
function LogCard({
  IconComponent,
  iconName,
  iconBg,
  iconColor = Colors.gray500,
  title,
  subtitle,
  children,
  defaultExpanded = false,
}: {
  IconComponent: any;
  iconName: string;
  iconBg: string;
  iconColor?: string;
  title: string;
  subtitle: string;
  children?: React.ReactNode;
  defaultExpanded?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <View style={cardStyles.card}>
      <TouchableOpacity
        onPress={() => setExpanded(!expanded)}
        style={cardStyles.header}
        activeOpacity={0.8}
      >
        <View style={[cardStyles.iconBox, { backgroundColor: iconBg }]}>
          <IconComponent name={iconName} size={24} color={iconColor} />
        </View>
        <View style={cardStyles.textBox}>
          <Text style={cardStyles.title}>{title}</Text>
          <Text style={cardStyles.subtitle}>{subtitle}</Text>
        </View>
        <Ionicons 
          name={expanded ? "chevron-down" : "chevron-forward"} 
          size={18} 
          color={Colors.gray500} 
        />
      </TouchableOpacity>
      {expanded && <View style={cardStyles.body}>{children}</View>}
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
    gap: 12,
    padding: 14,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: Colors.outline,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.sm,
  },
  textBox: { flex: 1 },
  title: {
    fontFamily: FontFamily.displayBold,
    fontSize: 15,
    color: Colors.gray900,
  },
  subtitle: {
    fontFamily: FontFamily.body,
    fontSize: 12,
    color: Colors.gray500,
    marginTop: 1,
  },
  body: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
});

// ─── Mini label helper ─────────────────────────────────────
function MiniLabel({ text }: { text: string }) {
  return <Text style={styles.miniLabel}>{text}</Text>;
}

// ─── Consistency Track ─────────────────────────────────────
function ConsistencyTrack({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <View>
      <View style={styles.consistRow}>
        {[1, 2, 3, 4, 5].map((v) => (
          <TouchableOpacity
            key={v}
            onPress={() => onChange(v)}
            style={[styles.consistDot, v <= value && styles.consistDotFilled]}
          />
        ))}
      </View>
      <View style={styles.consistLabels}>
        <View style={styles.consistLabelItem}>
          <MaterialCommunityIcons name="cube" size={12} color={Colors.gray500} />
          <Text style={styles.consistLabel}>Hard</Text>
        </View>
        <View style={styles.consistLabelItem}>
          <Ionicons name="hand-left" size={12} color={Colors.gray500} />
          <Text style={styles.consistLabel}>Soft</Text>
        </View>
        <View style={styles.consistLabelItem}>
          <Ionicons name="water" size={12} color={Colors.gray500} />
          <Text style={styles.consistLabel}>Watery</Text>
        </View>
      </View>
    </View>
  );
}

// ─── Color Picker ──────────────────────────────────────────
const POOP_COLORS = [
  { hex: '#F5C842', label: 'Yellow' },
  { hex: '#8B5E3C', label: 'Brown'  },
  { hex: '#4CAF50', label: 'Green'  },
  { hex: '#E53935', label: 'Red'    },
  { hex: '#333333', label: 'Black'  },
];

function ColorPicker({
  selected,
  onSelect,
}: {
  selected: number;
  onSelect: (i: number) => void;
}) {
  return (
    <View style={styles.colorRow}>
      {POOP_COLORS.map((c, i) => (
        <TouchableOpacity
          key={i}
          onPress={() => onSelect(i)}
          style={styles.colorChipWrap}
          activeOpacity={0.8}
        >
          <View
            style={[
              styles.colorChip,
              { backgroundColor: c.hex },
              selected === i && styles.colorChipSel,
            ]}
          >
            {selected === i && <Ionicons name="checkmark" size={16} color={Colors.white} />}
          </View>
          <Text style={[styles.colorLabel, selected === i && styles.colorLabelSel]}>
            {c.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ─── Mock Log Type ────────────────────────────────────────
type DailyLog = {
  id: string;
  date: string;
  poop?: {
    consistency: number;
    color: string;
    effort: number;
  };
  gas?: {
    level: number;
    bellyFeel: number;
  };
  feeding?: {
    level: number;
    spitUp: number;
    notes: string;
  };
  mood?: number;
  timestamp: string;
};

// ─── Empty State Component ────────────────────────────────
function EmptyState({ onAddLog }: { onAddLog: () => void }) {
  return (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons name="clipboard-text-outline" size={64} color={Colors.gray300} />
      <Text style={styles.emptyTitle}>No logs yet</Text>
      <Text style={styles.emptySubtitle}>
        Start tracking your baby's health by logging their first entry
      </Text>
      <TouchableOpacity
        style={styles.emptyButton}
        onPress={onAddLog}
        activeOpacity={0.8}
      >
        <Ionicons name="add-circle" size={20} color={Colors.white} />
        <Text style={styles.emptyButtonText}>Log Today</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Log List Item Component ───────────────────────────────
function LogListItem({ log }: { log: DailyLog }) {
  const [expanded, setExpanded] = useState(false);

  const logDate = new Date(log.date);
  const formattedDate = logDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const getLogSummary = () => {
    const items = [];
    if (log.poop) items.push('🚽 Poop');
    if (log.feeding) items.push('🍽️ Feeding');
    if (log.gas) items.push('💨 Gas');
    if (log.mood !== undefined) items.push('❤️ Mood');
    return items.join(' • ');
  };

  return (
    <TouchableOpacity
      style={styles.logItemContainer}
      onPress={() => setExpanded(!expanded)}
      activeOpacity={0.8}
    >
      <View style={styles.logItemHeader}>
        <View style={styles.logItemDate}>
          <Text style={styles.logItemDateText}>{formattedDate}</Text>
          <Text style={styles.logItemSummary}>{getLogSummary()}</Text>
        </View>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={Colors.gray500}
        />
      </View>

      {expanded && (
        <View style={styles.logItemDetails}>
          {log.poop && (
            <View style={styles.logDetailRow}>
              <Text style={styles.logDetailLabel}>🚽 Poop</Text>
              <Text style={styles.logDetailValue}>
                Consistency: {log.poop.consistency}/5 • Color: {log.poop.color} • Effort: {log.poop.effort}
              </Text>
            </View>
          )}
          {log.feeding && (
            <View style={styles.logDetailRow}>
              <Text style={styles.logDetailLabel}>🍽️ Feeding</Text>
              <Text style={styles.logDetailValue}>
                Level: {log.feeding.level}/4 • Spit up: {log.feeding.spitUp}/3
                {log.feeding.notes ? ` • Notes: ${log.feeding.notes}` : ''}
              </Text>
            </View>
          )}
          {log.gas && (
            <View style={styles.logDetailRow}>
              <Text style={styles.logDetailLabel}>💨 Gas</Text>
              <Text style={styles.logDetailValue}>
                Level: {log.gas.level}/4 • Belly: {log.gas.bellyFeel}/3
              </Text>
            </View>
          )}
          {log.mood !== undefined && (
            <View style={styles.logDetailRow}>
              <Text style={styles.logDetailLabel}>❤️ Mood</Text>
              <Text style={styles.logDetailValue}>
                Fussiness: {log.mood}/4
              </Text>
            </View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

// ─── Main Screen ───────────────────────────────────────────
export default function DailyLogScreen() {
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddingLog, setIsAddingLog] = useState(false);

  // Form state for creating new log
  const [consistency, setConsistency] = useState(2);
  const [color, setColor] = useState(0);
  const [effort, setEffort] = useState(1);
  const [gasLevel, setGasLevel] = useState(0);
  const [bellyFeel, setBellyFeel] = useState(0);
  const [feedLevel, setFeedLevel] = useState(0);
  const [spitUp, setSpitUp] = useState(0);
  const [feedNotes, setFeedNotes] = useState('');
  const [mood, setMood] = useState(0);

  // Fetch logs on mount/focus
  useFocusEffect(
    React.useCallback(() => {
      fetchLogs();
    }, [])
  );

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with API call to fetch logs from backend
      // const response = await fetch('/api/logs');
      // const data = await response.json();
      // setLogs(data);

      // For now, load from localStorage mock data
      const savedLogs = localStorage?.getItem('baby_logs');
      if (savedLogs) {
        setLogs(JSON.parse(savedLogs));
      } else {
        setLogs([]);
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
      setLogs([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = () => {
    const newLog: DailyLog = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      poop: {
        consistency,
        color: POOP_COLORS[color].label,
        effort,
      },
      gas: {
        level: gasLevel,
        bellyFeel,
      },
      feeding: {
        level: feedLevel,
        spitUp,
        notes: feedNotes.trim(),
      },
      mood,
      timestamp: new Date().toISOString(),
    };

    try {
      // TODO: Replace with API call to save log to backend
      // await fetch('/api/logs', {
      //   method: 'POST',
      //   body: JSON.stringify(newLog),
      // });

      // For now, save to localStorage
      const allLogs = [newLog, ...logs];
      setLogs(allLogs);
      localStorage?.setItem('baby_logs', JSON.stringify(allLogs));

      Alert.alert('Success', 'Daily log saved! 🎉');
      resetForm();
      setIsAddingLog(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to save log. Please try again.');
      console.error('Error saving log:', error);
    }
  };

  const resetForm = () => {
    setConsistency(2);
    setColor(0);
    setEffort(1);
    setGasLevel(0);
    setBellyFeel(0);
    setFeedLevel(0);
    setSpitUp(0);
    setFeedNotes('');
    setMood(0);
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <MaterialCommunityIcons name="clipboard-text" size={24} color={Colors.white} />
          <Text style={styles.headerTitle}>Daily Log</Text>
        </View>
        <Text style={styles.headerSub}>Track your baby's health</Text>
      </View>
      <View style={styles.wave} />

      {/* Logs List View */}
      {!isAddingLog ? (
        <>
          {logs.length === 0 ? (
            <View style={styles.emptyScrollContainer}>
              <EmptyState onAddLog={() => setIsAddingLog(true)} />
            </View>
          ) : (
            <ScrollView
              contentContainerStyle={styles.logsScrollContainer}
              showsVerticalScrollIndicator={false}
            >
              {logs.map((log) => (
                <LogListItem key={log.id} log={log} />
              ))}

              {/* Add New Log Button */}
              <TouchableOpacity
                style={styles.addNewButton}
                onPress={() => setIsAddingLog(true)}
                activeOpacity={0.8}
              >
                <Ionicons name="add-circle" size={20} color={Colors.white} />
                <Text style={styles.addNewButtonText}>Log Another Day</Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </>
      ) : (
        <LogFormView
          consistency={consistency}
          setConsistency={setConsistency}
          color={color}
          setColor={setColor}
          effort={effort}
          setEffort={setEffort}
          gasLevel={gasLevel}
          setGasLevel={setGasLevel}
          bellyFeel={bellyFeel}
          setBellyFeel={setBellyFeel}
          feedLevel={feedLevel}
          setFeedLevel={setFeedLevel}
          spitUp={spitUp}
          setSpitUp={setSpitUp}
          feedNotes={feedNotes}
          setFeedNotes={setFeedNotes}
          mood={mood}
          setMood={setMood}
          onSubmit={handleSubmit}
          onCancel={() => {
            resetForm();
            setIsAddingLog(false);
          }}
        />
      )}
    </SafeAreaView>
  );
}

// ─── Log Form Component ───────────────────────────────────
type LogFormViewProps = {
  consistency: number;
  setConsistency: (v: number) => void;
  color: number;
  setColor: (v: number) => void;
  effort: number;
  setEffort: (v: number) => void;
  gasLevel: number;
  setGasLevel: (v: number) => void;
  bellyFeel: number;
  setBellyFeel: (v: number) => void;
  feedLevel: number;
  setFeedLevel: (v: number) => void;
  spitUp: number;
  setSpitUp: (v: number) => void;
  feedNotes: string;
  setFeedNotes: (v: string) => void;
  mood: number;
  setMood: (v: number) => void;
  onSubmit: () => void;
  onCancel: () => void;
};

function LogFormView({
  consistency,
  setConsistency,
  color,
  setColor,
  effort,
  setEffort,
  gasLevel,
  setGasLevel,
  bellyFeel,
  setBellyFeel,
  feedLevel,
  setFeedLevel,
  spitUp,
  setSpitUp,
  feedNotes,
  setFeedNotes,
  mood,
  setMood,
  onSubmit,
  onCancel,
}: LogFormViewProps) {
  return (
    <ScrollView
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Poop ── */}
      <LogCard
        IconComponent={MaterialCommunityIcons}
        iconName="toilet"
        iconBg="#FFF3E0"
        iconColor="#8B5E3C"
        title="Poop Tracker"
        subtitle="Tap to log today's BM"
        defaultExpanded
      >
        <MiniLabel text="Consistency" />
        <ConsistencyTrack value={consistency} onChange={setConsistency} />

        <MiniLabel text="Color" />
        <ColorPicker selected={color} onSelect={setColor} />

        <MiniLabel text="Effort Level" />
        <IconScale
          options={[
            { IconComponent: Ionicons, iconName: 'happy', label: 'Easy', color: '#4CAF50' },
            { IconComponent: Ionicons, iconName: 'remove', label: 'Some', color: '#FF9800' },
            { IconComponent: Ionicons, iconName: 'sad', label: 'Hard', color: '#FF5722' },
            { IconComponent: Ionicons, iconName: 'sad-outline', label: 'Crying', color: '#F44336' },
          ]}
          selected={effort}
          onSelect={setEffort}
        />
      </LogCard>

      {/* ── Gas ── */}
      <LogCard
        IconComponent={Ionicons}
        iconName="leaf"
        iconBg="#E3F2FD"
        iconColor="#2196F3"
        title="Gas & Bloating"
        subtitle="How's the tummy feeling?"
      >
        <MiniLabel text="Gas Level" />
        <IconScale
          options={[
            { IconComponent: Ionicons, iconName: 'happy', label: 'None', color: '#4CAF50' },
            { IconComponent: Ionicons, iconName: 'remove', label: 'Some', color: '#FF9800' },
            { IconComponent: Ionicons, iconName: 'sad', label: 'A lot', color: '#FF5722' },
            { IconComponent: Ionicons, iconName: 'sad-outline', label: 'Tons', color: '#F44336' },
          ]}
          selected={gasLevel}
          onSelect={setGasLevel}
        />

        <MiniLabel text="Belly Feel" />
        <IconScale
          options={[
            { IconComponent: Ionicons, iconName: 'flower', label: 'Soft', color: '#4CAF50' },
            { IconComponent: Ionicons, iconName: 'ellipse', label: 'Bloated', color: '#FF9800' },
            { IconComponent: MaterialCommunityIcons, iconName: 'cube', label: 'Hard', color: '#FF5722' },
          ]}
          selected={bellyFeel}
          onSelect={setBellyFeel}
        />
      </LogCard>

      {/* ── Feeding ── */}
      <LogCard
        IconComponent={Ionicons}
        iconName="restaurant"
        iconBg={Colors.redPale}
        iconColor={Colors.red}
        title="Feeding"
        subtitle="How did feeding go?"
      >
        <MiniLabel text="How did it go?" />
        <IconScale
          options={[
            { IconComponent: Ionicons, iconName: 'happy', label: 'Great', color: '#4CAF50' },
            { IconComponent: Ionicons, iconName: 'remove', label: 'OK', color: '#FF9800' },
            { IconComponent: Ionicons, iconName: 'sad', label: 'Fussy', color: '#FF5722' },
            { IconComponent: Ionicons, iconName: 'close-circle', label: 'Refused', color: '#F44336' },
          ]}
          selected={feedLevel}
          onSelect={setFeedLevel}
        />

        <MiniLabel text="Spit up?" />
        <IconScale
          options={[
            { IconComponent: Ionicons, iconName: 'close-circle', label: 'None', color: '#4CAF50' },
            { IconComponent: Ionicons, iconName: 'water', label: 'A little', color: '#2196F3' },
            { IconComponent: MaterialCommunityIcons, iconName: 'waves', label: 'A lot', color: '#03A9F4' },
          ]}
          selected={spitUp}
          onSelect={setSpitUp}
        />

        <MiniLabel text="Notes (optional)" />
        <TextInput
          style={styles.notesInput}
          value={feedNotes}
          onChangeText={setFeedNotes}
          placeholder="e.g. tried solids today..."
          placeholderTextColor={Colors.gray500}
          multiline
        />
      </LogCard>

      {/* ── Mood ── */}
      <LogCard
        IconComponent={Ionicons}
        iconName="heart"
        iconBg="#F3EEFF"
        iconColor="#9C27B0"
        title="Baby's Mood"
        subtitle="Overall how is baby feeling?"
      >
        <MiniLabel text="Fussiness today" />
        <IconScale
          options={[
            { IconComponent: Ionicons, iconName: 'happy', label: 'Happy', color: '#4CAF50' },
            { IconComponent: Ionicons, iconName: 'remove', label: 'OK', color: '#FF9800' },
            { IconComponent: Ionicons, iconName: 'sad', label: 'Fussy', color: '#FF5722' },
            { IconComponent: Ionicons, iconName: 'sad-outline', label: 'Very fussy', color: '#F44336' },
          ]}
          selected={mood}
          onSelect={setMood}
        />
      </LogCard>

      {/* ── Submit Button ── */}
      <View style={styles.submitSection}>
        <TouchableOpacity
          style={styles.submitButton}
          onPress={onSubmit}
          activeOpacity={0.8}
        >
          <Ionicons name="checkmark-circle" size={24} color={Colors.white} />
          <Text style={styles.submitButtonText}>Save Today's Log</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.resetButton}
          onPress={onCancel}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="close" size={20} color={Colors.gray500} />
          <Text style={styles.resetButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.gray100,
  },

  // Empty State
  emptyScrollContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    gap: 16,
  },
  emptyTitle: {
    fontFamily: FontFamily.display,
    fontSize: 24,
    color: Colors.gray900,
  },
  emptySubtitle: {
    fontFamily: FontFamily.body,
    fontSize: 14,
    color: Colors.gray500,
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyButton: {
    backgroundColor: Colors.red,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: Radius.lg,
    marginTop: 8,
    borderWidth: 3,
    borderColor: Colors.outline,
    ...Shadow.md,
  },
  emptyButtonText: {
    fontFamily: FontFamily.displayBold,
    fontSize: 16,
    color: Colors.white,
  },

  // Logs List
  logsScrollContainer: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 32,
    gap: 12,
  },
  logItemContainer: {
    backgroundColor: Colors.white,
    borderWidth: 3,
    borderColor: Colors.outline,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    ...Shadow.md,
  },
  logItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  logItemDate: {
    flex: 1,
  },
  logItemDateText: {
    fontFamily: FontFamily.bodyBold,
    fontSize: 14,
    color: Colors.gray900,
  },
  logItemSummary: {
    fontFamily: FontFamily.body,
    fontSize: 12,
    color: Colors.gray500,
    marginTop: 3,
  },
  logItemDetails: {
    borderTopWidth: 2,
    borderTopColor: Colors.gray100,
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 10,
  },
  logDetailRow: {
    gap: 6,
  },
  logDetailLabel: {
    fontFamily: FontFamily.bodyBold,
    fontSize: 12,
    color: Colors.gray900,
  },
  logDetailValue: {
    fontFamily: FontFamily.body,
    fontSize: 12,
    color: Colors.gray700,
    lineHeight: 18,
  },

  // Add New Button
  addNewButton: {
    backgroundColor: Colors.red,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: Radius.lg,
    borderWidth: 3,
    borderColor: Colors.outline,
    ...Shadow.md,
    marginTop: 12,
  },
  addNewButtonText: {
    fontFamily: FontFamily.displayBold,
    fontSize: 16,
    color: Colors.white,
  },

  // Header
  header: {
    backgroundColor: Colors.red,
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 44,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontFamily: FontFamily.display,
    fontSize: 26,
    color: Colors.white,
    textShadowColor: 'rgba(0,0,0,0.15)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  headerSub: {
    fontFamily: FontFamily.body,
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
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
    paddingBottom: 32,
    gap: 12,
  },

  // Mini label
  miniLabel: {
    fontFamily: FontFamily.bodyBlack,
    fontSize: 10,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: Colors.gray500,
    marginBottom: 8,
    marginTop: 12,
  },

  // Consistency track
  consistRow: {
    flexDirection: 'row',
    gap: 6,
  },
  consistDot: {
    flex: 1,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: Colors.outline,
    backgroundColor: Colors.white,
  },
  consistDotFilled: { backgroundColor: Colors.red },
  consistLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  consistLabelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  consistLabel: {
    fontFamily: FontFamily.bodyBlack,
    fontSize: 9,
    color: Colors.gray500,
  },

  // Color picker
  colorRow: {
    flexDirection: 'row',
    gap: 10,
  },
  colorChipWrap: { alignItems: 'center', gap: 4 },
  colorChip: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 2.5,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorChipSel: { borderColor: Colors.outline },
  colorLabel: {
    fontFamily: FontFamily.bodyBlack,
    fontSize: 8,
    color: Colors.gray500,
    textTransform: 'uppercase',
  },
  colorLabelSel: { color: Colors.gray900 },

  // Notes input
  notesInput: {
    backgroundColor: Colors.white,
    borderWidth: 3,
    borderColor: Colors.outline,
    borderRadius: Radius.lg,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontFamily: FontFamily.body,
    fontSize: 14,
    color: Colors.gray900,
    minHeight: 70,
    textAlignVertical: 'top',
    ...Shadow.sm,
  },

  // Submit Section
  submitSection: {
    marginTop: 8,
    gap: 12,
  },
  submitButton: {
    backgroundColor: Colors.red,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: Radius.xl,
    gap: 8,
    borderWidth: 3,
    borderColor: Colors.outline,
    ...Shadow.md,
  },
  submitButtonText: {
    fontFamily: FontFamily.displayBold,
    fontSize: 18,
    color: Colors.white,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  resetButton: {
    backgroundColor: Colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: Radius.lg,
    gap: 6,
    borderWidth: 2,
    borderColor: Colors.outline,
  },
  resetButtonText: {
    fontFamily: FontFamily.bodyBold,
    fontSize: 14,
    color: Colors.gray500,
  },
});