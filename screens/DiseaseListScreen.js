import React, { useState, useEffect } from 'react';
import { 
  View, Text, FlatList, TouchableOpacity, StyleSheet, 
  TextInput, Image, SafeAreaView, Alert, ActivityIndicator 
} from 'react-native';
import { collection, onSnapshot, query, orderBy, doc, getDocs, writeBatch } from 'firebase/firestore';
import { db } from '../firebaseConfig'; 
import { Ionicons } from '@expo/vector-icons';

export default function DiseaseListScreen({ navigation }) {
  const [diseases, setDiseases] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "diseases"), orderBy("name", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setDiseases(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const handleQuickAdd = (diseaseName) => {
    navigation.navigate('AddRemedy', { 
      remedy: { disease: diseaseName, isQuickAdd: true } 
    });
  };

  const handleDeletePress = (id, name) => {
    Alert.alert(
      "Delete Everything?", 
      `This will permanently delete "${name}" and all historical medicine records inside it.`, 
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete All", 
          style: "destructive", 
          onPress: () => deleteDiseaseCompletely(id) 
        }
      ]
    );
  };

  const deleteDiseaseCompletely = async (diseaseId) => {
    setIsDeleting(true);
    try {
      const batch = writeBatch(db);
      const remediesRef = collection(db, "diseases", diseaseId, "remedies");
      const remediesSnap = await getDocs(remediesRef);
      
      remediesSnap.forEach((remedyDoc) => {
        batch.delete(remedyDoc.ref);
      });

      const diseaseRef = doc(db, "diseases", diseaseId);
      batch.delete(diseaseRef);

      await batch.commit();
    } catch (error) {
      Alert.alert("Error", "Failed to delete from database.");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredDiseases = diseases.filter(item => 
    item.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.navigate('Dashboard')} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={28} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerTitleCenter}>
          <Image source={require('../assets/logo.png')} style={styles.miniLogo} />
          <Text style={styles.headerTitleText}>GreenMind</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <Text style={styles.mainTitle}>Disease Records</Text>

      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#666" style={{ marginRight: 10 }} />
          <TextInput 
            placeholder="Search Disease..." 
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('AddRemedy')}>
          <Ionicons name="add" size={30} color="#fff" />
        </TouchableOpacity>
      </View>

      {isDeleting && (
        <View style={styles.loaderOverlay}>
          <ActivityIndicator size="large" color="#FF5252" />
          <Text style={styles.loaderText}>Wiping records...</Text>
        </View>
      )}

      {loading ? (
        <ActivityIndicator size="large" color="#00D46A" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={filteredDiseases}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.listItem}>
              <TouchableOpacity 
                style={{ flex: 1 }}
                onPress={() => navigation.navigate('RemedyDetails', { diseaseId: item.id, diseaseName: item.name })}
              >
                <Text style={styles.itemText}>{item.name}</Text>
                <Text style={styles.subText}>Tap to view treatment timeline</Text>
              </TouchableOpacity>
              <View style={styles.actionButtons}>
                <TouchableOpacity onPress={() => handleQuickAdd(item.name)}>
                  <Ionicons name="add-circle-outline" size={28} color="#00D46A" style={{ marginRight: 15 }} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeletePress(item.id, item.name)}>
                  <Ionicons name="trash-outline" size={22} color="#FF5252" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 20 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 15 },
  headerTitleCenter: { flexDirection: 'row', alignItems: 'center' },
  miniLogo: { width: 30, height: 30, marginRight: 8 },
  headerTitleText: { fontSize: 16, fontWeight: 'bold', color: '#2E7D32' },
  backBtn: { padding: 5 },
  mainTitle: { fontSize: 24, fontWeight: 'bold', marginVertical: 15, textAlign: 'center', color: '#333' },
  searchSection: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5', borderRadius: 25, paddingHorizontal: 15, height: 45, marginRight: 10 },
  searchInput: { flex: 1 },
  addButton: { backgroundColor: '#333', width: 45, height: 45, borderRadius: 22.5, justifyContent: 'center', alignItems: 'center' },
  listItem: { flexDirection: 'row', padding: 18, backgroundColor: '#fff', borderRadius: 15, marginBottom: 12, borderWidth: 1, borderColor: '#EEE', alignItems: 'center' },
  itemText: { fontSize: 17, fontWeight: 'bold', color: '#333' },
  subText: { fontSize: 12, color: '#999', marginTop: 3 },
  actionButtons: { flexDirection: 'row', alignItems: 'center' },
  loaderOverlay: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(255,255,255,0.8)', justifyContent: 'center', alignItems: 'center', zIndex: 999 },
  loaderText: { marginTop: 10, color: '#FF5252', fontWeight: 'bold' }
});