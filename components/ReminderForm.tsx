import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Modal, Alert, LogBox } from 'react-native';
import { useReminders } from '@/context/ReminderContext';
import { useAuth } from '@/context/AuthContext';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Clock, Calendar } from 'lucide-react-native';
import { Reminder } from '@/types';

interface ReminderFormProps {
  visible: boolean;
  onClose: () => void;
}

export default function ReminderForm({ visible, onClose }: ReminderFormProps) {
  const { addReminder } = useReminders();
  const { user } = useAuth();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'medication' | 'appointment' | 'hydration' | 'custom'>('custom');
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [recurring, setRecurring] = useState(false);
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [alarmDuration, setAlarmDuration] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      // Keep the selected date but update the time
      const newDateTime = new Date(date);
      newDateTime.setHours(selectedTime.getHours());
      newDateTime.setMinutes(selectedTime.getMinutes());
      setTime(newDateTime);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleDurationChange = (value: string, field: 'hours' | 'minutes' | 'seconds') => {
    const numValue = parseInt(value) || 0;
    if (field === 'hours' && numValue >= 0 && numValue <= 23) {
      setAlarmDuration(prev => ({ ...prev, hours: numValue }));
    } else if (field === 'minutes' && numValue >= 0 && numValue <= 59) {
      setAlarmDuration(prev => ({ ...prev, minutes: numValue }));
    } else if (field === 'seconds' && numValue >= 0 && numValue <= 59) {
      setAlarmDuration(prev => ({ ...prev, seconds: numValue }));
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title for the reminder');
      return;
    }

    if (!user?.elderly || user.elderly.length === 0) {
      Alert.alert('Error', 'No elderly assigned to your account');
      return;
    }

    // Check if the selected date and time is in the past
    const selectedDateTime = new Date(date);
    selectedDateTime.setHours(time.getHours());
    selectedDateTime.setMinutes(time.getMinutes());
    
    if (selectedDateTime < new Date() && !recurring) {
      Alert.alert('Error', 'Please select a future date and time for the reminder');
      return;
    }

    try {
      const timeString = time.toTimeString().split(' ')[0].substring(0, 5); // Format as HH:MM
      
      // Calculate total seconds for alarm duration
      const totalSeconds = 
        (alarmDuration.hours * 3600) + 
        (alarmDuration.minutes * 60) + 
        alarmDuration.seconds;

      // Create reminder data
      const reminderData = {
        type,
        title: title.trim(),
        description: description.trim() || undefined,
        date: date.toISOString().split('T')[0], // Format as YYYY-MM-DD
        time: timeString,
        recurring,
        frequency: recurring ? frequency : undefined,
        elderlyId: user.elderly[0],
        alarmDuration: totalSeconds > 0 ? totalSeconds : undefined,
        completed: false,
        notified: false,
        createdAt: new Date().toISOString()
      };

      Alert.alert('Debug', JSON.stringify(reminderData, null, 2));
      await addReminder(reminderData);

      // Reset form
      setTitle('');
      setDescription('');
      setType('custom');
      setDate(new Date());
      setTime(new Date());
      setRecurring(false);
      setFrequency('daily');
      setAlarmDuration({ hours: 0, minutes: 0, seconds: 0 });
      
      onClose();
      Alert.alert('Success', 'Reminder added successfully');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add reminder');
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>Add New Reminder</Text>
          
          <Text style={styles.label}>Title</Text>
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
            placeholder="Enter reminder description"
            multiline
            numberOfLines={3}
          />
          
          <Text style={styles.label}>Type</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={type}
              onValueChange={(value) => setType(value)}
              style={styles.picker}
            >
              <Picker.Item label="Custom" value="custom" />
              <Picker.Item label="Medication" value="medication" />
              <Picker.Item label="Appointment" value="appointment" />
              <Picker.Item label="Hydration" value="hydration" />
            </Picker>
          </View>

          <Text style={styles.label}>Date</Text>
          <TouchableOpacity
            style={styles.timeButton}
            onPress={() => setShowDatePicker(true)}
          >
            <View style={styles.buttonContent}>
              <Calendar size={20} color="#666" />
              <Text style={styles.timeText}>{formatDate(date)}</Text>
            </View>
          </TouchableOpacity>
          
          <Text style={styles.label}>Time</Text>
          <TouchableOpacity
            style={styles.timeButton}
            onPress={() => setShowTimePicker(true)}
          >
            <View style={styles.buttonContent}>
              <Clock size={20} color="#666" />
              <Text style={styles.timeText}>
                {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          </TouchableOpacity>
          
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={handleDateChange}
              minimumDate={new Date()}
            />
          )}

          {showTimePicker && (
            <DateTimePicker
              value={time}
              mode="time"
              is24Hour={true}
              display="default"
              onChange={handleTimeChange}
            />
          )}

          <Text style={styles.label}>Alarm Duration</Text>
          <View style={styles.durationContainer}>
            <View style={styles.durationInputContainer}>
              <TextInput
                style={styles.durationInput}
                value={alarmDuration.hours.toString()}
                onChangeText={(value) => handleDurationChange(value, 'hours')}
                keyboardType="numeric"
                maxLength={2}
                placeholder="HH"
              />
              <Text style={styles.durationLabel}>Hours</Text>
            </View>
            <View style={styles.durationInputContainer}>
              <TextInput
                style={styles.durationInput}
                value={alarmDuration.minutes.toString()}
                onChangeText={(value) => handleDurationChange(value, 'minutes')}
                keyboardType="numeric"
                maxLength={2}
                placeholder="MM"
              />
              <Text style={styles.durationLabel}>Minutes</Text>
            </View>
            <View style={styles.durationInputContainer}>
              <TextInput
                style={styles.durationInput}
                value={alarmDuration.seconds.toString()}
                onChangeText={(value) => handleDurationChange(value, 'seconds')}
                keyboardType="numeric"
                maxLength={2}
                placeholder="SS"
              />
              <Text style={styles.durationLabel}>Seconds</Text>
            </View>
          </View>
          
          <View style={styles.switchContainer}>
            <Text style={styles.label}>Recurring</Text>
            <TouchableOpacity
              style={[styles.switch, recurring && styles.switchActive]}
              onPress={() => setRecurring(!recurring)}
            >
              <Text style={styles.switchText}>{recurring ? 'Yes' : 'No'}</Text>
            </TouchableOpacity>
          </View>
          
          {recurring && (
            <>
              <Text style={styles.label}>Frequency</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={frequency}
                  onValueChange={(value) => setFrequency(value)}
                  style={styles.picker}
                >
                  <Picker.Item label="Daily" value="daily" />
                  <Picker.Item label="Weekly" value="weekly" />
                  <Picker.Item label="Monthly" value="monthly" />
                </Picker>
              </View>
            </>
          )}
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.submitButton]}
              onPress={handleSubmit}
            >
              <Text style={styles.buttonText}>Add Reminder</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 16,
  },
  picker: {
    height: 50,
  },
  timeButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  timeText: {
    fontSize: 16,
  },
  durationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  durationInputContainer: {
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  durationInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 8,
    width: '100%',
    textAlign: 'center',
    fontSize: 16,
  },
  durationLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  switch: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#eee',
  },
  switchActive: {
    backgroundColor: '#3498db',
  },
  switchText: {
    color: '#000',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: '45%',
  },
  cancelButton: {
    backgroundColor: '#e74c3c',
  },
  submitButton: {
    backgroundColor: '#3498db',
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
}); 