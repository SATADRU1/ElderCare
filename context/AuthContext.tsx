import React, { createContext, useState, useContext, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { User } from '@/types';

// Mock users for demo purposes
const MOCK_USERS: User[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john@example.com',
    phone: '+1234567890',
    role: 'elderly',
    birthdate: '1950-05-15',
    emergencyContact: '+1987654321',
    medicalInfo: {
      allergies: ['Penicillin', 'Peanuts'],
      conditions: ['Hypertension', 'Diabetes Type 2'],
      bloodType: 'O+',
      doctorInfo: {
        name: 'Dr. Jane Wilson',
        phone: '+1122334455',
      },
    },
    caregivers: ['2'],
  },
  {
    id: '2',
    name: 'Rahul Kumar',
    email: 'rahul@example.com',
    phone: '+9876543210',
    role: 'caregiver',
    elderly: ['1'],
  },
];

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => false,
  logout: async () => {},
  updateUser: async () => {},
});

// Web fallback for SecureStore
const secureStorage = {
  getItem: async (key: string): Promise<string | null> => {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }
    return SecureStore.getItemAsync(key);
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
      return;
    }
    return SecureStore.setItemAsync(key, value);
  },
  removeItem: async (key: string): Promise<void> => {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
      return;
    }
    return SecureStore.deleteItemAsync(key);
  },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing user session on app load
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await secureStorage.getItem('user');
        if (userData) {
          setUser(JSON.parse(userData));
        }
      } catch (error) {
        console.error('Failed to load user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  // Login function - in a real app this would validate with an API
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // For demo purposes, just checking against mock data
      // In a real app, this would be an API call
      const foundUser = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (foundUser) {
        // In a real app, we would verify the password here
        await secureStorage.setItem('user', JSON.stringify(foundUser));
        setUser(foundUser);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      await secureStorage.removeItem('user');
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Update user function
  const updateUser = async (userData: Partial<User>): Promise<void> => {
    try {
      if (!user) return;
      
      const updatedUser = { ...user, ...userData };
      await secureStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (error) {
      console.error('Update user error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;