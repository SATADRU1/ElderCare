import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Switch, Alert, Platform } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { User, Settings, Bell, Moon, Shield, CircleHelp as HelpCircle, LogOut, Info } from 'lucide-react-native';
import { router } from 'expo-router';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  
  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/(auth)');
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to log out. Please try again.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Profile header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {user?.name?.charAt(0) || 'U'}
          </Text>
        </View>
        <Text style={styles.userName}>{user?.name}</Text>
        <Text style={styles.userRole}>
          {user?.role === 'elderly' ? 'Elderly User' : 'Caregiver'}
        </Text>
      </View>

      {/* Main menu section */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => {
            // In a real app, this would navigate to a profile edit screen
            Alert.alert('Edit Profile', 'This would open a form to edit your profile.');
          }}
        >
          <View style={styles.menuItemIconContainer}>
            <User size={20} color="#3498db" />
          </View>
          <View style={styles.menuItemContent}>
            <Text style={styles.menuItemTitle}>Account Details</Text>
            <Text style={styles.menuItemDescription}>
              Update your name, email, phone
            </Text>
          </View>
        </TouchableOpacity>
        
        {user?.role === 'elderly' && (
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => {
              // In a real app, this would navigate to a medical info edit screen
              Alert.alert('Medical Information', 'This would open a form to edit your medical info.');
            }}
          >
            <View style={styles.menuItemIconContainer}>
              <Shield size={20} color="#e67e22" />
            </View>
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemTitle}>Medical Information</Text>
              <Text style={styles.menuItemDescription}>
                Update allergies, conditions, doctor's info
              </Text>
            </View>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => {
            // In a real app, this would navigate to caregiver management
            Alert.alert(
              user?.role === 'elderly' ? 'Caregivers' : 'Elderly Users',
              'This would allow you to manage your connections.'
            );
          }}
        >
          <View style={styles.menuItemIconContainer}>
            <User size={20} color="#27ae60" />
          </View>
          <View style={styles.menuItemContent}>
            <Text style={styles.menuItemTitle}>
              {user?.role === 'elderly' ? 'My Caregivers' : 'My Elderly Users'}
            </Text>
            <Text style={styles.menuItemDescription}>
              {user?.role === 'elderly' 
                ? 'Manage who can view your health data' 
                : 'Manage your elderly connections'}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Settings section */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Settings</Text>
        
        <View style={styles.settingsItem}>
          <View style={styles.settingIconAndText}>
            <View style={styles.menuItemIconContainer}>
              <Bell size={20} color="#3498db" />
            </View>
            <Text style={styles.settingTitle}>Notifications</Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: '#d1d1d6', true: '#3498db' }}
            thumbColor={Platform.OS === 'ios' ? '#fff' : notificationsEnabled ? '#fff' : '#f4f3f4'}
          />
        </View>
        
        <View style={styles.settingsItem}>
          <View style={styles.settingIconAndText}>
            <View style={styles.menuItemIconContainer}>
              <Moon size={20} color="#9b59b6" />
            </View>
            <Text style={styles.settingTitle}>Dark Mode</Text>
          </View>
          <Switch
            value={darkModeEnabled}
            onValueChange={setDarkModeEnabled}
            trackColor={{ false: '#d1d1d6', true: '#3498db' }}
            thumbColor={Platform.OS === 'ios' ? '#fff' : darkModeEnabled ? '#fff' : '#f4f3f4'}
          />
        </View>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => {
            // In a real app, this would navigate to app settings
            Alert.alert('App Settings', 'This would open app settings screen.');
          }}
        >
          <View style={styles.menuItemIconContainer}>
            <Settings size={20} color="#7f8c8d" />
          </View>
          <View style={styles.menuItemContent}>
            <Text style={styles.menuItemTitle}>App Settings</Text>
            <Text style={styles.menuItemDescription}>
              Language, units, privacy settings
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Support section */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Support</Text>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => {
            // In a real app, this would navigate to help center
            Alert.alert('Help Center', 'This would open the help center screen.');
          }}
        >
          <View style={styles.menuItemIconContainer}>
            <HelpCircle size={20} color="#3498db" />
          </View>
          <View style={styles.menuItemContent}>
            <Text style={styles.menuItemTitle}>Help Center</Text>
            <Text style={styles.menuItemDescription}>
              FAQs, tutorials, contact support
            </Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => {
            // In a real app, this would navigate to about screen
            Alert.alert('About', 'About ElderCare app version 1.0.0');
          }}
        >
          <View style={styles.menuItemIconContainer}>
            <Info size={20} color="#7f8c8d" />
          </View>
          <View style={styles.menuItemContent}>
            <Text style={styles.menuItemTitle}>About</Text>
            <Text style={styles.menuItemDescription}>
              Version info, terms, privacy policy
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Logout button */}
      <TouchableOpacity 
        style={styles.logoutButton}
        onPress={() => {
          Alert.alert(
            'Log Out',
            'Are you sure you want to log out?',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Log Out', style: 'destructive', onPress: handleLogout },
            ]
          );
        }}
      >
        <LogOut size={20} color="#e74c3c" />
        <Text style={styles.logoutButtonText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  profileHeader: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 20,
    backgroundColor: '#fff',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarText: {
    fontFamily: 'Inter-Bold',
    fontSize: 32,
    color: '#fff',
  },
  userName: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    marginBottom: 5,
  },
  userRole: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#666',
  },
  sectionContainer: {
    backgroundColor: '#fff',
    marginTop: 20,
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    marginBottom: 15,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f1f1',
  },
  menuItemIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemTitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    marginBottom: 2,
  },
  menuItemDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#666',
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f1f1',
  },
  settingIconAndText: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingTitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    marginLeft: 15,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    marginTop: 20,
    marginBottom: 40,
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 20,
  },
  logoutButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#e74c3c',
    marginLeft: 10,
  },
});