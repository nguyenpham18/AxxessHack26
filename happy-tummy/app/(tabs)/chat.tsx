import React, { useState, useRef, useEffect } from 'react';
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
  Animated,
} from 'react-native';
import { Colors, FontFamily, Shadow, Radius } from '@/constants/theme';

import { getChatReply } from "../../lib/featherless";
import { getMe, listChildren, ChildResponse } from "../../lib/api";

type MsgRole = 'ai' | 'user';

interface Message {
  id: string;
  role: MsgRole;
  text: string;
  isLoading?: boolean;
}

// Loading indicator with animated dots
function LoadingIndicator() {
  const dots = [useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current];

  useEffect(() => {
    const animateDot = (dotAnim: Animated.Value, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dotAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(dotAnim, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    dots.forEach((dot, i) => animateDot(dot, i * 150));
  }, [dots]);

  return (
    <View style={{ flexDirection: 'row', gap: 4, alignItems: 'center' }}>
      {dots.map((animValue, i) => (
        <Animated.View
          key={i}
          style={[
            loadingStyles.dot,
            {
              opacity: animValue.interpolate({
                inputRange: [0, 1],
                outputRange: [0.4, 1],
              }),
              transform: [
                {
                  scale: animValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.3],
                  }),
                },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
}

const loadingStyles = StyleSheet.create({
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.gray700,
  },
});

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [parentName, setParentName] = useState('there');
  const [childName, setChildName] = useState('your little one');
  const [babyData, setBabyData] = useState<ChildResponse | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  // Fetch user and child data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const user = await getMe();
        setParentName(user.first_name || 'there');

        const children = await listChildren();
        if (children.length > 0) {
          const child = children[0]; // Use first child
          setChildName(child.name || 'your little one');
          setBabyData(child);
        }
      } catch (err) {
        console.error('Failed to load user/child data:', err);
      }
    };

    loadData();
  }, []);

  // Initialize messages once we have names
  useEffect(() => {
    if (messages.length === 0 && (parentName !== 'there' || childName !== 'your little one')) {
      setMessages([
        {
          id: '1',
          role: 'ai',
          text: `Hi ${parentName}! I know ${childName} well — ask me anything about their digestion and I'll answer based on their logs.`,
        },
      ]);
    }
  }, [parentName, childName]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userText = text.trim();

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: userText,
    };

    const loadingId = (Date.now() + 1).toString();
    const loadingMsg: Message = {
      id: loadingId,
      role: 'ai',
      text: '',
      isLoading: true,
    };

    // Update UI immediately (user msg + loading msg)
    setMessages((prev) => [...prev, userMsg, loadingMsg]);
    setInput('');

    try {
      // Build conversation from the latest messages we KNOW (prev + new user)
      const conversation = [...messages, userMsg]
        .slice(-10)
        .map((m) => ({
          role: m.role === "ai" ? ("assistant" as const) : ("user" as const),
          content: m.text,
        }));

      // Use real baby data from DB, fallback to defaults
      const baby = babyData ? {
        name: babyData.name || 'baby',
        ageMonths: babyData.age || 0,
        allergies: [],
      } : { name: 'baby', ageMonths: 0, allergies: [] };
      const recentLogs = [
        { day: "today", stool: "none", hydration: "low", gas: "yes" },
      ];

      const data = await getChatReply({
        baby,
        recentLogs,
        conversation,
        userMessage: userText,
      });

      setMessages((prev) =>
        prev.map((m) => (m.id === loadingId ? { ...m, text: data.reply, isLoading: false } : m))
      );
    } catch (e: any) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === loadingId
            ? { ...m, text: e?.message ?? "Load failed", isLoading: false }
            : m
        )
      );
    } finally {
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.aiAvatar}>
          <Text style={styles.aiAvatarEmoji}>🌿</Text>
        </View>
        <View>
          <Text style={styles.headerName}>Ask Happy Tummy AI</Text>
          <Text style={styles.headerStatus}>Always here for you</Text>
        </View>
      </View>

      {/* Wave curve */}
      <View style={styles.wave} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={0}
      >
        {/* Messages */}
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        >
        {messages.map((msg) => (
          <View
            key={msg.id}
            style={[
              styles.bubble,
              msg.role === 'ai' ? styles.bubbleAi : styles.bubbleUser,
            ]}
          >
            {msg.isLoading ? (
              <LoadingIndicator />
            ) : (
              <Text
                style={[
                  styles.bubbleText,
                  msg.role === 'user' && styles.bubbleTextUser,
                ]}
              >
                {msg.text}
              </Text>
            )}
          </View>
        ))}
        </ScrollView>
        {/* Input bar */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder={`Ask me anything about ${childName}...`}
            placeholderTextColor={Colors.gray500}
            returnKeyType="send"
            onSubmitEditing={() => sendMessage(input)}
          />
          <TouchableOpacity
            style={styles.sendBtn}
            onPress={() => sendMessage(input)}
            activeOpacity={0.8}
          >
            <Text style={styles.sendIcon}>➤</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    paddingBottom: 30,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  aiAvatar: {
    width: 46,
    height: 46,
    backgroundColor: Colors.white,
    borderRadius: 23,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.sm,
  },
  aiAvatarEmoji: { fontSize: 22 },
  headerName: {
    fontFamily: FontFamily.display,
    fontSize: 16,
    color: Colors.white,
  },
  headerStatus: {
    fontFamily: FontFamily.body,
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
  },

  // Messages
  messageList: {
    padding: 16,
    gap: 10,
    flexGrow: 1,
  },
  bubble: {
    maxWidth: '82%',
    padding: 12,
    borderWidth: 2.5,
    borderColor: Colors.outline,
  },
  bubbleAi: {
    backgroundColor: Colors.white,
    borderRadius: 4,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    alignSelf: 'flex-start',
    ...Shadow.sm,
  },
  bubbleUser: {
    backgroundColor: Colors.red,
    borderRadius: 20,
    borderTopRightRadius: 4,
    alignSelf: 'flex-end',
    ...Shadow.sm,
  },
  bubbleText: {
    fontFamily: FontFamily.body,
    fontSize: 13,
    color: Colors.gray900,
    lineHeight: 20,
  },
  bubbleTextUser: { color: Colors.white },

  // Quick replies
  quickRow: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 8,
  },
  quickChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: Colors.white,
    borderWidth: 2.5,
    borderColor: Colors.outline,
    borderRadius: Radius.pill,
    ...Shadow.sm,
  },
  quickChipText: {
    fontFamily: FontFamily.bodyBold,
    fontSize: 12,
    color: Colors.gray900,
  },

  // Input bar
  inputBar: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    paddingBottom: 14,
    backgroundColor: Colors.white,
    borderTopWidth: 3,
    borderTopColor: Colors.outline,
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: Colors.gray100,
    borderWidth: 2.5,
    borderColor: Colors.outline,
    borderRadius: Radius.pill,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontFamily: FontFamily.body,
    fontSize: 14,
    color: Colors.gray900,
    maxHeight: 100,
  },
  sendBtn: {
    width: 44,
    height: 44,
    backgroundColor: Colors.red,
    borderRadius: 22,
    borderWidth: 2.5,
    borderColor: Colors.outline,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.sm,
  },
  sendIcon: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
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
});