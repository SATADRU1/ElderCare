import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useReminders } from '@/context/ReminderContext';
import { useAuth } from '@/context/AuthContext';
import { Calendar as CalendarIcon, Clock, MapPin, CreditCard as Edit, Plus, ChevronLeft, ChevronRight } from 'lucide-react-native';

export default function AppointmentsScreen() {
  const { appointments } = useReminders();
  const { user } = useAuth();
  
  // State for selected date and current month
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Get appointments for the selected date
  const appointmentsForSelectedDate = appointments.filter(appointment => {
    return appointment.date === selectedDate.toISOString().split('T')[0];
  });

  // Generate dates for the calendar
  const generateCalendarDates = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // Get the first day of the month
    const firstDay = new Date(year, month, 1);
    const firstDayOfWeek = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Get the last day of the month
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    // Create an array of dates
    const dates = [];
    
    // Add empty spaces for days before the first day of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      dates.push(null);
    }
    
    // Add the days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      dates.push(date);
    }
    
    return dates;
  };
  
  // Format the month and year for display
  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };
  
  // Change the month
  const changeMonth = (increment: number) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + increment);
    setCurrentMonth(newMonth);
  };
  
  // Check if the date has an appointment
  const hasAppointment = (date: Date) => {
    if (!date) return false;
    const dateStr = date.toISOString().split('T')[0];
    return appointments.some(appointment => appointment.date === dateStr);
  };
  
  // Check if the date is today
  const isToday = (date: Date) => {
    if (!date) return false;
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };
  
  // Check if the date is selected
  const isSelected = (date: Date) => {
    if (!date) return false;
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  return (
    <View style={styles.container}>
      {/* Calendar Header */}
      <View style={styles.calendarHeader}>
        <TouchableOpacity onPress={() => changeMonth(-1)}>
          <ChevronLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.monthYearText}>{formatMonthYear(currentMonth)}</Text>
        <TouchableOpacity onPress={() => changeMonth(1)}>
          <ChevronRight size={24} color="#333" />
        </TouchableOpacity>
      </View>
      
      {/* Weekday Headers */}
      <View style={styles.weekdayHeader}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
          <Text key={index} style={styles.weekdayText}>{day}</Text>
        ))}
      </View>
      
      {/* Calendar Grid */}
      <View style={styles.calendarGrid}>
        {generateCalendarDates().map((date, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.dateCell,
              isSelected(date) && styles.selectedDateCell,
              isToday(date) && styles.todayCell,
            ]}
            onPress={() => date && setSelectedDate(date)}
            disabled={!date}
          >
            {date ? (
              <View style={styles.dateCellContent}>
                <Text 
                  style={[
                    styles.dateText,
                    isSelected(date) && styles.selectedDateText,
                    isToday(date) && styles.todayText,
                  ]}
                >
                  {date.getDate()}
                </Text>
                {hasAppointment(date) && <View style={styles.appointmentDot} />}
              </View>
            ) : (
              <Text> </Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
      
      {/* Appointments List */}
      <View style={styles.appointmentsContainer}>
        <Text style={styles.appointmentsHeader}>
          Appointments for {selectedDate.toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'long', 
            day: 'numeric' 
          })}
        </Text>
        
        <ScrollView style={styles.appointmentsList}>
          {appointmentsForSelectedDate.length > 0 ? (
            appointmentsForSelectedDate.map((appointment) => (
              <View key={appointment.id} style={styles.appointmentCard}>
                <View style={styles.appointmentInfo}>
                  <Text style={styles.appointmentTitle}>{appointment.title}</Text>
                  
                  <View style={styles.appointmentDetail}>
                    <Clock size={16} color="#666" />
                    <Text style={styles.appointmentDetailText}>{appointment.time}</Text>
                  </View>
                  
                  {appointment.location && (
                    <View style={styles.appointmentDetail}>
                      <MapPin size={16} color="#666" />
                      <Text style={styles.appointmentDetailText}>{appointment.location}</Text>
                    </View>
                  )}
                  
                  {appointment.doctorName && (
                    <View style={styles.appointmentDetail}>
                      <CalendarIcon size={16} color="#666" />
                      <Text style={styles.appointmentDetailText}>with {appointment.doctorName}</Text>
                    </View>
                  )}
                </View>
                
                {user?.role === 'caregiver' && (
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => {
                      // In a real app, this would navigate to an edit form
                      Alert.alert('Edit Appointment', 'This would open a form to edit the appointment.');
                    }}
                  >
                    <Edit size={18} color="#3498db" />
                  </TouchableOpacity>
                )}
              </View>
            ))
          ) : (
            <View style={styles.emptyStateContainer}>
              <Text style={styles.emptyStateText}>No appointments scheduled for this day</Text>
            </View>
          )}
        </ScrollView>
      </View>
      
      {/* Add button for caregivers */}
      {user?.role === 'caregiver' && (
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            // In a real app, this would navigate to a form to add a new appointment
            Alert.alert('Add Appointment', 'This would open a form to add a new appointment.');
          }}
        >
          <Plus size={24} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  monthYearText: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
  },
  weekdayHeader: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingBottom: 10,
  },
  weekdayText: {
    flex: 1,
    textAlign: 'center',
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#666',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#fff',
    paddingBottom: 15,
  },
  dateCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
  },
  dateCellContent: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '80%',
    aspectRatio: 1,
    borderRadius: 100,
  },
  selectedDateCell: {
    backgroundColor: '#3498db',
    borderRadius: 100,
  },
  todayCell: {
    borderWidth: 1,
    borderColor: '#3498db',
    borderRadius: 100,
  },
  dateText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
  },
  selectedDateText: {
    color: '#fff',
    fontFamily: 'Inter-Bold',
  },
  todayText: {
    color: '#3498db',
    fontFamily: 'Inter-Bold',
  },
  appointmentDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#e67e22',
    marginTop: 2,
  },
  appointmentsContainer: {
    flex: 1,
    backgroundColor: '#f5f5f7',
    paddingTop: 15,
    paddingHorizontal: 15,
  },
  appointmentsHeader: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    marginBottom: 15,
  },
  appointmentsList: {
    flex: 1,
  },
  appointmentCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  appointmentInfo: {
    flex: 1,
  },
  appointmentTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    marginBottom: 8,
  },
  appointmentDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  appointmentDetailText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  editButton: {
    padding: 10,
  },
  emptyStateContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
});