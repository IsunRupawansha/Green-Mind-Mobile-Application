import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebaseConfig';

// Import the new Provider
import { ChatProvider } from './context/ChatContext';

// --- CORE SCREENS ---
import OnboardingScreen from './screens/OnboardingScreen';
import SignInScreen from './screens/SignInScreen';
import SignUpScreen from './screens/SignUpScreen';
import DashboardScreen from './screens/DashboardScreen';
import PlantIdentifierScreen from './screens/PlantIdentifierScreen';
import ChatScreen from './screens/ChatScreen';
import HistoryScreen from './screens/HistoryScreen';
import ProfileScreen from './screens/ProfileScreen'; 

// --- REMEDY SCREENS ---
import DiseaseListScreen from './screens/DiseaseListScreen';
import RemedyDetails from './screens/RemedyDetails';
import AddRemedy from './screens/AddRemedy';
import RemedyHistoryScreen from './screens/RemedyHistoryScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (authenticatedUser) => {
      setUser(authenticatedUser);
      if (initializing) setInitializing(false);
    });

    return unsubscribe;
  }, [initializing]);

  if (initializing) return null;

  return (
    <ChatProvider>
      <NavigationContainer>
        <Stack.Navigator 
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        >
          {user ? (
            <Stack.Group>
              <Stack.Screen name="Dashboard" component={DashboardScreen} />
              <Stack.Screen name="PlantIdentifier" component={PlantIdentifierScreen} />
              <Stack.Screen name="ChatScreen" component={ChatScreen} />
              <Stack.Screen name="HistoryScreen" component={HistoryScreen} />
              <Stack.Screen name="DiseaseList" component={DiseaseListScreen} />
              <Stack.Screen name="RemedyDetails" component={RemedyDetails} />
              <Stack.Screen name="AddRemedy" component={AddRemedy} />
              <Stack.Screen name="RemedyHistory" component={RemedyHistoryScreen} /> 
              <Stack.Screen name="Profile" component={ProfileScreen} />
            
            </Stack.Group>
          ) : (
            <Stack.Group>
              <Stack.Screen name="Onboarding" component={OnboardingScreen} />
              <Stack.Screen name="SignIn" component={SignInScreen} />
              <Stack.Screen name="SignUp" component={SignUpScreen} />
            </Stack.Group>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </ChatProvider>
  );
}