import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import RazorpayCheckout from 'react-native-razorpay';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const BillingAddressScreen = ({ route }) => {
  const { product } = route.params;
  const navigation = useNavigation();

  const [address, setAddress] = useState({
    fullName: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
  });

 const openRazorpay = async () => {
  const amountInPaise = product.price * 100;

  try {
    // Get user data from AsyncStorage
    const userDataString = await AsyncStorage.getItem('userData');
    const userData = JSON.parse(userDataString);
    const userId = userData.id;

    // Step 1: Create Razorpay Order
    const orderResponse = await fetch(
      'https://easyshop-7095.onrender.com/api/v1/users/create-order',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amountInPaise,
          currency: 'INR',
        }),
      }
    );

    const orderData = await orderResponse.json();
    if (!orderData.orderId) {
      Alert.alert('Error', 'Failed to create payment order');
      return;
    }

    // Step 2: Open Razorpay Checkout
    const options = {
      description: 'Purchase Product',
      currency: 'INR',
      key: 'rzp_test_Zr4AoaaUCDwWjy',
      amount: amountInPaise,
      name: 'Wish and Surprise',
      order_id: orderData.orderId,
      prefill: {
        email: userData.email || 'test@example.com',
        contact: userData.phone || '9876543210',
        name: userData.name || 'Test User',
      },
      theme: { color: '#F37254' },
    };

    const razorpayResponse = await RazorpayCheckout.open(options);

    // Step 3: Save payment to backend
    const savePaymentRes = await fetch(
      'https://easyshop-7095.onrender.com/api/v1/users/save-payment',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpay_payment_id: razorpayResponse.razorpay_payment_id,
          razorpay_order_id: razorpayResponse.razorpay_order_id,
          razorpay_signature: razorpayResponse.razorpay_signature,
          productId: product.id,
          amount: amountInPaise / 100,
          userId: userId,
          address: address,
        }),
      }
    );
console.log(JSON.stringify({
          razorpay_payment_id: razorpayResponse.razorpay_payment_id,
          razorpay_order_id: razorpayResponse.razorpay_order_id,
          razorpay_signature: razorpayResponse.razorpay_signature,
          productId: product.id,
          amount: amountInPaise / 100,
          userId: userId,
          address: address,
        }), "address======");
    const result = await savePaymentRes.json();

    // Step 4: Navigate to Invoice screen
    const paymentDetails = {
      amount: amountInPaise / 100,
      paymentId: result.paymentId || razorpayResponse.razorpay_payment_id,
      paymentMode: result.payment_mode || 'Razorpay',
      createdAt: result.createdAt || new Date().toISOString(),
    };

    navigation.navigate('Invoice', {
      paymentDetails,
      product,
      billingAddress: address,
    });
  } catch (error) {
    console.error('Payment Error:', error);
    Alert.alert('Payment Failed', error.description || 'Something went wrong during payment.');
  }
};


  const [isProcessing, setIsProcessing] = useState(false);

const handleProceed = async () => {
  if (isProcessing) return;

  const { fullName, street, city } = address;
  if (fullName && street && city) {
    setIsProcessing(true);
    await openRazorpay();
    setIsProcessing(false);
  } else {
    Alert.alert('Validation', 'Please fill all required fields');
  }
};


  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Billing Address</Text>

      <TextInput placeholder="Full Name" style={styles.input} value={address.fullName} onChangeText={(text) => setAddress({ ...address, fullName: text })} />
      <TextInput placeholder="Street Address" style={styles.input} value={address.street} onChangeText={(text) => setAddress({ ...address, street: text })} />
      <TextInput placeholder="City" style={styles.input} value={address.city} onChangeText={(text) => setAddress({ ...address, city: text })} />
      <TextInput placeholder="State" style={styles.input} value={address.state} onChangeText={(text) => setAddress({ ...address, state: text })} />
      <TextInput placeholder="Postal Code" keyboardType="numeric" style={styles.input} value={address.postalCode} onChangeText={(text) => setAddress({ ...address, postalCode: text })} />
      <TextInput placeholder="Country" style={styles.input} value={address.country} onChangeText={(text) => setAddress({ ...address, country: text })} />

      <TouchableOpacity style={styles.button} onPress={handleProceed}>
        <Text style={styles.buttonText}>Proceed to Payment</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default BillingAddressScreen;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    marginVertical: 10,
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 48,
  },
  button: {
    backgroundColor: '#28a745',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
