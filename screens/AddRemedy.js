import React, { useState } from 'react';
import { 
  View, ScrollView, TextInput, TouchableOpacity, StyleSheet, 
  Text, Image, Alert, KeyboardAvoidingView, Platform, ActivityIndicator 
} from 'react-native';
import { collection, addDoc, doc, setDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Notifications from 'expo-notifications';

export default function AddRemedy({ navigation, route }) {
  const incomingData = route.params?.remedy;
  
  // Determine if we are editing a SPECIFIC entry or adding a NEW one to an existing disease
  const isEditing = incomingData?.id && !incomingData?.isQuickAdd;

  const [isSaving, setIsSaving] = useState(false);

  const [form, setForm] = useState({
    disease: incomingData?.disease || '',
    medicine: isEditing ? incomingData?.medicine : '', // Clear medicine for new history entry
    doctor: incomingData?.doctor || '',
    location: incomingData?.location || '',
    desc: isEditing ? incomingData?.desc : '' // Clear notes for new history entry
  });

  const [date, setDate] = useState(isEditing ? new Date(incomingData.scheduledAt) : new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [mode, setMode] = useState('date');

  const onDateChange = (event, selectedDate) => {
    setShowPicker(false);
    if (selectedDate) setDate(selectedDate);
  };

  const saveRemedy = async () => {
    if (!form.disease || !form.medicine) {
      Alert.alert("Required Fields", "Please enter both the Disease and the Medicine name.");
      return;
    }

    setIsSaving(true);

    try {
      const user = auth.currentUser;
      const diseaseName = form.disease.trim();

      // 1. Ensure the parent Disease document exists
      const diseaseRef = doc(db, "diseases", diseaseName);
      await setDoc(diseaseRef, { name: diseaseName }, { merge: true });

      // 2. Prepare the data object
      const remedyData = {
        ...form,
        disease: diseaseName,
        userId: user.uid,
        scheduledAt: date.toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (isEditing) {
        // Update specific existing record
        const remedyRef = doc(db, "diseases", diseaseName, "remedies", incomingData.id);
        await updateDoc(remedyRef, remedyData);
      } else {
        // Create a NEW record in the history (Sub-collection)
        remedyData.createdAt = new Date().toISOString();
        await addDoc(collection(db, "diseases", diseaseName, "remedies"), remedyData);
      }

      // 3. Notification confirmation
      /*await Notifications.scheduleNotificationAsync({
        content: {
          title: "GreenMind History Updated 🌿",
          body: `${form.medicine} added to ${diseaseName} records.`,
        },
        trigger: null,
      });*/

      Alert.alert("Success", "Medicine record saved to history!");
      navigation.goBack();
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Something went wrong while saving. Please check your connection.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={{ flex: 1 }}
    >
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.logoContainer}>
          <Image source={require('../assets/logo.png')} style={styles.logo} resizeMode="contain" />
          <Text style={styles.brandName}>GreenMind</Text>
        </View>

        <Text style={styles.headerTitle}>
          {isEditing ? "Edit Medicine Record" : "New History Entry"}
        </Text>

        <View style={styles.formCard}>
          <Text style={styles.label}>Disease Name</Text>
          <TextInput 
            style={[styles.input, incomingData?.disease && styles.disabledInput]} 
            placeholder="e.g. Gastritis"
            value={form.disease}
            onChangeText={(t) => setForm({...form, disease: t})}
            editable={!incomingData?.disease && !isSaving} 
          />

          <Text style={styles.label}>Medicine to Use</Text>
          <TextInput 
            style={styles.input} 
            placeholder="e.g. Panadol or Herbal Tea"
            value={form.medicine}
            onChangeText={(t) => setForm({...form, medicine: t})}
            editable={!isSaving}
          />

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={styles.label}>Doctor</Text>
              <TextInput 
                style={styles.input} 
                placeholder="Dr. Name"
                value={form.doctor}
                onChangeText={(t) => setForm({...form, doctor: t})}
                editable={!isSaving}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Location</Text>
              <TextInput 
                style={styles.input} 
                placeholder="City/Clinic"
                value={form.location}
                onChangeText={(t) => setForm({...form, location: t})}
                editable={!isSaving}
              />
            </View>
          </View>

          <Text style={styles.label}>Date & Time Used</Text>
          <View style={styles.dateTimeRow}>
            <TouchableOpacity 
              style={styles.pickerBtn} 
              onPress={() => {setMode('date'); setShowPicker(true);}}
              disabled={isSaving}
            >
              <Text style={styles.pickerText}>📅 {date.toLocaleDateString()}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.pickerBtn} 
              onPress={() => {setMode('time'); setShowPicker(true);}}
              disabled={isSaving}
            >
              <Text style={styles.pickerText}>⏰ {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
            </TouchableOpacity>
          </View>

          {showPicker && (
            <DateTimePicker
              value={date}
              mode={mode}
              is24Hour={true}
              onChange={onDateChange}
            />
          )}

          <Text style={styles.label}>Instructions / Notes</Text>
          <TextInput 
            style={[styles.input, styles.textArea]} 
            placeholder="Dosage instructions, meals, etc."
            multiline
            numberOfLines={4}
            value={form.desc}
            onChangeText={(t) => setForm({...form, desc: t})}
            editable={!isSaving}
          />
        </View>

        <TouchableOpacity 
          style={[styles.saveBtn, isSaving && styles.disabledBtn]} 
          onPress={saveRemedy}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.saveBtnText}>Save to History</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.cancelBtn} 
          onPress={() => navigation.goBack()}
          disabled={isSaving}
        >
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF', paddingHorizontal: 20 },
  logoContainer: { alignItems: 'center', marginTop: 30, marginBottom: 10 },
  logo: { width: 50, height: 50 },
  brandName: { color: '#2E7D32', fontWeight: 'bold', fontSize: 14, marginTop: 5 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 25, color: '#333' },
  formCard: { backgroundColor: '#fff' },
  label: { fontSize: 13, fontWeight: '700', color: '#666', marginBottom: 8, textTransform: 'uppercase' },
  row: { flexDirection: 'row' },
  input: { 
    backgroundColor: '#F9F9F9', 
    borderRadius: 12, 
    padding: 14, 
    fontSize: 16, 
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    color: '#333'
  },
  disabledInput: { backgroundColor: '#F0F0F0', color: '#999' },
  textArea: { height: 100, textAlignVertical: 'top' },
  dateTimeRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  pickerBtn: { 
    backgroundColor: '#E8F5E9', 
    paddingVertical: 14, 
    borderRadius: 12, 
    width: '48%', 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#C8E6C9'
  },
  pickerText: { color: '#2E7D32', fontWeight: 'bold' },
  saveBtn: { 
    backgroundColor: '#00D46A', 
    padding: 18, 
    borderRadius: 15, 
    alignItems: 'center', 
    marginTop: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2
  },
  disabledBtn: { backgroundColor: '#A5D6A7' },
  saveBtnText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  cancelBtn: { padding: 15, alignItems: 'center', marginTop: 10 },
  cancelBtnText: { color: '#999', fontSize: 15, fontWeight: '600' }
});