import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';

const NotificationPrompt = () => {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    checkNotificationPermission();
  }, []);

  const checkNotificationPermission = async () => {
    const permission =
      Platform.OS === 'ios' ? PERMISSIONS.IOS.NOTIFICATIONS : PERMISSIONS.ANDROID.POST_NOTIFICATIONS;

    const result = await check(permission);
    if (result !== RESULTS.GRANTED) {
      // Show explanation modal
      setShowModal(true);
    }
  };

  const handleAllowPress = async () => {
    setShowModal(false);
    const permission =
      Platform.OS === 'ios' ? PERMISSIONS.IOS.NOTIFICATIONS : PERMISSIONS.ANDROID.POST_NOTIFICATIONS;

    const result = await request(permission);

    if (result === RESULTS.GRANTED) {
      console.log('✅ Notification permission granted');
    } else {
      console.log('❌ Notification permission denied');
    }
  };

  return (
    <Modal visible={showModal} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Stay Updated!</Text>
          <Text style={styles.message}>
            We send important updates about your orders, offers, and surprises. Please allow
            notifications.
          </Text>
          <TouchableOpacity style={styles.button} onPress={handleAllowPress}>
            <Text style={styles.buttonText}>Allow Notifications</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default NotificationPrompt;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 10,
    color: '#FF6B00', // your orange brand color
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#444',
  },
  button: {
    backgroundColor: '#FF6B00',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});

