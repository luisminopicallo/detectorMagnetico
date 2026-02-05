import { useState, useEffect } from 'react';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const useNotifications = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  
  // NUEVO: Textos personalizables
  const [notifTitle, setNotifTitle] = useState("🔮 Sensor");
  const [notifBody, setNotifBody] = useState("Objeto Detectado");

  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);

  async function registerForPushNotificationsAsync() {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
  }

  const sendNotification = async () => {
    if (!notificationsEnabled) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: notifTitle, 
        body: notifBody,
      },
      trigger: null,
    });
  };

  return {
    notificationsEnabled, setNotificationsEnabled,
    notifTitle, setNotifTitle,
    notifBody, setNotifBody,
    sendNotification
  };
};