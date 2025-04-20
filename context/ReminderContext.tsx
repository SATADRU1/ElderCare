import React, { createContext, useState, useContext, useEffect } from 'react';
import { Platform, LogBox } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import * as Notifications from 'expo-notifications';
import { Medication, Appointment } from '@/types';
import { useAuth } from './AuthContext';
import { NotificationTriggerInput } from 'expo-notifications';

// Mock data for demo purposes
const MOCK_REMINDERS: Reminder[] = [
  {
    id: '1',
    type: 'medication',
    title: 'Blood Pressure Medication',
    description: 'Take 1 pill with water',
    date: new Date().toISOString().split('T')[0],
    time: '08:00',
    recurring: true,
    frequency: 'daily',
    elderlyId: '1',
    relatedItemId: 'med1',
    completed: false,
    notified: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    type: 'medication',
    title: 'Diabetes Medication',
    description: 'Take after breakfast',
    date: new Date().toISOString().split('T')[0],
    time: '09:30',
    recurring: true,
    frequency: 'daily',
    elderlyId: '1',
    relatedItemId: 'med2',
    completed: false,
    notified: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    type: 'hydration',
    title: 'Drink Water',
    description: 'At least one glass',
    date: new Date().toISOString().split('T')[0],
    time: '11:00',
    recurring: true,
    frequency: 'daily',
    elderlyId: '1',
    completed: false,
    notified: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: '4',
    type: 'appointment',
    title: 'Doctor Appointment',
    description: 'Checkup with Dr. Wilson',
    date: new Date().toISOString().split('T')[0],
    time: '14:00',
    recurring: false,
    elderlyId: '1',
    relatedItemId: 'app1',
    completed: false,
    notified: false,
    createdAt: new Date().toISOString(),
  },
];

const MOCK_MEDICATIONS: Medication[] = [
  {
    id: 'med1',
    name: 'Lisinopril',
    dosage: '10mg',
    frequency: 'Once daily',
    schedule: [
      {
        time: '08:00',
        days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      },
    ],
    instructions: 'Take with or without food at the same time each day',
    startDate: '2023-01-01',
    elderlyId: '1',
  },
  {
    id: 'med2',
    name: 'Metformin',
    dosage: '500mg',
    frequency: 'Twice daily',
    schedule: [
      {
        time: '09:30',
        days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      },
      {
        time: '19:30',
        days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      },
    ],
    instructions: 'Take with meals',
    startDate: '2023-01-01',
    elderlyId: '1',
  },
];

const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: 'app1',
    title: 'Quarterly Checkup',
    date: '2023-06-15',
    time: '14:00',
    location: 'City Medical Center, Room 305',
    notes: 'Bring current medication list',
    doctorName: 'Dr. Jane Wilson',
    elderlyId: '1',
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

interface AlarmDuration {
  hours: number;
  minutes: number;
  seconds: number;
}

export interface Reminder {
  id: string;
  type: string;
  title: string;
  description?: string;
  date: string;
  time: string;
  recurring: boolean;
  frequency?: string;
  elderlyId: string;
  relatedItemId?: string;
  completed: boolean;
  notified: boolean;
  createdAt: string;
  notificationId?: string;
  alarmDuration?: number; // Duration in seconds
}

interface ReminderContextType {
  reminders: Reminder[];
  medications: Medication[];
  appointments: Appointment[];
  loading: boolean;
  addReminder: (reminder: Omit<Reminder, 'id'>) => Promise<void>;
  updateReminder: (id: string, updates: Partial<Reminder>) => Promise<void>;
  deleteReminder: (id: string) => Promise<void>;
  markReminderComplete: (id: string) => Promise<void>;
  addMedication: (medication: Omit<Medication, 'id'>) => Promise<void>;
  updateMedication: (id: string, updates: Partial<Medication>) => Promise<void>;
  deleteMedication: (id: string) => Promise<void>;
  addAppointment: (appointment: Omit<Appointment, 'id'>) => Promise<void>;
  updateAppointment: (id: string, updates: Partial<Appointment>) => Promise<void>;
  deleteAppointment: (id: string) => Promise<void>;
  getTodaysReminders: () => Reminder[];
  getUpcomingReminders: () => Reminder[];
  getMissedReminders: () => Reminder[];
  scheduleNotification: (reminder: Reminder) => Promise<string | null>;
  loadData: () => Promise<void>;
}

const ReminderContext = createContext<ReminderContextType>({
  reminders: [],
  medications: [],
  appointments: [],
  loading: true,
  addReminder: async () => {},
  updateReminder: async () => {},
  deleteReminder: async () => {},
  markReminderComplete: async () => {},
  addMedication: async () => {},
  updateMedication: async () => {},
  deleteMedication: async () => {},
  addAppointment: async () => {},
  updateAppointment: async () => {},
  deleteAppointment: async () => {},
  getTodaysReminders: () => [],
  getUpcomingReminders: () => [],
  getMissedReminders: () => [],
  scheduleNotification: async () => null,
  loadData: async () => {},
});

export const ReminderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    if (!user) {
      setReminders([]);
      setMedications([]);
      setAppointments([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // Load reminders from storage
      const storedReminders = await secureStorage.getItem('reminders');
      const savedReminders = storedReminders ? JSON.parse(storedReminders) : [];
      
      if (user.role === 'elderly') {
        setReminders(savedReminders.filter((r: Reminder) => r.elderlyId === user.id));
        setMedications(MOCK_MEDICATIONS.filter(m => m.elderlyId === user.id));
        setAppointments(MOCK_APPOINTMENTS.filter(a => a.elderlyId === user.id));
      } else if (user.role === 'caregiver' && user.elderly && user.elderly.length > 0) {
        const elderlyIds = user.elderly;
        setReminders(savedReminders.filter((r: Reminder) => elderlyIds.includes(r.elderlyId)));
        setMedications(MOCK_MEDICATIONS.filter(m => elderlyIds.includes(m.elderlyId)));
        setAppointments(MOCK_APPOINTMENTS.filter(a => elderlyIds.includes(a.elderlyId)));
      }
    } catch (error) {
      console.error('Failed to load reminder data:', error);
      // Fallback to empty arrays if there's an error
      setReminders([]);
      setMedications([]);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  // Configure notifications
  useEffect(() => {
    const configureNotifications = async () => {
      if (Platform.OS === 'web') {
        // Request permission for web notifications
        if ('Notification' in window) {
          const permission = await Notification.requestPermission();
          if (permission !== 'granted') {
            console.warn('Notification permission denied');
          }
        }
        return;
      }

      // For mobile platforms
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Notification permission not granted');
        return;
      }

      // Set notification handler
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
        }),
      });
    };

    configureNotifications();
  }, []);

  // Schedule notifications for reminders
  const scheduleNotification = async (reminder: Reminder) => {
    if (!reminder.alarmDuration) return null;

    const [hours, minutes] = reminder.time.split(':').map(Number);
    const scheduledDate = new Date(reminder.date);
    scheduledDate.setHours(hours, minutes, 0, 0);

    // If the time has already passed today and it's not recurring, schedule for the next occurrence
    if (scheduledDate.getTime() < Date.now() && !reminder.recurring) {
      if (reminder.recurring) {
        // For recurring reminders, schedule for the next occurrence
        scheduledDate.setDate(scheduledDate.getDate() + 1);
      } else {
        console.warn('Cannot schedule notification for past date');
        return null;
      }
    }

    try {
      if (Platform.OS === 'web') {
        // Web notifications
        const timeUntilNotification = scheduledDate.getTime() - Date.now();
        const notificationId = setTimeout(() => {
          new Notification(reminder.title, {
            body: reminder.description || 'Time for your reminder!',
          });
        }, timeUntilNotification);

        return notificationId.toString();
      } else {
        // Mobile notifications
        const trigger: NotificationTriggerInput = reminder.recurring
          ? {
              type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
              hour: hours,
              minute: minutes,
              repeats: true,
            }
          : {
              type: Notifications.SchedulableTriggerInputTypes.DATE,
              date: scheduledDate,
            };

        const notificationId = await Notifications.scheduleNotificationAsync({
          content: {
            title: reminder.title,
            body: reminder.description || 'Time for your reminder!',
            sound: true,
            priority: Notifications.AndroidNotificationPriority.HIGH,
            data: { reminderId: reminder.id },
          },
          trigger,
        });

        return notificationId;
      }
    } catch (error) {
      console.warn('Failed to schedule notification:', error);
      return null;
    }
  };

  // Add notification handler
  useEffect(() => {
    if (Platform.OS === 'web') return;

    const subscription = Notifications.addNotificationReceivedListener(notification => {
      const reminderId = notification.request.content.data?.reminderId;
      if (reminderId) {
        setReminders(prev =>
          prev.map(reminder =>
            reminder.id === reminderId ? { ...reminder, notified: true } : reminder
          )
        );
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // Load data on app startup or when user changes
  useEffect(() => {
    loadData();
  }, [user]);

  // Helper to generate a unique ID
  const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // CRUD operations for reminders
  const addReminder = async (reminder: Omit<Reminder, 'id' | 'completed' | 'notified' | 'createdAt' | 'notificationId'>): Promise<void> => {
    try {
      if (!reminder.title || !reminder.date || !reminder.time) {
        throw new Error('Title, date and time are required');
      }

      const newReminder: Reminder = {
        ...reminder,
        id: generateId(),
        notified: false,
        completed: false,
        createdAt: new Date().toISOString()
      };

      // Calculate notification time
      const [hours, minutes] = newReminder.time.split(':').map(Number);
      const reminderDate = new Date(newReminder.date);
      reminderDate.setHours(hours, minutes, 0, 0);

      // If reminder is in the past, don't schedule it unless it's recurring
      if (reminderDate.getTime() < Date.now() && !newReminder.recurring) {
        throw new Error('Cannot set reminder for past date/time');
      }

      // Schedule notification
      try {
        const notificationId = await scheduleNotification(newReminder);
        if (notificationId) {
          newReminder.notificationId = notificationId;
          console.log('Notification scheduled successfully:', notificationId);
        }
      } catch (notificationError) {
        console.error('Failed to schedule notification:', notificationError);
        // Continue with reminder creation even if notification fails
      }

      // Update state
      setReminders(prev => [...prev, newReminder]);

      // Save to storage
      const storedReminders = await secureStorage.getItem('reminders');
      const existingReminders = storedReminders ? JSON.parse(storedReminders) : [];
      await secureStorage.setItem('reminders', JSON.stringify([...existingReminders, newReminder]));

      console.log('Reminder added successfully:', newReminder);
    } catch (error) {
      console.error('Error adding reminder:', error);
      throw error;
    }
  };

  // Add timer check function
  const checkDueReminders = () => {
    const now = new Date();
    const currentTime = now.getTime();

    reminders.forEach(reminder => {
      if (reminder.completed || reminder.notified) return;

      const [hours, minutes] = reminder.time.split(':').map(Number);
      const reminderDate = new Date(reminder.date);
      reminderDate.setHours(hours, minutes, 0, 0);
      
      const timeDiff = reminderDate.getTime() - currentTime;
      
      // Check if it's time to show the reminder (within 1 minute threshold)
      if (timeDiff <= 60000 && timeDiff > -60000) {
        if (Platform.OS === 'web') {
          new Notification(reminder.title, {
            body: reminder.description || 'Time for your reminder!',
          });
        } else {
          Notifications.scheduleNotificationAsync({
            content: {
              title: reminder.title,
              body: reminder.description || 'Time for your reminder!',
              sound: true,
              priority: Notifications.AndroidNotificationPriority.HIGH,
            },
            trigger: null, // Show immediately
          });
        }

        // Mark as notified
        updateReminder(reminder.id, { notified: true });
      }
    });
  };

  // Add timer effect
  useEffect(() => {
    // Check reminders every minute
    const timerInterval = setInterval(checkDueReminders, 60000);
    
    return () => clearInterval(timerInterval);
  }, [reminders]);

  const updateReminder = async (id: string, updates: Partial<Reminder>): Promise<void> => {
    setReminders(prev => 
      prev.map(reminder => {
        if (reminder.id === id) {
          const updatedReminder = { ...reminder, ...updates };
          // Reschedule notification if alarm duration is changed
          if (updates.alarmDuration || updates.time || updates.date) {
            scheduleNotification(updatedReminder);
          }
          return updatedReminder;
        }
        return reminder;
      })
    );

    // Save to storage
    const storedReminders = await secureStorage.getItem('reminders');
    const reminders = storedReminders ? JSON.parse(storedReminders) : [];
    const updatedReminders = reminders.map((r: Reminder) =>
      r.id === id ? { ...r, ...updates } : r
    );
    await secureStorage.setItem('reminders', JSON.stringify(updatedReminders));
  };

  const deleteReminder = async (id: string): Promise<void> => {
    // Remove from state
    setReminders(prev => prev.filter(reminder => reminder.id !== id));

    // Remove from storage
    const storedReminders = await secureStorage.getItem('reminders');
    const reminders = storedReminders ? JSON.parse(storedReminders) : [];
    const updatedReminders = reminders.filter((r: Reminder) => r.id !== id);
    await secureStorage.setItem('reminders', JSON.stringify(updatedReminders));
  };

  const markReminderComplete = async (id: string): Promise<void> => {
    const updates = {
      completed: true,
      completedTime: new Date().toISOString(),
    };

    await updateReminder(id, updates);
  };

  // Helper functions for filtering reminders
  const getTodaysReminders = (): Reminder[] => {
    const today = new Date().toISOString().split('T')[0];
    return reminders.filter(reminder => {
      if (reminder.completed) return false;
      
      if (reminder.recurring) return true;
      
      return reminder.date === today;
    });
  };

  const getUpcomingReminders = (): Reminder[] => {
    const today = new Date().toISOString().split('T')[0];
    return reminders.filter(reminder => {
      if (reminder.completed) return false;
      
      if (reminder.recurring) return true;
      
      return reminder.date > today;
    });
  };

  const getMissedReminders = (): Reminder[] => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();
    
    return reminders.filter(reminder => {
      if (reminder.completed) return false;
      
      const [hours, minutes] = reminder.time.split(':').map(Number);
      const hasTimePassed = currentHour > hours || (currentHour === hours && currentMinutes > minutes);
      
      if (reminder.date < today) return true;
      
      return reminder.date === today && hasTimePassed && !reminder.recurring;
    });
  };

  // CRUD operations for medications
  const addMedication = async (medication: Omit<Medication, 'id'>): Promise<void> => {
    const newMedication: Medication = { ...medication, id: generateId() };
    setMedications(prev => [...prev, newMedication]);
    
    // Save to storage
    const storedMedications = await secureStorage.getItem('medications');
    const medications = storedMedications ? JSON.parse(storedMedications) : [];
    medications.push(newMedication);
    await secureStorage.setItem('medications', JSON.stringify(medications));
  };

  const updateMedication = async (id: string, updates: Partial<Medication>): Promise<void> => {
    setMedications(prev => 
      prev.map(medication => (medication.id === id ? { ...medication, ...updates } : medication))
    );
    
    // Save to storage
    const storedMedications = await secureStorage.getItem('medications');
    const medications = storedMedications ? JSON.parse(storedMedications) : [];
    const updatedMedications = medications.map((m: Medication) =>
      m.id === id ? { ...m, ...updates } : m
    );
    await secureStorage.setItem('medications', JSON.stringify(updatedMedications));
  };

  const deleteMedication = async (id: string): Promise<void> => {
    setMedications(prev => prev.filter(medication => medication.id !== id));
    
    // Remove from storage
    const storedMedications = await secureStorage.getItem('medications');
    const medications = storedMedications ? JSON.parse(storedMedications) : [];
    const updatedMedications = medications.filter((m: Medication) => m.id !== id);
    await secureStorage.setItem('medications', JSON.stringify(updatedMedications));
  };

  // CRUD operations for appointments
  const addAppointment = async (appointment: Omit<Appointment, 'id'>): Promise<void> => {
    const newAppointment: Appointment = { ...appointment, id: generateId() };
    setAppointments(prev => [...prev, newAppointment]);
    
    // Save to storage
    const storedAppointments = await secureStorage.getItem('appointments');
    const appointments = storedAppointments ? JSON.parse(storedAppointments) : [];
    appointments.push(newAppointment);
    await secureStorage.setItem('appointments', JSON.stringify(appointments));
  };

  const updateAppointment = async (id: string, updates: Partial<Appointment>): Promise<void> => {
    setAppointments(prev => 
      prev.map(appointment => (appointment.id === id ? { ...appointment, ...updates } : appointment))
    );
    
    // Save to storage
    const storedAppointments = await secureStorage.getItem('appointments');
    const appointments = storedAppointments ? JSON.parse(storedAppointments) : [];
    const updatedAppointments = appointments.map((a: Appointment) =>
      a.id === id ? { ...a, ...updates } : a
    );
    await secureStorage.setItem('appointments', JSON.stringify(updatedAppointments));
  };

  const deleteAppointment = async (id: string): Promise<void> => {
    setAppointments(prev => prev.filter(appointment => appointment.id !== id));
    
    // Remove from storage
    const storedAppointments = await secureStorage.getItem('appointments');
    const appointments = storedAppointments ? JSON.parse(storedAppointments) : [];
    const updatedAppointments = appointments.filter((a: Appointment) => a.id !== id);
    await secureStorage.setItem('appointments', JSON.stringify(updatedAppointments));
  };

  return (
    <ReminderContext.Provider
      value={{
        reminders,
        medications,
        appointments,
        loading,
        addReminder,
        updateReminder,
        deleteReminder,
        markReminderComplete,
        addMedication,
        updateMedication,
        deleteMedication,
        addAppointment,
        updateAppointment,
        deleteAppointment,
        getTodaysReminders,
        getUpcomingReminders,
        getMissedReminders,
        scheduleNotification,
        loadData
      }}
    >
      {children}
    </ReminderContext.Provider>
  );
};

export const useReminders = () => {
  const context = useContext(ReminderContext);
  if (!context) {
    throw new Error('useReminders must be used within a ReminderProvider');
  }
  return context;
};

export default ReminderContext;