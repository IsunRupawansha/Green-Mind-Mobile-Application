import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, StatusBar, Alert } from 'react-native';
import { auth } from '../firebaseConfig';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';

WebBrowser.maybeCompleteAuthSession();

export default function SignInScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // 1. New state for password visibility
  const [secureText, setSecureText] = useState(true); 

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: '103677973051-5v9g7cuutuu957lnjq9n025gjf76ctqu.apps.googleusercontent.com',
    androidClientId: '103677973051-2kgd7pbcha949mu2qg0uhm8trre2gehn.apps.googleusercontent.com',
    redirectUri: AuthSession.makeRedirectUri({
      scheme: 'greenmind-app',
    }),
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);
      signInWithCredential(auth, credential)
        .catch((error) => {
          Alert.alert("Google Login Error", error.message);
        });
    }
  }, [response]);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      Alert.alert("Login Failed", "Invalid email or password.");
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.logoContainer}>
        <Image source={require('../assets/logo.png')} style={styles.logo} resizeMode="contain" />
        <Text style={styles.logoText}>GreenMind</Text>
      </View>

      <Text style={styles.welcomeText}>Welcome !</Text>

      <View style={styles.formContainer}>
        <View style={styles.inputContainer}>
          <Text style={styles.inputIcon}>✉️</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Enter Email" 
            value={email} 
            onChangeText={setEmail}
            autoCapitalize="none"
          />
        </View>

        {/* 2. Updated Password Input with Toggle */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputIcon}>🔒</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Enter Password" 
            value={password} 
            onChangeText={setPassword} 
            secureTextEntry={secureText} // Controlled by state
          />
          <TouchableOpacity onPress={() => setSecureText(!secureText)}>
            <Text style={styles.toggleText}>{secureText ? "👁️" : "🙈"}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>

        <Text style={styles.orText}>Or</Text>

        <TouchableOpacity 
          style={styles.googleButton} 
          disabled={!request}
          onPress={() => promptAsync()} 
        >
          <Image 
            source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/5/3e/Google_%22G%22_Logo.svg' }} 
            style={styles.googleIcon} 
          />
          <Text style={styles.googleButtonText}>Login with Google</Text>
        </TouchableOpacity>

        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
            <Text style={styles.signupLink}>SignUp</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF', paddingHorizontal: 20 },
  logoContainer: { alignItems: 'center', marginTop: 80, marginBottom: 40 },
  logo: { width: 60, height: 60 },
  logoText: { fontSize: 16, color: '#2D5016', marginTop: 5, fontWeight: '500' },
  welcomeText: { fontSize: 28, fontWeight: 'bold', color: '#000', textAlign: 'center', marginBottom: 30 },
  formContainer: { flex: 1 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5', borderRadius: 10, paddingHorizontal: 15, paddingVertical: 12, marginBottom: 15, borderWidth: 1, borderColor: '#E0E0E0' },
  inputIcon: { fontSize: 20, marginRight: 10 },
  input: { flex: 1, fontSize: 16, color: '#000' },
  // 3. Added style for toggle text/icon
  toggleText: { color: '#666', fontWeight: 'bold', fontSize: 18 }, 
  loginButton: { backgroundColor: '#00D46A', paddingVertical: 16, borderRadius: 10, alignItems: 'center', marginTop: 10, marginBottom: 15 },
  loginButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  orText: { textAlign: 'center', color: '#999', marginVertical: 10 },
  googleButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E0E0E0', paddingVertical: 16, borderRadius: 10 },
  googleIcon: { width: 20, height: 20, marginRight: 10 },
  googleButtonText: { fontSize: 16, color: '#000', fontWeight: '500' },
  signupContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  signupText: { color: '#666', fontSize: 14 },
  signupLink: { color: '#00D46A', fontSize: 14, fontWeight: '600' },
});