import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Platform, Linking } from 'react-native';
import FastImage from 'react-native-fast-image';
import { useFocusEffect } from '@react-navigation/native';
import { checkNotifications, openSettings } from 'react-native-permissions';

const withSplashScreen = (WrappedComponent) => {
  return (props) => {
    const [showSplash, setShowSplash] = useState(true);
    const [notificationEnabled, setNotificationEnabled] = useState(null);

    useFocusEffect(
      React.useCallback(() => {
        setShowSplash(true);
        const timer = setTimeout(() => {
          setShowSplash(false);
        }, 1500);
        return () => clearTimeout(timer);
      }, [])
    );

    useEffect(() => {
      (async () => {
        const { status } = await checkNotifications();
        setNotificationEnabled(status === 'granted');
      })();
    }, []);

    const handleGoToSettings = () => {
      if (Platform.OS === 'ios') {
        Linking.openURL('app-settings:');
      } else {
        openSettings();
      }
    };

    if (showSplash) {
      return (
        <View style={styles.splashContainer}>
          {
            notificationEnabled ? (
              <FastImage
                source={require('../assets/splash_gif.gif')}
                style={styles.logo}
                resizeMode={FastImage.resizeMode.contain}
              />
            ) : (
              <Modal transparent visible>
                <View style={styles.modalOverlay}>
                  <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Enable Notifications</Text>
                    <Text style={styles.modalText}>
                      To receive order updates, latest offers, personalized gift suggestions, and reminders for your special occasions, please enable notification permissions.
                    </Text>
                    <TouchableOpacity style={styles.button} onPress={handleGoToSettings}>
                      <Text style={styles.buttonText}>Open Settings</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.button, {  marginTop: 10 }]}
                      onPress={() => setShowSplash(false)} // Close modal and continue anyway
                    >
                      <Text style={styles.buttonText}>Skip & Continue</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>
            )
          }
          <Text style={styles.title}>Wish & Surprise</Text>
        </View>
      );
    }

    return <WrappedComponent {...props} />;
  };
};

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 250,
    height: 250,
    marginBottom: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#ff6600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    width: '85%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    color: '#333',
  },
  button: {
    backgroundColor: '#ff6600',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default withSplashScreen;
