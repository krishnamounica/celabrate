
import React from 'react';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { store } from './redux/store';
import MainStack from './navigation/MainStack';
import { navigationRef, DeepLinkHandler } from './navigation/Route';

export default function AppEntry() {
  console.log('APPENTRY store:', store);
  if (!store) console.warn('AppEntry: redux store is undefined!');
  return (
    <Provider store={store}>
      <NavigationContainer ref={navigationRef}>
        <MainStack />
        <DeepLinkHandler />
      </NavigationContainer>
    </Provider>
  );
}
