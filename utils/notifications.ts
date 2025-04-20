import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Request permissions
export const requestNotificationPermissions = async () => {
  if (Platform.OS === 'web') {
    // Web doesn't require explicit permission for notifications
    return { granted: true };
  }

  const { status } = await Notifications.requestPermissionsAsync();
  return { granted: status === 'granted' };
};

// Schedule a local notification
export const scheduleNotification = async (
  title: string,
  body: string,
  data: any = {},
  trigger: Notifications.NotificationTriggerInput = null
) => {
  // Default to showing immediately if no trigger is provided
  const notificationTrigger = trigger || { seconds: 1 };

  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true, // Play a sound
        priority: Notifications.AndroidNotificationPriority.HIGH, // High priority for Android
      },
      trigger: notificationTrigger,
    });
    return { success: true, id };
  } catch (error) {
    console.error('Failed to schedule notification:', error);
    return { success: false, error };
  }
};

// Schedule a recurring notification (daily)
export const scheduleDailyNotification = async (
  title: string,
  body: string,
  hour: number,
  minute: number,
  data: any = {}
) => {
  const trigger: Notifications.DailyTriggerInput = {
    hour,
    minute,
    repeats: true,
  };

  return scheduleNotification(title, body, data, trigger);
};

// Schedule a one-time notification at a specific date
export const scheduleOneTimeNotification = async (
  title: string,
  body: string,
  date: Date,
  data: any = {}
) => {
  const trigger: Notifications.DateTriggerInput = date;
  return scheduleNotification(title, body, data, trigger);
};

// Cancel a scheduled notification
export const cancelNotification = async (notificationId: string) => {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
    return { success: true };
  } catch (error) {
    console.error('Failed to cancel notification:', error);
    return { success: false, error };
  }
};

// Cancel all scheduled notifications
export const cancelAllNotifications = async () => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    return { success: true };
  } catch (error) {
    console.error('Failed to cancel all notifications:', error);
    return { success: false, error };
  }
};

// Web fallback for notifications
export const showWebNotification = (title: string, body: string) => {
  if (Platform.OS === 'web' && 'Notification' in window) {
    // Check if browser supports notifications
    if (Notification.permission === 'granted') {
      new Notification(title, { body });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification(title, { body });
        }
      });
    }
  }
};

// Helper to send a notification based on platform
export const sendPlatformNotification = (title: string, body: string, data: any = {}) => {
  if (Platform.OS === 'web') {
    showWebNotification(title, body);
    return { success: true };
  } else {
    return scheduleNotification(title, body, data);
  }
};

// Add listener for notification interactions
export const addNotificationResponseReceivedListener = (
  callback: (response: Notifications.NotificationResponse) => void
) => {
  return Notifications.addNotificationResponseReceivedListener(callback);
};

// Add listener for notifications received while app is foregrounded
export const addNotificationReceivedListener = (
  callback: (notification: Notifications.Notification) => void
) => {
  return Notifications.addNotificationReceivedListener(callback);
};