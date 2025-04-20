import React, { createContext, useState, useContext, useEffect } from 'react';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { Alert } from '@/types';
import { useAuth } from './AuthContext';

// Mock data for demo purposes
const MOCK_ALERTS: Alert[] = [
  {
    id: '1',
    elderlyId: '1',
    caregiverId: '2',
    type: 'missed_medication',
    title: 'Missed Medication',
    message: 'Blood pressure medication was not taken at 8:00 AM',
    timestamp: '2023-06-01T09:00:00Z',
    read: true,
    actionTaken: true,
    actionDetails: 'Called John and reminded him to take his medication',
  },
  {
    id: '2',
    elderlyId: '1',
    caregiverId: '2',
    type: 'inactivity',
    title: 'Inactivity Alert',
    message: 'No activity detected for 12 hours',
    timestamp: '2023-06-02T20:00:00Z',
    read: true,
    actionTaken: true,
    actionDetails: 'Video called John, he was watching TV and forgot to check in',
  },
  {
    id: '3',
    elderlyId: '1',
    caregiverId: '2',
    type: 'missed_medication',
    title: 'Missed Medication',
    message: 'Diabetes medication was not taken at 9:30 AM',
    timestamp: '2023-06-03T10:30:00Z',
    read: false,
    actionTaken: false,
  },
];

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
};

interface AlertContextType {
  alerts: Alert[];
  loading: boolean;
  addAlert: (alert: Omit<Alert, 'id'>) => Promise<void>;
  markAlertAsRead: (id: string) => Promise<void>;
  markAlertActionTaken: (id: string, details?: string) => Promise<void>;
  deleteAlert: (id: string) => Promise<void>;
  getUnreadAlerts: () => Alert[];
  getRecentAlerts: (limit?: number) => Alert[];
}

const AlertContext = createContext<AlertContextType>({
  alerts: [],
  loading: true,
  addAlert: async () => {},
  markAlertAsRead: async () => {},
  markAlertActionTaken: async () => {},
  deleteAlert: async () => {},
  getUnreadAlerts: () => [],
  getRecentAlerts: () => [],
});

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  // Load data on app startup or when user changes
  useEffect(() => {
    const loadData = async () => {
      if (!user) {
        setAlerts([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // In a real app, these would be API calls
        // For demo, using mock data filtered by the user's role
        if (user.role === 'elderly') {
          setAlerts(MOCK_ALERTS.filter(alert => alert.elderlyId === user.id));
        } else if (user.role === 'caregiver') {
          setAlerts(MOCK_ALERTS.filter(alert => alert.caregiverId === user.id));
        }
      } catch (error) {
        console.error('Failed to load alert data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  // Helper to generate a unique ID
  const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // CRUD operations for alerts
  const addAlert = async (alert: Omit<Alert, 'id'>): Promise<void> => {
    const newAlert: Alert = { 
      ...alert, 
      id: generateId(), 
      timestamp: new Date().toISOString(),
      read: false,
      actionTaken: false
    };
    setAlerts(prev => [...prev, newAlert]);
    // In a real app, this would be saved to a server and possibly trigger a push notification
  };

  const markAlertAsRead = async (id: string): Promise<void> => {
    setAlerts(prev => 
      prev.map(alert => (alert.id === id ? { ...alert, read: true } : alert))
    );
    // In a real app, this would be saved to a server
  };

  const markAlertActionTaken = async (id: string, details?: string): Promise<void> => {
    setAlerts(prev => 
      prev.map(alert => (
        alert.id === id 
          ? { 
              ...alert, 
              actionTaken: true, 
              read: true,
              actionDetails: details || alert.actionDetails 
            } 
          : alert
      ))
    );
    // In a real app, this would be saved to a server
  };

  const deleteAlert = async (id: string): Promise<void> => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
    // In a real app, this would be deleted from a server
  };

  // Helper functions
  const getUnreadAlerts = (): Alert[] => {
    return alerts.filter(alert => !alert.read);
  };

  const getRecentAlerts = (limit = 10): Alert[] => {
    return [...alerts]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  };

  return (
    <AlertContext.Provider
      value={{
        alerts,
        loading,
        addAlert,
        markAlertAsRead,
        markAlertActionTaken,
        deleteAlert,
        getUnreadAlerts,
        getRecentAlerts,
      }}
    >
      {children}
    </AlertContext.Provider>
  );
};

export const useAlerts = () => useContext(AlertContext);

export default AlertContext;