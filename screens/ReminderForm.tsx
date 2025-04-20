import React, { useState } from 'react';
import { Alert, Text, TextInput, Button, View, Switch, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useFirebase } from '@/context/FirebaseContext';
import { Reminder } from '@/types/reminder';

const ReminderForm: React.FC = () => {
  const navigation = useNavigation();
  const { currentUser, addReminder, scheduleNotification } = useFirebase();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [time, setTime] = useState('');
  const [recurring, setRecurring] = useState(false);
  const [alarmDuration, setAlarmDuration] = useState('');
  const [type, setType] = useState<Reminder['type']>('custom');

  const handleSubmit = async () => {
    if (!title.trim() || !time) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const newReminder: Reminder = {
        id: Date.now().toString(),
        type,
        title,
        description,
        time,
        recurring,
        alarmDuration: alarmDuration ? parseInt(alarmDuration, 10) : undefined,
        elderlyId: currentUser?.uid || '',
        completed: false,
        notified: false,
        createdAt: new Date().toISOString()
      };

      await addReminder(newReminder);
      navigation.goBack();
    } catch (error) {
      console.error('Error creating reminder:', error);
      Alert.alert('Error', 'Failed to create reminder. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Title *</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="Enter reminder title"
      />
      
      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={description}
        onChangeText={setDescription}
        placeholder="Enter description (optional)"
        multiline
      />
      
      <Text style={styles.label}>Time *</Text>
      <TextInput
        style={styles.input}
        value={time}
        onChangeText={setTime}
        placeholder="Enter time (e.g., 10:00 AM)"
      />
      
      <View style={styles.switchContainer}>
        <Text style={styles.label}>Recurring</Text>
        <Switch value={recurring} onValueChange={setRecurring} />
      </View>
      
      <Text style={styles.label}>Alarm Duration (minutes)</Text>
      <TextInput
        style={styles.input}
        value={alarmDuration}
        onChangeText={setAlarmDuration}
        placeholder="Enter duration in minutes"
        keyboardType="numeric"
      />
      
      <Button title="Create Reminder" onPress={handleSubmit} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 4,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 8,
    marginBottom: 8,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
});

export default ReminderForm;