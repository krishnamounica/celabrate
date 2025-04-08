import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import MyBottomTab from './MyBottomTab';
import {OrderHistory} from '../screens';
import ProductsScreen from '../screens/Categories/ProductsScreen';
import ProductDetails from '../screens/Search/ProductDetails';

const Stack = createNativeStackNavigator();

const MainStack = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="MyBottomTab" component={MyBottomTab} />
      <Stack.Screen name="OrderHistory" component={OrderHistory} />
      <Stack.Screen name="ProductsScreen" component={ProductsScreen} />
      <Stack.Screen name="ProductDetails" component={ProductDetails} />
    </Stack.Navigator>
  );
};

export default MainStack;

const styles = StyleSheet.create({});
