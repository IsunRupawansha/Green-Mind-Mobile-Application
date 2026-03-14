import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, StatusBar } from 'react-native';
import { auth, db } from '../firebaseConfig';
import { doc, onSnapshot } from 'firebase/firestore';
import * as Notifications from 'expo-notifications';
import { Ionicons } from '@expo/vector-icons';

export default function DashboardScreen({ navigation }) {
  const [hasNotifications, setHasNotifications] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // 1. Listen for real-time profile updates
    const user = auth.currentUser;
    let unsubscribeUser = () => {};

    if (user) {
      unsubscribeUser = onSnapshot(doc(db, "users", user.uid), (doc) => {
        if (doc.exists()) {
          setUserData(doc.data());
        }
      });
    }

    // 2. Listen for notifications
    const subscription = Notifications.addNotificationReceivedListener(notification => {
      setHasNotifications(true);
    });

    return () => {
      unsubscribeUser();
      subscription.remove();
    };
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Updated Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Hello,</Text>
          <Text style={styles.userNameText}>{userData?.username || 'Green Friend'}</Text>
        </View>
        
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.notificationButton} 
            onPress={() => {
              setHasNotifications(false);
              navigation.navigate('RemedyHistory');
            }}
          >
            <Ionicons name="notifications-outline" size={26} color="#333" />
            {hasNotifications && <View style={styles.badge} />}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => navigation.navigate('Profile')}
          >
            {userData?.profilePic ? (
              <Image source={{ uri: userData.profilePic }} style={styles.profileCircle} />
            ) : (
              <View style={[styles.profileCircle, styles.profilePlaceholder]}>
                <Ionicons name="person" size={20} color="#FFF" />
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Brand Logo Section */}
      <View style={styles.logoContainer}>
        <Image 
          source={require('../assets/logo.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.logoText}>GreenMind</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Discover the Power{'\n'}of Herbal Wisdom</Text>
        <Text style={styles.subtitle}>
          Harness the ancient knowledge of herbal{'\n'}
          plants combined with modern AI technology{'\n'}
          to improve your health and wellness
        </Text>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.aiButton]}
            onPress={() => navigation.navigate('ChatScreen')}
          >
            <View style={styles.buttonContent}>
               <View>
                  <Text style={styles.buttonTitle}>AI Chatbot Agent</Text>
                  <Text style={styles.buttonSubtitle}>
                    Chat with our intelligent herbalist assistant
                  </Text>
               </View>
               <Ionicons name="chatbubbles" size={30} color="rgba(0,0,0,0.15)" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.identifierButton]}
            onPress={() => navigation.navigate('PlantIdentifier')}
          >
            <View style={styles.buttonContent}>
               <View>
                  <Text style={styles.buttonTitle}>Plant Identifier</Text>
                  <Text style={styles.buttonSubtitle}>
                    Identify any herbal plant instantly using AI
                  </Text>
               </View>
               <Ionicons name="scan" size={30} color="rgba(0,0,0,0.15)" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, styles.remediesButton]}
          onPress={() => navigation.navigate('DiseaseList')}>
            <View style={styles.buttonContent}>
               <View>
                  <Text style={styles.buttonTitle}>Disease Remedies</Text>
                  <Text style={styles.buttonSubtitle}>
                    Discover natural plant-based solutions
                  </Text>
               </View>
               <Ionicons name="leaf" size={30} color="rgba(0,0,0,0.15)" />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
  },
  welcomeText: { fontSize: 14, color: '#888' },
  userNameText: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  notificationButton: { position: 'relative', padding: 5 },
  badge: {
    position: 'absolute',
    right: 5,
    top: 5,
    backgroundColor: '#FF3B30',
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'white'
  },
  profileButton: { padding: 5 },
  profileCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#666', overflow: 'hidden' },
  profilePlaceholder: { justifyContent: 'center', alignItems: 'center', backgroundColor: '#00D46A' },
  logoContainer: { alignItems: 'center', marginVertical: 15 },
  logo: { width: 50, height: 50 },
  logoText: { fontSize: 16, color: '#2D5016', marginTop: 5, fontWeight: '500' },
  content: { flex: 1, paddingHorizontal: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#000', textAlign: 'center', marginBottom: 12, lineHeight: 32 },
  subtitle: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 25, lineHeight: 20 },
  buttonsContainer: { gap: 15 },
  button: { padding: 20, borderRadius: 20, minHeight: 100, justifyContent: 'center' },
  buttonContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  aiButton: { backgroundColor: '#5bd09b' }, // Softer mint
  identifierButton: { backgroundColor: '#A8DCAB' }, // Softer green
  remediesButton: { backgroundColor: '#F8F3E1' }, // Softer leaf
  buttonTitle: { fontSize: 18, fontWeight: 'bold', color: '#1B3A1B', marginBottom: 4 },
  buttonSubtitle: { fontSize: 12, color: '#4A634A', lineHeight: 18, maxWidth: '80%' },
});