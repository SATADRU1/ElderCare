import React, { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { router } from 'expo-router';
import { Chrome as Home, Calendar, Bell, Activity, User } from 'lucide-react-native';

export default function TabLayout() {
  const { user, isLoading } = useAuth();
  
  // Redirect to login if user is not logged in
  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/(auth)');
    }
  }, [user, isLoading]);

  // Return null while loading or if no user
  if (isLoading || !user) {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#3498db',
        tabBarInactiveTintColor: '#8e8e93',
        tabBarStyle: {
          height: 60,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontFamily: 'Inter-Medium',
          fontSize: 12,
        },
        headerStyle: {
          height: 100,
        },
        headerTitleStyle: {
          fontFamily: 'Inter-Bold',
          fontSize: 20,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
          headerTitle: 'ElderCare',
        }}
      />
      
      <Tabs.Screen
        name="reminders"
        options={{
          title: 'Reminders',
          tabBarIcon: ({ color, size }) => <Bell size={size} color={color} />,
          headerTitle: 'Reminders',
        }}
      />
      
      <Tabs.Screen
        name="appointments"
        options={{
          title: 'Calendar',
          tabBarIcon: ({ color, size }) => <Calendar size={size} color={color} />,
          headerTitle: 'Appointments',
        }}
      />
      
      <Tabs.Screen
        name="health"
        options={{
          title: 'Health',
          tabBarIcon: ({ color, size }) => <Activity size={size} color={color} />,
          headerTitle: 'Health',
        }}
      />
      
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
          headerTitle: 'Profile',
        }}
      />
    </Tabs>
  );
}