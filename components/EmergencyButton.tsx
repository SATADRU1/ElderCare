import React from 'react';
import { StyleSheet, Text, TouchableOpacity, Alert } from 'react-native';
import { TriangleAlert as AlertTriangle } from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';
import { useAlerts } from '@/context/AlertContext';

interface EmergencyButtonProps {
  style?: any;
}

export default function EmergencyButton({ style }: EmergencyButtonProps) {
  const { user } = useAuth();
  const { addAlert } = useAlerts();

  const handleEmergencyPress = () => {
    Alert.alert(
      'Emergency Alert',
      'Are you sure you want to send an emergency alert to your caregiver?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Alert',
          style: 'destructive',
          onPress: async () => {
            if (user && user.role === 'elderly' && user.caregivers && user.caregivers.length > 0) {
              // For each caregiver, create an alert
              const caregivers = user.caregivers;
              for (const caregiverId of caregivers) {
                await addAlert({
                  elderlyId: user.id,
                  caregiverId,
                  type: 'emergency',
                  title: 'Emergency Alert',
                  message: `${user.name} has triggered an emergency alert`,
                  timestamp: new Date().toISOString(),
                  read: false,
                  actionTaken: false,
                });
              }
              Alert.alert('Alert Sent', 'Your caregivers have been notified.');
            } else {
              Alert.alert('Error', 'No caregivers are assigned to your account.');
            }
          },
        },
      ]
    );
  };

  return (
    <TouchableOpacity
      style={[styles.emergencyButton, style]}
      onPress={handleEmergencyPress}
    >
      <AlertTriangle size={24} color="#fff" />
      <Text style={styles.emergencyButtonText}>Emergency Alert</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  emergencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e74c3c',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    margin: 20,
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
});