import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Linking, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NotificationsScreen = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
        const storedUserData = await AsyncStorage.getItem('userData');
      let parsedData = {};

      if (storedUserData) {
        parsedData = JSON.parse(storedUserData);
      }

      const email = parsedData.email || parsedData.user || '';

      const response = await axios.post(
        'https://wishandsurprise.com/backend/fetch_notifications.php',
        { email },
        { headers: { 'Content-Type': 'application/json' } }
      );
      const data = response.data?.data || [];
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

 const handleOpenLink = (notification) => {
  const { link, component_name, search_text } = notification;
  if (component_name) {
    try {
      let params = {};
      if (search_text && typeof search_text === 'string') {
        const normalizedText = search_text.replace(/'/g, '"');
        params = JSON.parse(normalizedText);
      }
      navigation.navigate(component_name, params);
    } catch (e) {
      navigation.navigate(component_name); // fallback without params
    }
    return;
  }
  if (link) {
    Linking.canOpenURL(link)
      .then((supported) => {
        if (supported) {
          Linking.openURL(link);
        } else {
          console.log("Can't handle URL: " + link);
        }
      })
      .catch((err) => console.error("URL error:", err));
  } else {
    console.log("No link or component name to open.");
  }
};


  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => handleOpenLink(item)}
      style={styles.notificationCard}
    >
      {item?.title && <Text style={styles.title}>{item.title}</Text>}
      {item?.body && <Text style={styles.body}>{item.body}</Text>}
      {item?.email && <Text style={styles.email}>{item.email}</Text>}
      {item?.sent_at && <Text style={styles.time}>{item.sent_at}</Text>}
      {item?.link && <Text style={styles.link}>{item.link}</Text>}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#f60" />
      ) : notifications.length === 0 ? (
        <Text>No notifications available</Text>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
        />
      )}
    </View>
  );
};

export default NotificationsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#fff',
  },
  notificationCard: {
    backgroundColor: '#ffe4b5',
    borderRadius: 10,
    padding: 15,
    marginBottom: 12,
    elevation: 3,
  },
  title: {
    fontSize: 17,
    fontWeight: 'bold',
  },
  body: {
    marginTop: 5,
    fontSize: 15,
  },
  email: {
    marginTop: 5,
    fontSize: 13,
    color: '#666',
  },
  time: {
    marginTop: 3,
    fontSize: 12,
    color: '#888',
  },
  link: {
    marginTop: 5,
    fontSize: 12,
    color: '#1e90ff',
  },
});
