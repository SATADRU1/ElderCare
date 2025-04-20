import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, Platform, Alert } from 'react-native';
import { useReminders } from '@/context/ReminderContext';
import { useAuth } from '@/context/AuthContext';
import { Check, Bell, AlarmClock, Droplet, Calendar, Info } from 'lucide-react-native';
import ReminderForm from '@/components/ReminderForm';
import { Reminder } from '@/types';

export default function RemindersScreen() {
  const { reminders, markReminderComplete } = useReminders();
  const { user } = useAuth();
  const [filter, setFilter] = useState<'all' | 'today' | 'upcoming' | 'completed'>('all');
  const [showReminderForm, setShowReminderForm] = useState(false);

  // Filter reminders based on the selected filter
  const filteredReminders = reminders.filter(reminder => {
    if (filter === 'all') return true;
    if (filter === 'completed') return reminder.completed;
    if (filter === 'today') {
      // Simple check for today's reminders
      const today = new Date().toISOString().split('T')[0];
      return !reminder.completed;
    }
    if (filter === 'upcoming') {
      // Simple check for upcoming reminders
      return !reminder.completed;
    }
    return true;
  });

  // Get icon based on reminder type
  const getReminderIcon = (type: string) => {
    switch (type) {
      case 'medication':
        return <Bell size={22} color="#3498db" />;
      case 'appointment':
        return <Calendar size={22} color="#e67e22" />;
      case 'hydration':
        return <Droplet size={22} color="#27ae60" />;
      default:
        return <Info size={22} color="#9b59b6" />;
    }
  };

  // Handle marking a reminder as complete
  const handleCompleteReminder = (id: string) => {
    markReminderComplete(id).then(() => {
      Alert.alert('Success', 'Reminder marked as completed!');
    });
  };

  // Render an individual reminder item
  const renderReminderItem = ({ item }: { item: Reminder }) => (
    <View style={styles.reminderCard}>
      <View style={styles.reminderIconContainer}>
        {getReminderIcon(item.type)}
      </View>
      
      <View style={styles.reminderContent}>
        <Text style={styles.reminderTitle}>{item.title}</Text>
        {item.description && (
          <Text style={styles.reminderDescription}>{item.description}</Text>
        )}
        <View style={styles.reminderMeta}>
          <AlarmClock size={14} color="#666" />
          <Text style={styles.reminderTime}>{item.time}</Text>
          {item.recurring && (
            <Text style={styles.reminderRecurring}>
              • {item.frequency === 'daily' ? 'Daily' : item.frequency}
            </Text>
          )}
        </View>
      </View>
      
      {user?.role === 'elderly' && (
        <TouchableOpacity
          style={[
            styles.completeButton,
            item.completed && styles.completedButton,
          ]}
          onPress={() => handleCompleteReminder(item.id)}
          disabled={item.completed}
        >
          <Check size={20} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Filter buttons */}
      <View style={styles.filterContainer}>
        <ScrollableTabBar 
          tabs={[
            { key: 'all', label: 'All' },
            { key: 'today', label: 'Today' },
            { key: 'upcoming', label: 'Upcoming' },
            { key: 'completed', label: 'Completed' },
          ]}
          activeKey={filter}
          onChange={(key) => setFilter(key as typeof filter)}
        />
      </View>

      {/* Reminders list */}
      <FlatList
        data={filteredReminders}
        renderItem={renderReminderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No reminders found</Text>
          </View>
        )}
      />

      {/* Add button for caregivers */}
      {user?.role === 'caregiver' && (
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowReminderForm(true)}
        >
          <Text style={styles.addButtonText}>+ Add Reminder</Text>
        </TouchableOpacity>
      )}

      {/* Reminder Form Modal */}
      <ReminderForm
        visible={showReminderForm}
        onClose={() => setShowReminderForm(false)}
      />
    </View>
  );
}

// Custom ScrollableTabBar component
const ScrollableTabBar = ({ 
  tabs, 
  activeKey, 
  onChange 
}: { 
  tabs: { key: string; label: string }[];
  activeKey: string;
  onChange: (key: string) => void;
}) => {
  return (
    <View style={tabStyles.container}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={[
            tabStyles.tab,
            activeKey === tab.key && tabStyles.activeTab,
          ]}
          onPress={() => onChange(tab.key)}
        >
          <Text
            style={[
              tabStyles.tabText,
              activeKey === tab.key && tabStyles.activeTabText,
            ]}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const tabStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 10,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: '#f1f1f1',
  },
  activeTab: {
    backgroundColor: '#3498db',
  },
  tabText: {
    fontFamily: 'Inter-Medium',
    color: '#666',
  },
  activeTabText: {
    color: '#fff',
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  filterContainer: {
    paddingTop: 15,
    paddingBottom: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  listContainer: {
    padding: 15,
    paddingBottom: 100, // Add padding for the add button
  },
  reminderCard: {
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
  reminderIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  reminderContent: {
    flex: 1,
  },
  reminderTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    marginBottom: 4,
  },
  reminderDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  reminderMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reminderTime: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
    marginRight: 5,
  },
  reminderRecurring: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#666',
  },
  completeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    alignSelf: 'center',
  },
  completedButton: {
    backgroundColor: '#27ae60',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#666',
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#3498db',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  addButtonText: {
    fontFamily: 'Inter-Bold',
    color: '#fff',
    fontSize: 16,
  },
});