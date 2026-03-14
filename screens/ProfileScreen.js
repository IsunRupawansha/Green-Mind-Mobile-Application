import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  SafeAreaView, 
  ActivityIndicator, 
  Alert,
  Linking // Added for opening WhatsApp/Email
} from 'react-native';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { signOut } from 'firebase/auth';

export default function ProfileScreen({ navigation }) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserData(docSnap.data());
        }
      }
    } catch (error) {
      console.error("Error fetching user:", error);
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need access to your gallery to change your profile picture.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      const selectedImage = result.assets[0].uri;
      updateProfilePicture(selectedImage);
    }
  };

  const updateProfilePicture = async (uri) => {
    try {
      const user = auth.currentUser;
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, { profilePic: uri });
      setUserData({ ...userData, profilePic: uri });
      Alert.alert("Success", "Profile photo updated!");
    } catch (error) {
      Alert.alert("Error", "Could not update photo.");
    }
  };

  const handleSupport = () => {
    Alert.alert(
      "Support & Help",
      "Contact us via:\n\n📞 WhatsApp:\n+94 77 059 5659\n+94 77 123 4567\n\n✉️ Email:\nsrupawansha@gmail.com",
      [
        { text: "Close", style: "cancel" },
        { 
          text: "Email Us", 
          onPress: () => Linking.openURL('mailto:srupawansha@gmail.com') 
        }
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: () => signOut(auth) }
    ]);
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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={{ width: 24 }} /> 
      </View>

      {/* Profile Info */}
      <View style={styles.profileSection}>
        <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
          {userData?.profilePic ? (
            <Image source={{ uri: userData.profilePic }} style={styles.profileImage} />
          ) : (
            <View style={styles.placeholderImage}>
              <Ionicons name="person" size={50} color="#AAA" />
            </View>
          )}
        </TouchableOpacity>
        <Text style={styles.userName}>{userData?.username || "User Name"}</Text>
        <Text style={styles.userEmail}>{userData?.email || "user@gmail.com"}</Text>
      </View>

      {/* Menu Options */}
      <View style={styles.menuContainer}>
        <MenuOption 
            icon="settings-outline" 
            title="Settings" 
            onPress={() => navigation.navigate('Settings')} 
        />
        <MenuOption 
            icon="notifications-outline" 
            title="Notifications" 
            onPress={() => navigation.navigate('RemedyHistory')} 
        />
        <MenuOption 
            icon="help-circle-outline" 
            title="Support and Help" 
            onPress={handleSupport} 
        />
        <MenuOption 
            icon="log-out-outline" 
            title="Logout" 
            onPress={handleLogout} 
            isLast 
        />
      </View>
    </SafeAreaView>
  );
}

function MenuOption({ icon, title, onPress, isLast }) {
  return (
    <TouchableOpacity 
      style={[styles.menuItem, isLast && { borderBottomWidth: 0 }]} 
      onPress={onPress}
    >
      <View style={styles.menuItemLeft}>
        <Ionicons name={icon} size={20} color="#555" style={styles.menuIcon} />
        <Text style={styles.menuText}>{title}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#CCC" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 20, 
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0'
  },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#333' },
  backButton: { padding: 5 },
  profileSection: { alignItems: 'center', marginVertical: 30 },
  imageContainer: { 
    width: 100, 
    height: 100, 
    borderRadius: 50, 
    backgroundColor: '#F5F5F5',
    overflow: 'hidden',
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  profileImage: { width: '100%', height: '100%' },
  placeholderImage: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  userName: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  userEmail: { fontSize: 14, color: '#888', marginTop: 5 },
  menuContainer: { 
    marginHorizontal: 20, 
    backgroundColor: '#FBFBFB', 
    borderRadius: 15, 
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#F0F0F0'
  },
  menuItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE'
  },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center' },
  menuIcon: { marginRight: 15 },
  menuText: { fontSize: 16, color: '#444', fontWeight: '500' }
});