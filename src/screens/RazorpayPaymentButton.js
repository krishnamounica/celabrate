import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RazorpayCheckout from 'react-native-razorpay';
import { useNavigation } from '@react-navigation/native';

const RazorpayPaymentButton = ({ route }) => {
  const { product, billingAddress } = route.params;
  const navigation = useNavigation();

  const openRazorpay = async () => {
    const amountInPaise = product.price * 100;
    const userDataString = await AsyncStorage.getItem('userData');
    const userData = JSON.parse(userDataString);
    const userId = userData.id;
    let razorpayResponse = null;

    try {
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

      RazorpayCheckout.open(options)
        .then((data) => {
          razorpayResponse = data;
          return fetch(
            'https://easyshop-7095.onrender.com/api/v1/users/save-payment',
            {
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
            }
          );
        })
        .then((response) => response.json())
        .then((result) => {
          const paymentDetails = {
            amount: amountInPaise / 100,
            paymentId: result.paymentId || razorpayResponse.razorpay_payment_id,
            paymentMode: result.payment_mode || 'Razorpay',
            createdAt: result.createdAt || new Date().toISOString(),
          };

          navigation.navigate('Invoice', {
            paymentDetails,
            product,
            billingAddress,
          });
        })
        .catch((error) => {
          console.error('Error during payment or saving payment:', error);
        });
    } catch (err) {
      console.error('Error initiating Razorpay payment:', err);
    }
  };

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={openRazorpay} // ✅ this triggers Razorpay payment
    >
      <Text style={styles.buttonText}>Proceed to Payment</Text>
    </TouchableOpacity>
  );
};

export default RazorpayPaymentButton;

const styles = StyleSheet.create({
  button: {
    padding: 10,
    backgroundColor: 'green',
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
