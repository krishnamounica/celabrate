import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RazorpayCheckout from 'react-native-razorpay';
import { useNavigation } from '@react-navigation/native';

const RazorpayPaymentButton = ({ route }) => {
  const { product, billingAddress } = route.params;
  const navigation = useNavigation();

  // Define payment breakdown
  const productPrice = Number(product.price);
  const gst = parseFloat((productPrice * 0.18).toFixed(2)); // 18% GST
  const deliveryCharges = 50;
  const txnCharges = 10;
  const totalAmount = Number((productPrice + gst + deliveryCharges + txnCharges).toFixed(2));
  const amountInPaise = totalAmount * 100;

  const openRazorpay = async () => {
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
                amount: totalAmount,
                userId: userId,
                billingAddress: billingAddress,
                tax: gst,
                deliveryCharges: deliveryCharges,
                transactionCharges: txnCharges,
              }),
            }
          );
        })
        .then((response) => response.json())
        .then((result) => {
          const paymentDetails = {
            amount: totalAmount,
            paymentId: result.paymentId || razorpayResponse.razorpay_payment_id,
            paymentMode: result.payment_mode || 'Razorpay',
            createdAt: result.createdAt || new Date().toISOString(),
            tax: gst,
            deliveryCharges,
            transactionCharges: txnCharges,
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
    <ScrollView contentContainerStyle={styles.container}>
      {/* Product Card */}
      <View style={styles.card}>
        {product.image && (
          <Image source={{ uri: product.image }} style={styles.productImage} />
        )}
        <Text style={styles.title}>{product.name}</Text>
        <Text style={styles.price}>₹ {productPrice}</Text>
        {product.description && (
          <Text style={styles.description}>{product.description}</Text>
        )}
      </View>

      {/* Billing Address Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Billing Address</Text>
        <Text>{billingAddress.fullName}</Text>
        <Text>{billingAddress.street}</Text>
        <Text>{billingAddress.city}, {billingAddress.state}</Text>
        <Text>{billingAddress.postalCode}, {billingAddress.country}</Text>
      </View>

      {/* Payment Details Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Payment Summary</Text>
        <View style={styles.row}><Text>Product Price:</Text><Text>₹ {productPrice}</Text></View>
        <View style={styles.row}><Text>GST (18%):</Text><Text>₹ {gst}</Text></View>
        <View style={styles.row}><Text>Delivery Charges:</Text><Text>₹ {deliveryCharges}</Text></View>
        <View style={styles.row}><Text>Transaction Charges:</Text><Text>₹ {txnCharges}</Text></View>
        <View style={[styles.row, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total Payable:</Text>
          <Text style={styles.totalAmount}>₹ {totalAmount}</Text>
        </View>
      </View>

      {/* Proceed Button */}
      <TouchableOpacity style={styles.button} onPress={openRazorpay}>
        <Text style={styles.buttonText}>Pay ₹{totalAmount}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default RazorpayPaymentButton;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
  },
  card: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
  },
  productImage: {
    height: 150,
    width: '100%',
    borderRadius: 8,
    marginBottom: 10,
    resizeMode: 'cover',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  price: {
    fontSize: 16,
    color: '#28a745',
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    color: '#555',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  totalRow: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    paddingTop: 8,
  },
  totalLabel: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  totalAmount: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#d9534f',
  },
  button: {
    backgroundColor: '#28a745',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
