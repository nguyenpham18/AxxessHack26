import React, { useState, useRef } from 'react';
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
} from 'react-native';
import { Colors, FontFamily, Shadow, Radius } from '@/constants/theme';

import { getChatReply } from "../../lib/featherless";

type MsgRole = 'ai' | 'user';

interface Message {
  id: string;
  role: MsgRole;
  text: string;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: '1',
    role: 'ai',
    text: "Hi Sarah! I know Maya well — ask me anything about her digestion and I'll answer based on her logs.",
  },
];



export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const scrollRef = useRef<ScrollView>(null);

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
      text: "Thinking...",
    };

    // Update UI immediately (user msg + thinking msg)
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

      // TODO: Replace with real baby + logs from DB
      const baby = { name: "Maya", ageMonths: 10, allergies: [] };
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
        prev.map((m) => (m.id === loadingId ? { ...m, text: data.reply } : m))
      );
    } catch (e: any) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === loadingId
            ? { ...m, text: e?.message ?? "Load failed" }
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
              <Text
                style={[
                  styles.bubbleText,
                  msg.role === 'user' && styles.bubbleTextUser,
                ]}
              >
                {msg.text}
              </Text>
            </View>
          ))}
        </ScrollView>
        {/* Input bar */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Ask me anything about Maya..."
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