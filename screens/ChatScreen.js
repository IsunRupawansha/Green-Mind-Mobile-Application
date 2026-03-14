import React, { useState, useContext, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Image, 
  ActivityIndicator, 
  StyleSheet, 
  Alert, 
  KeyboardAvoidingView, 
  Platform 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChatContext } from '../context/ChatContext';;

export default function ChatScreen({ navigation, route }) {
  const { setHistory } = useContext(ChatContext);
  const scrollViewRef = useRef();
  
  // Use past chat messages if coming from HistoryScreen, otherwise empty
  const [messages, setMessages] = useState(route.params?.pastChat || []);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Thread ID logic: Use existing one or generate new for fresh chat
  const [threadId, setThreadId] = useState(route.params?.threadId || Date.now().toString());

  // Auto-scroll to bottom whenever messages list updates
  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const startNewChat = () => {
    if (messages.length > 0) saveToHistory();
    setMessages([]);
    setInput('');
    setThreadId(Date.now().toString()); // Tells Python to start a new memory thread
  };

  const saveToHistory = () => {
    const firstUserMsg = messages.find(m => m.role === 'user')?.content || "Herbal Chat";
    setHistory(prev => [
      { id: Date.now(), title: firstUserMsg.slice(0, 30), chat: messages, threadId: threadId },
      ...prev
    ]);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    const userQuery = input;
    setInput('');

    try {
      // CORRECTED URL: Added /ask to the end of your specific HF link
      const response = await fetch("https://isunmr-herbal-plant-api.hf.space/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          question: userQuery,
          thread_id: threadId 
        })
      });

      if (!response.ok) {
        console.error("Server Status Error:", response.status);
        throw new Error("Server Error");
      }

      const data = await response.json();
      const botMsg = { role: 'bot', content: data.answer };
      setMessages(prev => [...prev, botMsg]);

    } catch (error) {
      Alert.alert(
        "Connection Error", 
        "The herbal agent is currently unavailable. Please ensure your Hugging Face Space is 'Running'."
      );
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.icon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>GreenMind AI</Text>
          <View style={{ flexDirection: 'row', gap: 20 }}>
            <TouchableOpacity onPress={startNewChat}>
              <Text style={styles.icon}>➕</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('HistoryScreen')}>
              <Text style={styles.icon}>🕒</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Chat Messages Area */}
        <ScrollView 
          ref={scrollViewRef}
          contentContainerStyle={{ padding: 15, flexGrow: 1 }} 
          style={styles.chatArea}
        >
          {messages.length === 0 && (
            <View style={styles.emptyView}>
              <Image 
                source={require('../assets/logo.png')} 
                style={styles.logoWatermark} 
              />
              <Text style={styles.emptyText}>Ask me about Sri Lankan herbal plants...</Text>
            </View>
          )}
          {messages.map((m, i) => (
            <View key={i} style={[styles.bubble, m.role === 'user' ? styles.userB : styles.botB]}>
              <Text style={{ color: m.role === 'user' ? 'white' : 'black', fontSize: 15 }}>
                {m.content}
              </Text>
            </View>
          ))}
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="#00D46A" />
              <Text style={styles.loadingText}>Thinking...</Text>
            </View>
          )}
        </ScrollView>

        {/* Bottom Input Area - Fixed for Android Navigation Bars */}
        <View style={styles.inputArea}>
          <TextInput 
            style={styles.input} 
            placeholder="Type your message..." 
            value={input} 
            onChangeText={setInput}
            placeholderTextColor="#999"
            multiline={false}
          />
          <TouchableOpacity onPress={sendMessage} style={styles.sendBtn}>
            <Text style={styles.sendBtnText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    padding: 15, 
    borderBottomWidth: 1, 
    borderColor: '#eee',
    backgroundColor: '#fff' 
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#2D5016' },
  icon: { fontSize: 22 },
  chatArea: { flex: 1 },
  bubble: { padding: 12, borderRadius: 18, marginVertical: 5, maxWidth: '85%' },
  userB: { alignSelf: 'flex-end', backgroundColor: '#00D46A', borderBottomRightRadius: 2 },
  botB: { alignSelf: 'flex-start', backgroundColor: '#f0f0f0', borderBottomLeftRadius: 2 },
  inputArea: { 
    flexDirection: 'row', 
    padding: 10, 
    borderTopWidth: 1, 
    borderColor: '#eee', 
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 10 : 20 // Extra space for Android navigation
  },
  input: { 
    flex: 1, 
    backgroundColor: '#f5f5f5', 
    borderRadius: 25, 
    paddingHorizontal: 20, 
    height: 45,
    color: '#000'
  },
  sendBtn: { 
    backgroundColor: '#2D5016', 
    paddingHorizontal: 20, 
    height: 45,
    borderRadius: 25, 
    justifyContent: 'center', 
    marginLeft: 10 
  },
  sendBtnText: { color: 'white', fontWeight: 'bold' },
  logoWatermark: { width: 80, height: 80, opacity: 0.1, alignSelf: 'center', marginBottom: 15 },
  emptyView: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#aaa', fontSize: 14, textAlign: 'center' },
  loadingContainer: { flexDirection: 'row', alignItems: 'center', marginLeft: 10, marginTop: 5 },
  loadingText: { marginLeft: 8, color: '#888', fontSize: 12 }
});