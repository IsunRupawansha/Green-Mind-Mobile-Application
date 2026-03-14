import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, Modal, Alert, SafeAreaView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
// Import Ionicons if you want a back arrow icon (standard in Expo)
import { Ionicons } from '@expo/vector-icons'; 

export default function PlantIdentifierScreen({ navigation }) { // Receive navigation prop here
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [plantData, setPlantData] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const HF_API_URL = "https://isunmr-herbal-plant-identifier.hf.space/predict";

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      uploadAndIdentify(result.assets[0].uri);
    }
  };

  const uploadAndIdentify = async (uri) => {
    setLoading(true);
    const formData = new FormData();
    formData.append('image', { uri, type: 'image/jpeg', name: 'upload.jpg' });

    try {
      const response = await fetch(HF_API_URL, {
        method: 'POST',
        body: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const data = await response.json();

      if (data.success) {
        setPlantData(data);
        setModalVisible(true);
      } else {
        Alert.alert("Identification Failed", data.error || "Could not identify plant.");
      }
    } catch (error) {
      Alert.alert("Error", "Server is offline. Check your Hugging Face Space status.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Navigation Bar */}
      <View style={styles.navBar}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()} // This takes the user back to Dashboard
        >
          <Ionicons name="arrow-back" size={25} color="#2d5a27" />
          <Text style={styles.backText}>Dashboard</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.header}>Herbal Scanner</Text>
      
      <View style={styles.card}>
        {image ? <Image source={{ uri: image }} style={styles.image} /> : <Text>Select a plant photo</Text>}
      </View>

      <TouchableOpacity style={styles.button} onPress={pickImage} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Identify Plant</Text>}
      </TouchableOpacity>

      {/* Results Popup */}
      <Modal animationType="slide" transparent={true} visible={modalVisible}>
        <View style={styles.modalContent}>
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            {plantData && (
              <>
                <Text style={styles.modalTitle}>{plantData.localName}</Text>
                <Text style={styles.scientificText}>{plantData.scientificName}</Text>
                <View style={styles.divider} />
                <Text style={styles.contentText}>{plantData.content}</Text>
              </>
            )}
            <TouchableOpacity style={styles.closeBtn} onPress={() => setModalVisible(false)}>
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  navBar: {
    width: '100%',
    paddingHorizontal: 20,
    paddingTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  backText: {
    fontSize: 16,
    color: '#2d5a27',
    fontWeight: '600',
    marginLeft: 5,
  },
  header: { fontSize: 26, fontWeight: 'bold', textAlign: 'center', marginVertical: 10, color: '#2d5a27' },
  card: { alignSelf: 'center', width: '90%', height: 300, backgroundColor: '#eee', borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  image: { width: '100%', height: '100%', borderRadius: 15 },
  button: { alignSelf: 'center', backgroundColor: '#2d5a27', padding: 15, borderRadius: 10, width: '80%', alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  modalContent: { flex: 1, backgroundColor: '#fff', marginTop: 50, borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 20, elevation: 10 },
  scrollContainer: { paddingBottom: 40 },
  modalTitle: { fontSize: 24, fontWeight: 'bold', color: '#2d5a27' },
  scientificText: { fontSize: 18, fontStyle: 'italic', color: '#555', marginBottom: 10 },
  divider: { height: 1, backgroundColor: '#ddd', marginVertical: 15 },
  contentText: { fontSize: 16, lineHeight: 24, color: '#333' },
  closeBtn: { backgroundColor: '#a52a2a', padding: 15, borderRadius: 10, marginTop: 20, alignItems: 'center' }
});