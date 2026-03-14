import React, { useState, useEffect } from 'react';
import { 
  View, Text, FlatList, StyleSheet, TouchableOpacity, 
  SafeAreaView, Image, ActivityIndicator 
} from 'react-native';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import { Ionicons } from '@expo/vector-icons';

export default function RemedyDetails({ route, navigation }) {
  const { diseaseId, diseaseName } = route.params;
  const [remedies, setRemedies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    // Fetch all records for this disease. 
    // They are stored in: diseases > [diseaseName] > remedies
    const q = query(
      collection(db, "diseases", diseaseId, "remedies"),
      where("userId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Sort: Newest medicine entries appear at the top
      list.sort((a, b) => new Date(b.scheduledAt) - new Date(a.scheduledAt));
      
      setRemedies(list);
      setLoading(false);
    }, (error) => {
      console.error("Fetch error:", error);
      setLoading(false);
    });

    return unsubscribe;
  }, [diseaseId]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={26} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>{diseaseName}</Text>
            <Text style={styles.headerSub}>Full Treatment History</Text>
        </View>
        <Image source={require('../assets/logo.png')} style={styles.logo} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#00D46A" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={remedies}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 40, paddingTop: 10 }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="medical-outline" size={60} color="#DDD" />
              <Text style={styles.emptyText}>No medicine records found for this disease.</Text>
            </View>
          }
          renderItem={({ item, index }) => (
            <View style={styles.card}>
              {/* Badge for entry number */}
              <View style={styles.historyBadge}>
                <Text style={styles.badgeText}>Entry #{remedies.length - index}</Text>
              </View>

              <View style={styles.cardTop}>
                <Text style={styles.medName}>💊 {item.medicine}</Text>
                <Text style={styles.dateText}>
                   {new Date(item.scheduledAt).toLocaleDateString([], { 
                     day: '2-digit', month: 'short', year: 'numeric' 
                   })}
                </Text>
              </View>

              <View style={styles.timeRow}>
                <Ionicons name="time-outline" size={14} color="#666" />
                <Text style={styles.timeText}>
                   Used at: {new Date(item.scheduledAt).toLocaleTimeString([], { 
                     hour: '2-digit', minute: '2-digit' 
                   })}
                </Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.detailsGrid}>
                <View style={styles.detailItem}>
                   <Text style={styles.detailLabel}>Doctor</Text>
                   <Text style={styles.detailValue}>{item.doctor || "Not Specified"}</Text>
                </View>
                <View style={styles.detailItem}>
                   <Text style={styles.detailLabel}>Location</Text>
                   <Text style={styles.detailValue}>{item.location || "Not Specified"}</Text>
                </View>
              </View>

              <View style={styles.descSection}>
                <Text style={styles.detailLabel}>Instructions & Notes</Text>
                <Text style={styles.descText}>{item.desc || "No additional notes provided."}</Text>
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FBF9' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingVertical: 15,
    backgroundColor: '#FFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3
  },
  backBtn: { padding: 5 },
  headerTitleContainer: { flex: 1, marginLeft: 15 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#2E7D32' },
  headerSub: { fontSize: 12, color: '#999', marginTop: 2 },
  logo: { width: 35, height: 35 },
  card: { 
    backgroundColor: '#fff', 
    borderRadius: 15, 
    padding: 20, 
    marginHorizontal: 20, 
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3
  },
  historyBadge: {
    position: 'absolute',
    top: -10,
    right: 20,
    backgroundColor: '#2E7D32',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  medName: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  dateText: { fontSize: 12, color: '#2E7D32', fontWeight: 'bold' },
  timeRow: { flexDirection: 'row', alignItems: 'center', marginTop: 5, gap: 5 },
  timeText: { fontSize: 13, color: '#666' },
  divider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 15 },
  detailsGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  detailItem: { flex: 1 },
  detailLabel: { fontSize: 10, color: '#AAA', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 4 },
  detailValue: { fontSize: 14, color: '#444', fontWeight: '600' },
  descSection: { marginTop: 15, backgroundColor: '#F9F9F9', padding: 10, borderRadius: 8 },
  descText: { fontSize: 13, color: '#555', lineHeight: 18, fontStyle: 'italic' },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: '#999', fontSize: 14, marginTop: 10 }
});