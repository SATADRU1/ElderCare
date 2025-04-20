import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Dimensions, Platform, Alert } from 'react-native';
import { useHealth } from '@/context/HealthContext';
import { useAuth } from '@/context/AuthContext';
import { Activity, Heart, Plus } from 'lucide-react-native';
import { LineChart } from 'react-native-chart-kit';

export default function HealthScreen() {
  const { healthLogs, checkIns, getRecentHealthLogs } = useHealth();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'logs' | 'vitals'>('vitals');
  const [selectedVital, setSelectedVital] = useState<string>('bloodPressure');

  // Get blood pressure readings
  const bloodPressureReadings = getRecentHealthLogs('bloodPressure');
  const formattedBloodPressure = bloodPressureReadings.map(log => {
    // Extract systolic value (first number in the string e.g., "120/80")
    const systolic = parseInt(log.value.toString().split('/')[0], 10);
    return { 
      value: systolic, 
      date: new Date(log.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    };
  });

  // Get blood sugar readings
  const bloodSugarReadings = getRecentHealthLogs('bloodSugar');
  const formattedBloodSugar = bloodSugarReadings.map(log => {
    const value = typeof log.value === 'string' ? parseInt(log.value, 10) : log.value;
    return { 
      value: value as number, 
      date: new Date(log.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    };
  });

  // Get chart data based on selected vital
  const getChartData = () => {
    let data;
    let label;
    let color;
    
    switch (selectedVital) {
      case 'bloodPressure':
        data = formattedBloodPressure;
        label = 'Blood Pressure';
        color = '#e74c3c';
        break;
      case 'bloodSugar':
        data = formattedBloodSugar;
        label = 'Blood Sugar';
        color = '#3498db';
        break;
      default:
        data = formattedBloodPressure;
        label = 'Blood Pressure';
        color = '#e74c3c';
    }
    
    return {
      labels: data.map(item => item.date).reverse(),
      datasets: [
        {
          data: data.map(item => item.value).reverse(),
          color: () => color,
          strokeWidth: 2,
        },
      ],
      legend: [label],
    };
  };

  return (
    <ScrollView style={styles.container}>
      {/* Tab selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'vitals' && styles.activeTab]}
          onPress={() => setActiveTab('vitals')}
        >
          <Heart size={18} color={activeTab === 'vitals' ? '#3498db' : '#666'} />
          <Text style={[styles.tabText, activeTab === 'vitals' && styles.activeTabText]}>
            Vital Signs
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'logs' && styles.activeTab]}
          onPress={() => setActiveTab('logs')}
        >
          <Activity size={18} color={activeTab === 'logs' ? '#3498db' : '#666'} />
          <Text style={[styles.tabText, activeTab === 'logs' && styles.activeTabText]}>
            Health Logs
          </Text>
        </TouchableOpacity>
      </View>

      {/* Vitals tab content */}
      {activeTab === 'vitals' && (
        <View style={styles.contentContainer}>
          {/* Vital selector */}
          <View style={styles.vitalSelector}>
            <TouchableOpacity
              style={[styles.vitalButton, selectedVital === 'bloodPressure' && styles.selectedVitalButton]}
              onPress={() => setSelectedVital('bloodPressure')}
            >
              <Text style={[
                styles.vitalButtonText, 
                selectedVital === 'bloodPressure' && styles.selectedVitalButtonText
              ]}>
                Blood Pressure
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.vitalButton, selectedVital === 'bloodSugar' && styles.selectedVitalButton]}
              onPress={() => setSelectedVital('bloodSugar')}
            >
              <Text style={[
                styles.vitalButtonText, 
                selectedVital === 'bloodSugar' && styles.selectedVitalButtonText
              ]}>
                Blood Sugar
              </Text>
            </TouchableOpacity>
          </View>

          {/* Chart section */}
          <View style={styles.chartContainer}>
            {bloodPressureReadings.length > 0 ? (
              <>
                <Text style={styles.chartTitle}>
                  {selectedVital === 'bloodPressure' ? 'Blood Pressure Readings' : 'Blood Sugar Levels'}
                </Text>
                
                <LineChart
                  data={getChartData()}
                  width={Dimensions.get('window').width - 40}
                  height={220}
                  chartConfig={{
                    backgroundColor: '#fff',
                    backgroundGradientFrom: '#fff',
                    backgroundGradientTo: '#fff',
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(52, 152, 219, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    style: {
                      borderRadius: 16,
                    },
                    propsForDots: {
                      r: '5',
                      strokeWidth: '2',
                    },
                  }}
                  bezier
                  style={{
                    marginVertical: 8,
                    borderRadius: 16,
                  }}
                />
                
                <Text style={styles.chartNote}>
                  {selectedVital === 'bloodPressure' 
                    ? 'Showing systolic readings for the past 7 days'
                    : 'Blood sugar readings for the past 7 days'
                  }
                </Text>
              </>
            ) : (
              <View style={styles.emptyStateContainer}>
                <Text style={styles.emptyStateText}>No data available</Text>
              </View>
            )}
          </View>

          {/* Latest readings section */}
          <View style={styles.latestReadingsContainer}>
            <Text style={styles.sectionTitle}>Latest Readings</Text>
            
            {selectedVital === 'bloodPressure' ? (
              bloodPressureReadings.length > 0 ? (
                bloodPressureReadings.slice(0, 3).map((reading, index) => (
                  <View key={reading.id} style={styles.readingCard}>
                    <View>
                      <Text style={styles.readingValue}>{reading.value}</Text>
                      <Text style={styles.readingUnit}>{reading.unit}</Text>
                    </View>
                    <View>
                      <Text style={styles.readingDate}>
                        {new Date(reading.timestamp).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                      {reading.notes && <Text style={styles.readingNotes}>{reading.notes}</Text>}
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.noDataText}>No blood pressure readings available</Text>
              )
            ) : (
              bloodSugarReadings.length > 0 ? (
                bloodSugarReadings.slice(0, 3).map((reading, index) => (
                  <View key={reading.id} style={styles.readingCard}>
                    <View>
                      <Text style={styles.readingValue}>{reading.value}</Text>
                      <Text style={styles.readingUnit}>{reading.unit}</Text>
                    </View>
                    <View>
                      <Text style={styles.readingDate}>
                        {new Date(reading.timestamp).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                      {reading.notes && <Text style={styles.readingNotes}>{reading.notes}</Text>}
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.noDataText}>No blood sugar readings available</Text>
              )
            )}
          </View>
        </View>
      )}

      {/* Logs tab content */}
      {activeTab === 'logs' && (
        <View style={styles.contentContainer}>
          <Text style={styles.sectionTitle}>Daily Check-ins</Text>
          
          {checkIns.length > 0 ? (
            checkIns.map((checkIn) => (
              <View key={checkIn.id} style={styles.checkInCard}>
                <View style={styles.checkInHeader}>
                  <Text style={styles.checkInDate}>
                    {new Date(checkIn.timestamp).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </Text>
                  <View style={[
                    styles.moodIndicator, 
                    { backgroundColor: getMoodColor(checkIn.moodRating) }
                  ]}>
                    <Text style={styles.moodText}>
                      {getMoodEmoji(checkIn.moodRating)}
                    </Text>
                  </View>
                </View>
                
                {checkIn.notes && (
                  <Text style={styles.checkInNotes}>{checkIn.notes}</Text>
                )}
                
                {checkIn.painLevel && (
                  <View style={styles.checkInDetail}>
                    <Text style={styles.checkInDetailLabel}>Pain Level:</Text>
                    <Text style={styles.checkInDetailValue}>
                      {checkIn.painLevel}/5
                    </Text>
                  </View>
                )}
                
                {checkIn.symptoms && checkIn.symptoms.length > 0 && (
                  <View style={styles.checkInDetail}>
                    <Text style={styles.checkInDetailLabel}>Symptoms:</Text>
                    <Text style={styles.checkInDetailValue}>
                      {checkIn.symptoms.join(', ')}
                    </Text>
                  </View>
                )}
                
                {checkIn.medications && checkIn.medications.length > 0 && (
                  <View style={styles.medicationsContainer}>
                    <Text style={styles.checkInDetailLabel}>Medications:</Text>
                    {checkIn.medications.map((medication, index) => (
                      <View key={index} style={styles.medicationItem}>
                        <Text style={styles.medicationName}>
                          {getMedicationName(medication.medicationId)}
                        </Text>
                        <Text style={[
                          styles.medicationStatus,
                          { color: medication.taken ? '#27ae60' : '#e74c3c' }
                        ]}>
                          {medication.taken ? 'Taken' : 'Missed'}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))
          ) : (
            <Text style={styles.noDataText}>No check-ins available</Text>
          )}
        </View>
      )}

      {/* Add button for elderly users */}
      {user?.role === 'elderly' && (
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            if (activeTab === 'vitals') {
              // In a real app, this would navigate to a form to add a new vital reading
              Alert.alert('Add Reading', 'This would open a form to add a new health reading.');
            } else {
              // In a real app, this would navigate to a form to add a new check-in
              Alert.alert('Add Check-in', 'This would open a form to add a new daily check-in.');
            }
          }}
        >
          <Plus size={24} color="#fff" />
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

// Helper functions
const getMoodColor = (rating: number): string => {
  switch (rating) {
    case 1: return '#e74c3c'; // Red
    case 2: return '#e67e22'; // Orange
    case 3: return '#f1c40f'; // Yellow
    case 4: return '#2ecc71'; // Green
    case 5: return '#27ae60'; // Dark Green
    default: return '#95a5a6'; // Gray
  }
};

const getMoodEmoji = (rating: number): string => {
  switch (rating) {
    case 1: return '😢';
    case 2: return '😕';
    case 3: return '😐';
    case 4: return '🙂';
    case 5: return '😄';
    default: return '😐';
  }
};

const getMedicationName = (medicationId: string): string => {
  // This would normally fetch the medication name from your data store
  // For demo purposes, we'll return a placeholder
  const medicationMap = {
    'med1': 'Lisinopril',
    'med2': 'Metformin',
  };
  return medicationMap[medicationId] || 'Unknown Medication';
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#3498db',
  },
  tabText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#666',
    marginLeft: 8,
  },
  activeTabText: {
    color: '#3498db',
  },
  contentContainer: {
    padding: 20,
  },
  vitalSelector: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  vitalButton: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f1f1f1',
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  selectedVitalButton: {
    backgroundColor: '#3498db',
  },
  vitalButtonText: {
    fontFamily: 'Inter-Medium',
    color: '#666',
  },
  selectedVitalButtonText: {
    color: '#fff',
  },
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  chartTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    marginBottom: 10,
  },
  chartNote: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
  },
  emptyStateContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#666',
  },
  latestReadingsContainer: {
    marginTop: 10,
  },
  sectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    marginBottom: 15,
  },
  readingCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  readingValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
  },
  readingUnit: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#666',
  },
  readingDate: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    textAlign: 'right',
  },
  readingNotes: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#666',
    textAlign: 'right',
    marginTop: 5,
  },
  noDataText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    padding: 20,
  },
  checkInCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  checkInHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  checkInDate: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
  },
  moodIndicator: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moodText: {
    fontSize: 20,
  },
  checkInNotes: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    marginBottom: 10,
  },
  checkInDetail: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  checkInDetailLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginRight: 5,
  },
  checkInDetailValue: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  medicationsContainer: {
    marginTop: 10,
  },
  medicationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f1f1',
  },
  medicationName: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  medicationStatus: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
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