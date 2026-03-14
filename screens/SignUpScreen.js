import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, StatusBar, Alert, ScrollView } from 'react-native';
import { auth, db } from '../firebaseConfig';
import { createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

export default function SignUpScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [position, setPosition] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // States for toggling password visibility
  const [secureText, setSecureText] = useState(true);
  const [secureConfirmText, setSecureConfirmText] = useState(true);

  const handleSignUp = async () => {
    if (!email || !password || !username) {
      Alert.alert("Error", "All fields are required.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        username,
        position,
        email,
        createdAt: new Date().toISOString()
      });

      await signOut(auth);
      Alert.alert("Success", "Account created! Please sign in.");
      //navigation.navigate('SignIn');
    } catch (error) {
      Alert.alert("Sign Up Error", error.message);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.logoContainer}>
        <Image source={require('../assets/logo.png')} style={styles.logo} resizeMode="contain" />
        <Text style={styles.logoText}>GreenMind</Text>
      </View>
      <Text style={styles.welcomeText}>Welcome !</Text>
      <View style={styles.formContainer}>
        <View style={styles.inputContainer}><Text style={styles.inputIcon}>👤</Text><TextInput style={styles.input} placeholder="Enter User Name" value={username} onChangeText={setUsername} /></View>
        <View style={styles.inputContainer}><Text style={styles.inputIcon}>⚙️</Text><TextInput style={styles.input} placeholder="Enter Your Position" value={position} onChangeText={setPosition} /></View>
        <View style={styles.inputContainer}><Text style={styles.inputIcon}>✉️</Text><TextInput style={styles.input} placeholder="Enter Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" /></View>
        
        {/* Password with Toggle */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputIcon}>🔒</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Enter Password" 
            value={password} 
            onChangeText={setPassword} 
            secureTextEntry={secureText} 
          />
          <TouchableOpacity onPress={() => setSecureText(!secureText)}>
            <Text style={styles.toggleIcon}>{secureText ? "👁️" : "🙈"}</Text>
          </TouchableOpacity>
        </View>

        {/* Confirm Password with Toggle */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputIcon}>🔒</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Re-Enter Password" 
            value={confirmPassword} 
            onChangeText={setConfirmPassword} 
            secureTextEntry={secureConfirmText} 
          />
          <TouchableOpacity onPress={() => setSecureConfirmText(!secureConfirmText)}>
            <Text style={styles.toggleIcon}>{secureConfirmText ? "👁️" : "🙈"}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.signupButton} onPress={handleSignUp}><Text style={styles.signupButtonText}>Sign Up</Text></TouchableOpacity>
        <View style={styles.signinContainer}>
          <Text style={styles.signinText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('SignIn')}><Text style={styles.signinLink}>SignIn</Text></TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF', paddingHorizontal: 20 },
  logoContainer: { alignItems: 'center', marginTop: 60, marginBottom: 30 },
  logo: { width: 60, height: 60 },
  logoText: { fontSize: 16, color: '#2D5016', marginTop: 5, fontWeight: '500' },
  welcomeText: { fontSize: 28, fontWeight: 'bold', color: '#000', textAlign: 'center', marginBottom: 25 },
  formContainer: { flex: 1 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5', borderRadius: 10, paddingHorizontal: 15, paddingVertical: 12, marginBottom: 12, borderWidth: 1, borderColor: '#E0E0E0' },
  inputIcon: { fontSize: 20, marginRight: 10 },
  input: { flex: 1, fontSize: 16, color: '#000' },
  toggleIcon: { fontSize: 18, paddingRight: 5 }, // Style for the eye icon
  signupButton: { backgroundColor: '#00D46A', paddingVertical: 16, borderRadius: 10, alignItems: 'center', marginTop: 10, marginBottom: 15 },
  signupButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  signinContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 10, marginBottom: 30 },
  signinText: { color: '#666', fontSize: 14 },
  signinLink: { color: '#00D46A', fontSize: 14, fontWeight: '600' },
});