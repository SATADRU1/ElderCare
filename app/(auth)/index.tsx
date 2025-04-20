import React, { useEffect } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, Platform } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Heart, Activity, Bell, Clock } from 'lucide-react-native';

export default function WelcomeScreen() {
  const { user } = useAuth();

  // Redirect to tabs if user is already logged in
  useEffect(() => {
    if (user) {
      router.replace('/(tabs)');
    }
  }, [user]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#3498db', '#2980b9']}
        style={styles.gradient}
      >
        <View style={styles.headerContainer}>
          <Text style={styles.appName}>ElderCare</Text>
          <Text style={styles.tagline}>Caring support for independent living</Text>
        </View>

        <View style={styles.featuresContainer}>
          <View style={styles.featureItem}>
            <View style={styles.featureIconContainer}>
              <Bell color="#ffffff" size={32} />
            </View>
            <Text style={styles.featureText}>Medication Reminders</Text>
          </View>
          
          <View style={styles.featureItem}>
            <View style={styles.featureIconContainer}>
              <Clock color="#ffffff" size={32} />
            </View>
            <Text style={styles.featureText}>Appointment Tracking</Text>
          </View>
          
          <View style={styles.featureItem}>
            <View style={styles.featureIconContainer}>
              <Activity color="#ffffff" size={32} />
            </View>
            <Text style={styles.featureText}>Health Monitoring</Text>
          </View>
          
          <View style={styles.featureItem}>
            <View style={styles.featureIconContainer}>
              <Heart color="#ffffff" size={32} />
            </View>
            <Text style={styles.featureText}>Caregiver Connection</Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.loginButton]}
            onPress={() => router.push('/login')}
          >
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.registerButton]}
            onPress={() => router.push('/register')}
          >
            <Text style={[styles.buttonText, styles.registerButtonText]}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    padding: 20,
  },
  headerContainer: {
    marginTop: 60,
    alignItems: 'center',
  },
  appName: {
    fontFamily: 'Inter-Bold',
    fontSize: 48,
    color: '#ffffff',
    textAlign: 'center',
  },
  tagline: {
    fontFamily: 'Inter-Regular',
    fontSize: 18,
    color: '#ffffff',
    textAlign: 'center',
    marginTop: 10,
    opacity: 0.9,
  },
  featuresContainer: {
    marginTop: 60,
    flexDirection: Platform.OS === 'web' && window.innerWidth > 768 ? 'row' : 'column',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureItem: {
    width: Platform.OS === 'web' && window.innerWidth > 768 ? '45%' : '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: 15,
    borderRadius: 12,
  },
  featureIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  featureText: {
    fontFamily: 'Inter-Medium',
    fontSize: 18,
    color: '#ffffff',
    flex: 1,
  },
  buttonContainer: {
    marginTop: 'auto',
    marginBottom: 40,
  },
  button: {
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  loginButton: {
    backgroundColor: '#ffffff',
  },
  registerButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  buttonText: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#3498db',
  },
  registerButtonText: {
    color: '#ffffff',
  },
});