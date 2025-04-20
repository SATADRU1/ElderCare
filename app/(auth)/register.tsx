import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft } from 'lucide-react-native';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'elderly' | 'caregiver'>('elderly');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { user } = useAuth();

  // Redirect to tabs if user is already logged in
  useEffect(() => {
    if (user) {
      router.replace('/(tabs)');
    }
  }, [user]);

  const handleRegister = async () => {
    // Validate inputs
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all required fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // In a real app, this would call an API to create the account
    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // Navigate to login screen after "successful" registration
      router.replace('/login');
    } catch (err) {
      setError('Registration failed. Please try again.');
      console.error('Registration error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Account</Text>
        </View>

        <View style={styles.formContainer}>
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.roleSelection}>
            <Text style={styles.roleLabel}>I am a:</Text>
            <View style={styles.roleButtons}>
              <TouchableOpacity 
                style={[
                  styles.roleButton, 
                  role === 'elderly' && styles.roleButtonActive
                ]}
                onPress={() => setRole('elderly')}
              >
                <Text style={[
                  styles.roleButtonText,
                  role === 'elderly' && styles.roleButtonTextActive
                ]}>
                  Elderly User
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.roleButton, 
                  role === 'caregiver' && styles.roleButtonActive
                ]}
                onPress={() => setRole('caregiver')}
              >
                <Text style={[
                  styles.roleButtonText,
                  role === 'caregiver' && styles.roleButtonTextActive
                ]}>
                  Caregiver
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter your full name"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Phone (optional)</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Create a password"
              secureTextEntry
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Confirm Password</Text>
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm your password"
              secureTextEntry
            />
          </View>

          <TouchableOpacity 
            style={styles.registerButton}
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.registerButtonText}>Create Account</Text>
            )}
          </TouchableOpacity>

          <View style={styles.loginPrompt}>
            <Text style={styles.loginPromptText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.replace('/login')}>
              <Text style={styles.loginLink}>Log In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    marginLeft: 20,
  },
  formContainer: {
    flex: 1,
    padding: 20,
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  errorText: {
    fontFamily: 'Inter-Regular',
    color: '#c62828',
    fontSize: 16,
  },
  roleSelection: {
    marginBottom: 24,
  },
  roleLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 18,
    marginBottom: 12,
  },
  roleButtons: {
    flexDirection: 'row',
  },
  roleButton: {
    flex: 1,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f1f1f1',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  roleButtonActive: {
    backgroundColor: '#3498db',
  },
  roleButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#666',
  },
  roleButtonTextActive: {
    color: '#fff',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    height: 55,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  registerButton: {
    backgroundColor: '#3498db',
    height: 55,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  registerButtonText: {
    fontFamily: 'Inter-Bold',
    color: '#fff',
    fontSize: 18,
  },
  loginPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  loginPromptText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#666',
  },
  loginLink: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#3498db',
  },
});