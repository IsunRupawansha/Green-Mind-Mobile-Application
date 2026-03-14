import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, SafeAreaView } from 'react-native';
import { collectionGroup, query, where, getDocs, orderBy } from 'firebase/firestore'; // Added orderBy
import { db, auth } from '../firebaseConfig';
import { Ionicons } from '@expo/vector-icons';

export default function RemedyHistoryScreen({ navigation }) {
  const [remedies, setRemedies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRemedies();
  }, []);

  const fetchRemedies = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      // Match the spelling 'sheduledAt' found in your Firebase Index
      const q = query(
        collectionGroup(db, "remedies"), 
        where("userId", "==", user.uid),
        orderBy("sheduledAt", "desc") // Use server-side sorting since the index exists
      );

      const querySnapshot = await getDocs(q);
      
      const list = [];
      querySnapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      
      setRemedies(list);
    } catch (e) {
      console.error("Error fetching history: ", e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00D46A" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={26} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Medicine Reminders</Text>
      </View>

      {remedies.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="notifications-off-outline" size={60} color="#DDD" />
          <Text style={styles.emptyText}>No reminders set yet.</Text>
        </View>
      ) : (
        <FlatList
          data={remedies}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.tagWrapper}>
                  <Text style={styles.diseaseTag}>{item.disease}</Text>
                </View>
                <Text style={styles.timeText}>
                   {/* FIXED spelling to item.sheduledAt */}
                   {new Date(item.sheduledAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </Text>
              </View>

              <Text style={styles.medicineName}>💊 {item.medicine}</Text>
              
              {item.desc ? (
                <View style={styles.notesContainer}>
                  <Text style={styles.notes}>Note: {item.desc}</Text>
                </View>
              ) : null}

              <View style={styles.cardFooter}>
                {/* FIXED spelling to item.sheduledAt */}
                <Text style={styles.dateText}>📅 {new Date(item.sheduledAt).toLocaleDateString()}</Text>
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

// ... styles remain the same

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    marginTop: 20, 
    marginBottom: 10 
  },
  backBtn: { padding: 5, marginRight: 10 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#2D5016' },
  listContent: { paddingHorizontal: 20, paddingBottom: 30 },
  card: { 
    backgroundColor: '#F9F9F9', 
    borderRadius: 15, 
    padding: 15, 
    marginBottom: 15, 
    borderWidth: 1, 
    borderColor: '#EEE',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2
  },
  cardHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 10
  },
  tagWrapper: { 
    backgroundColor: '#E8F5E9', 
    paddingHorizontal: 10, 
    paddingVertical: 4, 
    borderRadius: 5 
  },
  diseaseTag: { color: '#2E7D32', fontSize: 12, fontWeight: 'bold' },
  timeText: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  medicineName: { fontSize: 18, fontWeight: '600', color: '#00D46A', marginBottom: 10 },
  notesContainer: { marginBottom: 10 },
  notes: { fontSize: 14, color: '#666', fontStyle: 'italic' },
  cardFooter: { borderTopWidth: 1, borderTopColor: '#EEE', paddingTop: 10 },
  dateText: { fontSize: 12, color: '#999' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#999', fontSize: 16, marginTop: 10 }
});