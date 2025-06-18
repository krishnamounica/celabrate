import React, { useEffect } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RazorpayCheckout from 'react-native-razorpay';
import { useNavigation, useRoute } from '@react-navigation/native';

const RazorpayPaymentScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { product, billingAddress } = route.params;

  useEffect(() => {
    initiatePayment();
  }, []);

  const initiatePayment = async () => {
    const amountInPaise = product.price * 100;
    const userDataString = await AsyncStorage.getItem('userData');
    const userData = JSON.parse(userDataString);
    const userId = userData.id;
    let razorpayResponse = null;

    try {
      const orderRes = await fetch('https://easyshop-7095.onrender.com/api/v1/users/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amountInPaise,
          currency: 'INR',
        }),
      });

      const orderData = await orderRes.json();

      const options = {
        description: 'Purchase Product',
        currency: 'INR',
        key: 'rzp_test_Zr4AoaaUCDwWjy',
        amount: amountInPaise,
        name: 'Wish and Surprise',
        order_id: orderData.orderId,
        prefill: {
          email: userData.email,
          contact: userData.phone,
          name: userData.name,
        },
        theme: { color: '#F37254' },
      };

      RazorpayCheckout.open(options)
        .then(async (data) => {
          razorpayResponse = data;

          const saveRes = await fetch('https://easyshop-7095.onrender.com/api/v1/users/save-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_payment_id: data.razorpay_payment_id,
              razorpay_order_id: data.razorpay_order_id,
              razorpay_signature: data.razorpay_signature,
              productId: product.id,
              amount: amountInPaise / 100,
              userId: userId,
            }),
          });

          const result = await saveRes.json();

          const paymentDetails = {
            amount: amountInPaise / 100,
            paymentId: result.paymentId || data.razorpay_payment_id,
            paymentMode: result.payment_mode || 'Razorpay',
            createdAt: result.createdAt || new Date().toISOString(),
          };

          navigation.replace('Invoice', {
            product,
            billingAddress,
            paymentDetails,
          });
        })
        .catch(() => {
          Alert.alert('Payment Cancelled');
          navigation.goBack();
        });
    } catch (error) {
      console.error('Payment Error:', error);
      Alert.alert('Payment Error', 'Please try again later.');
    }
  };

  return null; // No UI needed
};

export default RazorpayPaymentScreen;
