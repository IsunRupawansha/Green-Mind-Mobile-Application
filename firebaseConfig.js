// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB70nawKAfsNJeEbVSyDIkCgKhTiGcuiaE",
  authDomain: "greenmind-e84ab.firebaseapp.com",
  projectId: "greenmind-e84ab",
  storageBucket: "greenmind-e84ab.firebasestorage.app",
  messagingSenderId: "103677973051",
  appId: "1:103677973051:web:20eedcd62f27c1e494821e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Initialize Auth with Persistence so it stays logged in
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

const db = getFirestore(app);

export { auth, db };