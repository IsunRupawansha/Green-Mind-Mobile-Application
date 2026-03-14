import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, 
  ScrollView, Alert, SafeAreaView, ActivityIndicator 
} from 'react-native';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [position, setPosition] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchCurrentData();
  }, []);

  const fetchCurrentData = async () => {
    try {
      const user = auth.currentUser;
      const docSnap = await getDoc(doc(db, "users", user.uid));
      if (docSnap.exists()) {
        setUsername(docSnap.data().username || '');
        setPosition(docSnap.data().position || '');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!username.trim()) return Alert.alert("Error", "Username cannot be empty");
    setUpdating(true);
    try {
      const userRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userRef, { username, position });
      Alert.alert("Success", "Profile updated successfully!");
    } catch (error) {
      Alert.alert("Error", "Failed to update profile.");
    } finally {
      setUpdating(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      return Alert.alert("Error", "Please fill both password fields");
    }
    if (newPassword.length < 6) {
      return Alert.alert("Error", "New password must be at least 6 characters");
    }

    setUpdating(true);
    try {
      const user = auth.currentUser;
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      
      // Re-authenticate user before allowing password change
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      
      setCurrentPassword('');
      setNewPassword('');
      Alert.alert("Success", "Password changed successfully!");
    } catch (error) {
      Alert.alert("Error", "Authentication failed. Check your current password.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <ActivityIndicator style={{flex:1}} size="large" color="#00D46A" />;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Account Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Info Section */}
        <Text style={styles.sectionTitle}>Profile Information</Text>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Username</Text>
          <TextInput 
            style={styles.input} 
            value={username} 
            onChangeText={setUsername} 
            placeholder="Edit username"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Position / Role</Text>
          <TextInput 
            style={styles.input} 
            value={position} 
            onChangeText={setPosition} 
            placeholder="e.g. Student, Herbalist"
          />
        </View>

        <TouchableOpacity 
          style={styles.saveButton} 
          onPress={handleUpdateProfile}
          disabled={updating}
        >
          <Text style={styles.saveButtonText}>{updating ? "Updating..." : "Update Profile"}</Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        {/* Password Section */}
        <Text style={styles.sectionTitle}>Change Password</Text>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Current Password</Text>
          <TextInput 
            style={styles.input} 
            secureTextEntry 
            value={currentPassword}
            onChangeText={setCurrentPassword}
            placeholder="Enter existing password"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>New Password</Text>
          <TextInput 
            style={styles.input} 
            secureTextEntry 
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="Enter new password"
          />
        </View>

        <TouchableOpacity 
          style={[styles.saveButton, { backgroundColor: '#333' }]} 
          onPress={handleChangePassword}
          disabled={updating}
        >
          <Text style={styles.saveButtonText}>Change Password</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  scrollContent: { padding: 20 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#00D46A', marginBottom: 20, marginTop: 10 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, color: '#666', marginBottom: 8 },
  input: { backgroundColor: '#F9F9F9', borderWidth: 1, borderColor: '#EEE', borderRadius: 10, padding: 15, fontSize: 16 },
  saveButton: { backgroundColor: '#00D46A', borderRadius: 10, padding: 18, alignItems: 'center', marginTop: 10 },
  saveButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  divider: { height: 1, backgroundColor: '#EEE', marginVertical: 30 }
});