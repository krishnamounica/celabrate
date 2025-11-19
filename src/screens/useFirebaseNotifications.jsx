import messaging from '@react-native-firebase/messaging';
import { useEffect } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function useFirebaseNotifications() {
  useEffect(() => {
    const fetchAndSendFCMToken = async () => {
      try {
        // 1. Get user data from AsyncStorage
        const storedUserData = await AsyncStorage.getItem('userData');
        let parsedData = {};

        if (storedUserData) {
          parsedData = JSON.parse(storedUserData);
        }
        console.log(parsedData)
        const name = parsedData.userName || parsedData.name || '';
        const email = parsedData.email || parsedData.user || '';
        const phone = parsedData.phone || '';
        const userId = parsedData.id || '';

        // 2. Request FCM permission
        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (enabled) {
          const token = await messaging().getToken();
          await fetch('https://wishandsurprise.com/backend/save-token.php', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              token,
              name,
              email,
              phone,
              userId
            })
          });

        }
      } catch (error) {
        console.error('Failed to fetch or send FCM token:', error);
      }
    };

    // Notification listener
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      Alert.alert("New Notification", remoteMessage.notification?.body || "You got a message!");
    });

    fetchAndSendFCMToken();

    return unsubscribe;
  }, []);
}
