import React, { createContext, useContext, useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { Reminder } from '../types/reminder';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

interface FirebaseContextType {
  currentUser: User | null;
  addReminder: (reminder: Reminder) => Promise<void>;
  scheduleNotification: (reminder: Reminder) => Promise<string | null>;
}

const FirebaseContext = createContext<FirebaseContextType | null>(null);

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      setCurrentUser(user);
    });
    return unsubscribe;
  }, []);

  const addReminder = async (reminder: Reminder) => {
    if (!currentUser) throw new Error('No user logged in');
    await addDoc(collection(db, 'reminders'), reminder);
  };

  const scheduleNotification = async (reminder: Reminder): Promise<string | null> => {
    // Implement notification scheduling logic here
    return null;
  };

  return (
    <FirebaseContext.Provider value={{ currentUser, addReminder, scheduleNotification }}>
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
}; 