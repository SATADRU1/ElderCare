import React, { createContext, useState, useContext, useEffect } from 'react';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { HealthLog, CheckIn } from '@/types';
import { useAuth } from './AuthContext';

// Mock data for demo purposes
const MOCK_HEALTH_LOGS: HealthLog[] = [
  {
    id: '1',
    elderlyId: '1',
    timestamp: '2023-06-01T08:00:00Z',
    type: 'bloodPressure',
    value: '120/80',
    unit: 'mmHg',
    notes: 'Feeling good today',
  },
  {
    id: '2',
    elderlyId: '1',
    timestamp: '2023-06-02T08:00:00Z',
    type: 'bloodPressure',
    value: '122/82',
    unit: 'mmHg',
    notes: '',
  },
  {
    id: '3',
    elderlyId: '1',
    timestamp: '2023-06-03T08:00:00Z',
    type: 'bloodPressure',
    value: '118/78',
    unit: 'mmHg',
    notes: 'After morning walk',
  },
  {
    id: '4',
    elderlyId: '1',
    timestamp: '2023-06-01T09:00:00Z',
    type: 'bloodSugar',
    value: '110',
    unit: 'mg/dL',
    notes: 'Before breakfast',
  },
  {
    id: '5',
    elderlyId: '1',
    timestamp: '2023-06-02T09:00:00Z',
    type: 'bloodSugar',
    value: '120',
    unit: 'mg/dL',
    notes: 'Before breakfast',
  },
  {
    id: '6',
    elderlyId: '1',
    timestamp: '2023-06-03T09:00:00Z',
    type: 'bloodSugar',
    value: '105',
    unit: 'mg/dL',
    notes: 'Before breakfast',
  },
];

const MOCK_CHECK_INS: CheckIn[] = [
  {
    id: '1',
    elderlyId: '1',
    timestamp: '2023-06-01T20:00:00Z',
    moodRating: 4,
    notes: 'Had a good day, took a walk in the park',
    painLevel: 1,
    symptoms: [],
    medications: [
      { medicationId: 'med1', taken: true, time: '2023-06-01T08:00:00Z' },
      { medicationId: 'med2', taken: true, time: '2023-06-01T09:30:00Z' },
    ],
  },
  {
    id: '2',
    elderlyId: '1',
    timestamp: '2023-06-02T20:00:00Z',
    moodRating: 3,
    notes: 'Feeling a bit tired today',
    painLevel: 2,
    symptoms: ['Slight headache'],
    medications: [
      { medicationId: 'med1', taken: true, time: '2023-06-02T08:15:00Z' },
      { medicationId: 'med2', taken: true, time: '2023-06-02T09:45:00Z' },
    ],
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

interface HealthContextType {
  healthLogs: HealthLog[];
  checkIns: CheckIn[];
  loading: boolean;
  addHealthLog: (log: Omit<HealthLog, 'id'>) => Promise<void>;
  updateHealthLog: (id: string, updates: Partial<HealthLog>) => Promise<void>;
  deleteHealthLog: (id: string) => Promise<void>;
  addCheckIn: (checkIn: Omit<CheckIn, 'id'>) => Promise<void>;
  updateCheckIn: (id: string, updates: Partial<CheckIn>) => Promise<void>;
  deleteCheckIn: (id: string) => Promise<void>;
  getRecentHealthLogs: (type: string, limit?: number) => HealthLog[];
  getRecentCheckIns: (limit?: number) => CheckIn[];
}

const HealthContext = createContext<HealthContextType>({
  healthLogs: [],
  checkIns: [],
  loading: true,
  addHealthLog: async () => {},
  updateHealthLog: async () => {},
  deleteHealthLog: async () => {},
  addCheckIn: async () => {},
  updateCheckIn: async () => {},
  deleteCheckIn: async () => {},
  getRecentHealthLogs: () => [],
  getRecentCheckIns: () => [],
});

export const HealthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [healthLogs, setHealthLogs] = useState<HealthLog[]>([]);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);

  // Load data on app startup or when user changes
  useEffect(() => {
    const loadData = async () => {
      if (!user) {
        setHealthLogs([]);
        setCheckIns([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // In a real app, these would be API calls
        // For demo, using mock data filtered by the user's role
        if (user.role === 'elderly') {
          setHealthLogs(MOCK_HEALTH_LOGS.filter(log => log.elderlyId === user.id));
          setCheckIns(MOCK_CHECK_INS.filter(checkIn => checkIn.elderlyId === user.id));
        } else if (user.role === 'caregiver' && user.elderly && user.elderly.length > 0) {
          const elderlyIds = user.elderly;
          setHealthLogs(MOCK_HEALTH_LOGS.filter(log => elderlyIds.includes(log.elderlyId)));
          setCheckIns(MOCK_CHECK_INS.filter(checkIn => elderlyIds.includes(checkIn.elderlyId)));
        }
      } catch (error) {
        console.error('Failed to load health data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  // Helper to generate a unique ID
  const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // CRUD operations for health logs
  const addHealthLog = async (log: Omit<HealthLog, 'id'>): Promise<void> => {
    const newLog: HealthLog = { ...log, id: generateId() };
    setHealthLogs(prev => [...prev, newLog]);
    // In a real app, this would be saved to a server
  };

  const updateHealthLog = async (id: string, updates: Partial<HealthLog>): Promise<void> => {
    setHealthLogs(prev => 
      prev.map(log => (log.id === id ? { ...log, ...updates } : log))
    );
    // In a real app, this would be saved to a server
  };

  const deleteHealthLog = async (id: string): Promise<void> => {
    setHealthLogs(prev => prev.filter(log => log.id !== id));
    // In a real app, this would be deleted from a server
  };

  // CRUD operations for check-ins
  const addCheckIn = async (checkIn: Omit<CheckIn, 'id'>): Promise<void> => {
    const newCheckIn: CheckIn = { ...checkIn, id: generateId() };
    setCheckIns(prev => [...prev, newCheckIn]);
    // In a real app, this would be saved to a server
  };

  const updateCheckIn = async (id: string, updates: Partial<CheckIn>): Promise<void> => {
    setCheckIns(prev => 
      prev.map(checkIn => (checkIn.id === id ? { ...checkIn, ...updates } : checkIn))
    );
    // In a real app, this would be saved to a server
  };

  const deleteCheckIn = async (id: string): Promise<void> => {
    setCheckIns(prev => prev.filter(checkIn => checkIn.id !== id));
    // In a real app, this would be deleted from a server
  };

  // Helper functions
  const getRecentHealthLogs = (type: string, limit = 7): HealthLog[] => {
    return healthLogs
      .filter(log => log.type === type)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  };

  const getRecentCheckIns = (limit = 5): CheckIn[] => {
    return checkIns
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  };

  return (
    <HealthContext.Provider
      value={{
        healthLogs,
        checkIns,
        loading,
        addHealthLog,
        updateHealthLog,
        deleteHealthLog,
        addCheckIn,
        updateCheckIn,
        deleteCheckIn,
        getRecentHealthLogs,
        getRecentCheckIns,
      }}
    >
      {children}
    </HealthContext.Provider>
  );
};

export const useHealth = () => useContext(HealthContext);

export default HealthContext;