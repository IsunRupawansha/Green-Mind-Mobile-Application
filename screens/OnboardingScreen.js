import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';

export default function OnboardingScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.logoContainer}>
        <Image 
          source={require('../assets/logo.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.logoText}>GreenMind</Text>
      </View>

      <View style={styles.imagesContainer}>
        <View style={styles.diamondContainer}>
          <View style={[styles.imageBox, styles.topImage]}>
            <Image 
              source={require('../assets/onboarding1.jpg')} 
              style={styles.plantImage}
            />
          </View>
          
          <View style={styles.middleRow}>
            <View style={[styles.imageBox, styles.leftImage]}>
              <Image 
                source={require('../assets/onboarding2.jpg')} 
                style={styles.plantImage}
              />
            </View>
            <View style={[styles.imageBox, styles.rightImage]}>
              <Image 
                source={require('../assets/onboarding3.jpg')} 
                style={styles.plantImage}
              />
            </View>
          </View>
          
          <View style={[styles.imageBox, styles.bottomImage]}>
            <Image 
              source={require('../assets/onboarding4.jpg')} 
              style={styles.plantImage}
            />
          </View>
        </View>
      </View>

      <View style={styles.bottomContainer}>
        <Text style={styles.title}>GreenMind</Text>
        <Text style={styles.subtitle}>Get Started</Text>
        
        <View style={styles.indicator}>
          <View style={[styles.dot, styles.activeDot]} />
        </View>

        <TouchableOpacity 
          style={styles.nextButton}
          onPress={() => navigation.navigate('SignIn')}
        >
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  logo: {
    width: 60,
    height: 60,
  },
  logoText: {
    fontSize: 16,
    color: '#2D5016',
    marginTop: 5,
    fontWeight: '500',
  },
  imagesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 30,
  },
  diamondContainer: {
    alignItems: 'center',
  },
  imageBox: {
    width: 120,
    height: 120,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#000',
    borderWidth: 3,
    borderColor: '#00FF00',
  },
  plantImage: {
    width: '100%',
    height: '100%',
  },
  topImage: {
    marginBottom: 10,
    transform: [{ rotate: '45deg' }],
  },
  middleRow: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 10,
  },
  leftImage: {
    transform: [{ rotate: '45deg' }],
  },
  rightImage: {
    transform: [{ rotate: '45deg' }],
  },
  bottomImage: {
    transform: [{ rotate: '45deg' }],
  },
  bottomContainer: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  indicator: {
    flexDirection: 'row',
    marginBottom: 30,
  },
  dot: {
    width: 40,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
  },
  activeDot: {
    backgroundColor: '#000',
  },
  nextButton: {
    backgroundColor: '#00D46A',
    paddingVertical: 16,
    paddingHorizontal: 120,
    borderRadius: 10,
    width: '85%',
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});