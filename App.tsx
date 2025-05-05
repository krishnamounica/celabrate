import React from 'react';
import { Provider } from 'react-redux';
import { store } from './src/redux/store';  // Ensure the store is correctly imported
import { NavigationContainer } from '@react-navigation/native';
import Route from './src/navigation/Route'; // Your main navigation route file
import { Linking } from 'react-native';

// Set up deep linking configuration
const linking = {
  prefixes: ['myapp://'],
  config: {
    screens: {
      GiftDetails: {
        path: 'gift/:id',
      },
      // other screens...
    },
  },
};


const App = () => {
  return (
    <Provider store={store}>
      {/* Wrap the app with NavigationContainer and pass the linking configuration */}
      <NavigationContainer linking={linking}>
        <Route />  {/* This is your route setup */}
      </NavigationContainer>
    </Provider>
  );
};

export default App;
