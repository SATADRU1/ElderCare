import React, { useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useReminders } from '@/context/ReminderContext';
import { useAlerts } from '@/context/AlertContext';
import { Bell, Calendar, Activity, TriangleAlert as AlertTriangle } from 'lucide-react-native';
import { requestNotificationPermissions } from '@/utils/notifications';
import { LinearGradient } from 'expo-linear-gradient';

export default function HomeScreen() {
  const { user } = useAuth();
  const { reminders, getTodaysReminders, getMissedReminders, markReminderComplete } = useReminders();
  const { alerts, getUnreadAlerts } = useAlerts();

  const todaysReminders = getTodaysReminders();
  const missedReminders = getMissedReminders();
  const unreadAlerts = getUnreadAlerts();

  useEffect(() => {
    // Request notification permissions when the component mounts
    const requestPermissions = async () => {
      const { granted } = await requestNotificationPermissions();
      if (!granted && Platform.OS !== 'web') {
        Alert.alert(
          'Notification Permission',
          'Please enable notifications to receive reminders',
          [{ text: 'OK' }]
        );
      }
    };

    requestPermissions();
  }, []);

  const handleCompleteReminder = (id: string) => {
    markReminderComplete(id).then(() => {
      Alert.alert('Success', 'Reminder marked as completed!');
    });
  };

  return (
    <ScrollView style={styles.container}>
      {/* Greeting section */}
      <LinearGradient
        colors={['#3498db', '#2980b9']}
        style={styles.headerGradient}
      >
        <View style={styles.headerContainer}>
          <Text style={styles.greeting}>
            {new Date().getHours() < 12
              ? 'Good Morning'
              : new Date().getHours() < 18
              ? 'Good Afternoon'
              : 'Good Evening'}
          </Text>
          <Text style={styles.userName}>{user?.name}</Text>
        </View>
      </LinearGradient>

      {/* Emergency button */}
      {user?.role === 'elderly' && (
        <TouchableOpacity
          style={styles.emergencyButton}
          onPress={() => {
            Alert.alert(
              'Emergency Alert',
              'Are you sure you want to send an emergency alert to your caregiver?',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Send Alert',
                  style: 'destructive',
                  onPress: () => {
                    // In a real app, this would trigger an actual alert
                    Alert.alert(
                      'Alert Sent',
                      'Your caregiver has been notified.'
                    );
                  },
                },
              ]
            );
          }}
        >
          <AlertTriangle size={24} color="#fff" />
          <Text style={styles.emergencyButtonText}>Emergency Alert</Text>
        </TouchableOpacity>
      )}

      {/* Today's reminders */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Bell size={24} color="#3498db" />
          <Text style={styles.sectionTitle}>Today's Reminders</Text>
        </View>

        {todaysReminders.length > 0 ? (
          todaysReminders.map((reminder) => (
            <View key={reminder.id} style={styles.reminderCard}>
              <View style={styles.reminderInfo}>
                <Text style={styles.reminderTime}>{reminder.time}</Text>
                <Text style={styles.reminderTitle}>{reminder.title}</Text>
                {reminder.description && (
                  <Text style={styles.reminderDescription}>
                    {reminder.description}
                  </Text>
                )}
              </View>
              {user?.role === 'elderly' && (
                <TouchableOpacity
                  style={[
                    styles.reminderActionButton,
                    reminder.completed && styles.reminderCompletedButton,
                  ]}
                  onPress={() => handleCompleteReminder(reminder.id)}
                  disabled={reminder.completed}
                >
                  <Text style={styles.reminderActionButtonText}>
                    {reminder.completed ? 'Done' : 'Mark Done'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        ) : (
          <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyStateText}>No reminders for today</Text>
          </View>
        )}

        <TouchableOpacity 
          style={styles.viewAllButton}
          onPress={() => router.push('/reminders')}
        >
          <Text style={styles.viewAllButtonText}>View All Reminders</Text>
        </TouchableOpacity>
      </View>

      {/* Status Summary - for caregivers */}
      {user?.role === 'caregiver' && (
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Activity size={24} color="#3498db" />
            <Text style={styles.sectionTitle}>Elderly Status</Text>
          </View>

          <View style={styles.statusCard}>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Missed Reminders</Text>
              <Text style={[styles.statusValue, missedReminders.length > 0 && styles.statusAlert]}>
                {missedReminders.length}
              </Text>
            </View>
            
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Unread Alerts</Text>
              <Text style={[styles.statusValue, unreadAlerts.length > 0 && styles.statusAlert]}>
                {unreadAlerts.length}
              </Text>
            </View>
            
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Last Check-in</Text>
              <Text style={styles.statusValue}>Today, 9:30 AM</Text>
            </View>
          </View>
        </View>
      )}

      {/* Quick Actions */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => router.push('/reminders')}
          >
            <Bell size={32} color="#3498db" />
            <Text style={styles.quickActionText}>Reminders</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => router.push('/appointments')}
          >
            <Calendar size={32} color="#e67e22" />
            <Text style={styles.quickActionText}>Appointments</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => router.push('/health')}
          >
            <Activity size={32} color="#27ae60" />
            <Text style={styles.quickActionText}>Health</Text>
          </TouchableOpacity>
          
          {user?.role === 'elderly' ? (
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => {
                // In a real app, this would navigate to a check-in form
                Alert.alert('Daily Check-in', 'How are you feeling today?');
              }}
            >
              <Activity size={32} color="#9b59b6" />
              <Text style={styles.quickActionText}>Check-in</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => {
                // In a real app, this would navigate to a messaging interface
                Alert.alert('Contact', 'Contact elderly feature would be here');
              }}
            >
              <Activity size={32} color="#9b59b6" />
              <Text style={styles.quickActionText}>Contact</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  headerGradient: {
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContainer: {
    marginTop: 40,
  },
  greeting: {
    fontFamily: 'Inter-Regular',
    fontSize: 18,
    color: '#ffffff',
    opacity: 0.9,
  },
  userName: {
    fontFamily: 'Inter-Bold',
    fontSize: 32,
    color: '#ffffff',
    marginTop: 5,
  },
  emergencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e74c3c',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    margin: 20,
    marginTop: -20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emergencyButtonText: {
    fontFamily: 'Inter-Bold',
    color: '#fff',
    fontSize: 18,
    marginLeft: 10,
  },
  sectionContainer: {
    marginTop: 20,
    marginBottom: 10,
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    marginLeft: 10,
  },
  reminderCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  reminderInfo: {
    flex: 1,
  },
  reminderTime: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#3498db',
  },
  reminderTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    marginTop: 5,
    marginBottom: 5,
  },
  reminderDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#666',
  },
  reminderActionButton: {
    backgroundColor: '#3498db',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginLeft: 10,
  },
  reminderCompletedButton: {
    backgroundColor: '#27ae60',
  },
  reminderActionButtonText: {
    fontFamily: 'Inter-Medium',
    color: '#fff',
    fontSize: 14,
  },
  emptyStateContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyStateText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#666',
  },
  viewAllButton: {
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 10,
  },
  viewAllButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#3498db',
  },
  statusCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  statusItem: {
    alignItems: 'center',
    width: '33%',
  },
  statusLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  statusValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 22,
    marginTop: 5,
  },
  statusAlert: {
    color: '#e74c3c',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  quickActionButton: {
    backgroundColor: '#fff',
    width: '48%',
    aspectRatio: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  quickActionText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    marginTop: 10,
  },
});