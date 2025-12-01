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
import GiftDetailsScreen from '../screens/GiftDetailsScreen';
import InvoiceScreen from '../screens/InvoiceScreen';
import RazorpayPaymentButton from '../screens/RazorpayPaymentButton';
import BillingAddressScreen from '../screens/BillingAddressScreen';
import ShippingAddressScreen from '../screens/ShippingAddressScreen';
import KeyChains from '../screens/KeyChains';
import Resin from '../screens/Resin';
import NotificationsScreen from '../screens/Home/NotificationsScreen';
const Stack = createNativeStackNavigator();

const MainStack = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}} initialRouteName="AuthLoading">
   <Stack.Screen name="AuthLoading" component={AuthLoading} />
   <Stack.Screen name="GiftDetails" component={GiftDetailsScreen} />
   <Stack.Screen name="Login" component={Login} />
   <Stack.Screen name="Registration" component={Registration} />
   <Stack.Screen name="Invoice" component={InvoiceScreen} />
    <Stack.Screen name="Request" component={GiftOrderCard} />
     <Stack.Screen name="Notifications" component={NotificationsScreen} />
    <Stack.Screen name="MyBottomTab" component={MyBottomTab} />
    <Stack.Screen name="RazorpayPayment" component={RazorpayPaymentButton} />
<Stack.Screen name="BillingAddress" component={BillingAddressScreen} />
<Stack.Screen name="ShippingAddress" component={ShippingAddressScreen} />
<Stack.Screen name="KeyChain" component={KeyChains} />
<Stack.Screen name="resin" component={Resin} />




    <Stack.Screen name="OrderHistory" component={OrderHistory} />
    <Stack.Screen name="ProductsScreen" component={ProductsScreen} />
    <Stack.Screen name="ProductDetails" component={ProductDetails} />
   
  </Stack.Navigator>
  );
};

export default MainStack;

const styles = StyleSheet.create({});
