import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft } from 'lucide-react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { login, user } = useAuth();

  // Redirect to tabs if user is already logged in
  useEffect(() => {
    if (user) {
      router.replace('/(tabs)');
    }
  }, [user]);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const success = await login(email, password);
      
      if (success) {
        router.replace('/(tabs)');
      } else {
        setError('Invalid email or password');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (role: 'elderly' | 'caregiver') => {
    try {
      setIsLoading(true);
      setError(null);
      
      let demoEmail = role === 'elderly' ? 'john@example.com' : 'rahul@example.com';
      let demoPassword = 'password123'; // In a real app, use a secure method
      
      const success = await login(demoEmail, demoPassword);
      
      if (success) {
        router.replace('/(tabs)');
      } else {
        setError('Demo login failed. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Demo login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Login</Text>
      </View>

      <View style={styles.formContainer}>
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

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
          <Text style={styles.inputLabel}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            secureTextEntry
          />
        </View>

        <TouchableOpacity 
          style={styles.forgotPassword}
          onPress={() => Alert.alert('Reset Password', 'Password reset functionality would be implemented here.')}
        >
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.loginButton}
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.loginButtonText}>Login</Text>
          )}
        </TouchableOpacity>

        <View style={styles.demoContainer}>
          <Text style={styles.demoHeader}>Demo Logins:</Text>
          <View style={styles.demoButtons}>
            <TouchableOpacity 
              style={[styles.demoButton, styles.elderlyButton]}
              onPress={() => handleDemoLogin('elderly')}
              disabled={isLoading}
            >
              <Text style={styles.demoButtonText}>Elderly User</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.demoButton, styles.caregiverButton]}
              onPress={() => handleDemoLogin('caregiver')}
              disabled={isLoading}
            >
              <Text style={styles.demoButtonText}>Caregiver</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    fontFamily: 'Inter-Regular',
    color: '#3498db',
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: '#3498db',
    height: 55,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButtonText: {
    fontFamily: 'Inter-Bold',
    color: '#fff',
    fontSize: 18,
  },
  demoContainer: {
    marginTop: 40,
  },
  demoHeader: {
    fontFamily: 'Inter-Medium',
    fontSize: 18,
    marginBottom: 16,
    textAlign: 'center',
  },
  demoButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  demoButton: {
    flex: 1,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 5,
  },
  elderlyButton: {
    backgroundColor: '#27ae60',
  },
  caregiverButton: {
    backgroundColor: '#e67e22',
  },
  demoButtonText: {
    fontFamily: 'Inter-Medium',
    color: '#fff',
    fontSize: 16,
  },
});