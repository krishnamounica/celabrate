import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MyBottomTab from './MyBottomTab';
import {OrderHistory} from '../screens';
import ProductsScreen from '../screens/Categories/ProductsScreen';
import ProductDetails from '../screens/Search/ProductDetails';
import Registration from '../screens/Auth/Registration';
import Login from '../screens/Auth/Login';
import AuthLoading from '../screens/Auth/AuthLoading';
import GiftOrderCard from '../screens/GiftOrderCard';

const Stack = createNativeStackNavigator();

const MainStack = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}} initialRouteName="AuthLoading">
      <Stack.Screen name="AuthLoading" component={AuthLoading} />
    <Stack.Screen name="Login" component={Login} />
    <Stack.Screen name="Registration" component={Registration} />
    <Stack.Screen name="Request" component={GiftOrderCard} />
    <Stack.Screen name="MyBottomTab" component={MyBottomTab} />
    <Stack.Screen name="OrderHistory" component={OrderHistory} />
    <Stack.Screen name="ProductsScreen" component={ProductsScreen} />
    <Stack.Screen name="ProductDetails" component={ProductDetails} />
  </Stack.Navigator>
  );
};

export default MainStack;

const styles = StyleSheet.create({});
