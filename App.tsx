// App.js
import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import MainStack from './src/navigation/MainStack';
import store from './src/redux/store';

import { DeepLinkHandler, navigationRef } from './src/navigation/Route';
import useFirebaseNotifications from './src/screens/useFirebaseNotifications';
import { SnackbarProvider } from './src/context/SnackbarContext';

export default function App() {
  useFirebaseNotifications();

  return (
    <Provider store={store}>
      <SnackbarProvider>
        <SafeAreaView style={styles.root}>
          <NavigationContainer ref={navigationRef}>
            <MainStack />
            <DeepLinkHandler />
          </NavigationContainer>

          {/* 🔥 MUST be OUTSIDE NavigationContainer */}
             
        </SafeAreaView>
      </SnackbarProvider>
    </Provider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
