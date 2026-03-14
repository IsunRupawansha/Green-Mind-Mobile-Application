import React, { useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { ChatContext } from '../context/ChatContext';;

export default function HistoryScreen({ navigation }) {
  // Pull history and the setter function from context
  const { history, setHistory } = useContext(ChatContext);

  const confirmDelete = (id) => {
    Alert.alert(
      "Delete Conversation",
      "Are you sure you want to delete this chat history?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: () => deleteChat(id) 
        }
      ]
    );
  };

  const deleteChat = (id) => {
    // Filter out the chat with the matching ID
    const updatedHistory = history.filter(item => item.id !== id);
    setHistory(updatedHistory);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ fontSize: 24 }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>History</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={history}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.empty}>No saved chats yet.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.card}
            onPress={() => navigation.navigate('ChatScreen', { pastChat: item.chat })}
          >
            <View style={styles.cardContent}>
              <View style={styles.textContainer}>
                <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.cardDate}>
                  {new Date(item.id).toLocaleDateString()} at {new Date(item.id).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>

              <View style={styles.actionButtons}>
                {/* Delete Button */}
                <TouchableOpacity 
                  style={styles.deleteButton} 
                  onPress={() => confirmDelete(item.id)}
                >
                  <Text style={{ fontSize: 18 }}>🗑️</Text>
                </TouchableOpacity>
                
                <Text style={{ color: '#00D46A', marginLeft: 10 }}>➡️</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA', paddingTop: 50 },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    padding: 20, 
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE'
  },
  title: { fontSize: 20, fontWeight: 'bold', color: '#2D5016' },
  card: { 
    backgroundColor: 'white', 
    marginHorizontal: 15, 
    marginVertical: 6, 
    borderRadius: 12, 
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  textContainer: { flex: 1, marginRight: 10 },
  cardTitle: { fontWeight: 'bold', fontSize: 16, color: '#333' },
  cardDate: { color: '#999', fontSize: 12, marginTop: 4 },
  actionButtons: { flexDirection: 'row', alignItems: 'center' },
  deleteButton: {
    padding: 8,
    backgroundColor: '#FFE5E5',
    borderRadius: 8,
  },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  empty: { textAlign: 'center', color: '#999', fontSize: 16 }
});