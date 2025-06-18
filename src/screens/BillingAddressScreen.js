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
  const [isProcessing, setIsProcessing] = useState(false);

const handleProceed = async () => {
  if (isProcessing) return;

  const { fullName, street, city } = address;
  if (fullName && street && city) {
    setIsProcessing(true);
    navigation.navigate('RazorpayPayment', {
      product,
      billingAddress: address,
    });
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
