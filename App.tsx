// App.js (example root)
import React from 'react';
import { SafeAreaView } from 'react-native';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import MainStack from './src/navigation/MainStack';

// import the store (create if you don't have one)
import store from './src/redux/store'; // <--- adjust path to your redux store

// If you used the DeepLinkHandler approach:
import { DeepLinkHandler, navigationRef } from './src/navigation/Route';

export default function App() {
  return (
    // Provider must be the absolute root so all screens can access redux
    <Provider store={store}>
      <NavigationContainer ref={navigationRef}>
        <MainStack />
        {/* deep link side-effects should be inside the same nav container */}
        <DeepLinkHandler />
      </NavigationContainer>
    </Provider>
  );
}
