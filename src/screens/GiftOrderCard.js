import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Linking } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import RazorpayCheckout from 'react-native-razorpay';
import { Modal, TextInput } from 'react-native';
import PaymentSuccessModal from './Search/PaymentSuccessModal';
import { useNavigation } from "@react-navigation/native";
import withSplashScreen from '../navigation/withSplashScreen';

const GiftOrderCard = () => {
  const [orders, setOrders] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDetails, setPaymentDetails] = useState({
    amount: 0,
    paymentId: "",
    paymentMode: "",
    createdAt: "",
  });
const [showModal, setShowModal] = useState(false);
  const handlePay = (order) => {
    setSelectedOrder(order);
    setPaymentAmount('');
    setModalVisible(true);

  };
   const navigation = useNavigation();
  const initiateRazorpay = async (id) => {
    if (
      !paymentAmount ||
      isNaN(paymentAmount) ||
      parseFloat(paymentAmount) <= 0 ) {
      Alert.alert('Invalid Amount', 'Please enter a valid payment amount.');
      return;
    }
    if(selectedOrder.remainingAmount < paymentAmount) {
      Alert.alert(`Please enter a valid payment amount.${selectedOrder.remainingAmount}`);
      return;
    }
    try {
      const amountInPaise = parseFloat(paymentAmount) * 100;
      const userDataString = await AsyncStorage.getItem('userData');
      const userData = JSON.parse(userDataString);
      const userId = userData.id;
  
      const orderResponse = await fetch('https://wishandsurprise.com/backend/create-order.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amountInPaise,
          currency: 'INR',
        }),
      });
      const orderData = await orderResponse.json();
      if (!orderData.orderId) {
        throw new Error('Order ID not returned from backend');
      }
      const options = {
        description: `Gift Payment for ${selectedOrder.productName}`,
        currency: 'INR',
        key: 'rzp_live_yOvVxv8Djhx8ds',
        amount: amountInPaise,
        name: 'Wish and Surprise',
        order_id: orderData.orderId,
        theme: { color: '#2980b9' },
      };
      RazorpayCheckout.open(options)
        .then(async (data) => {
          // Step 3: Save payment to backend
      
          const response = await fetch('https://wishandsurprise.com/backend/save-payment.php', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${userData.token}`
  },
  body: JSON.stringify({
    razorpay_payment_id: data.razorpay_payment_id,
    razorpay_order_id: data.razorpay_order_id,
    razorpay_signature: data.razorpay_signature,
    productId: selectedOrder.id,
    amount: amountInPaise,
    userId: userId
  }),
});
const text = await response.text();
try {
  const result = JSON.parse(text);

  if (result.success) {
  } else {
    alert("Something went wrong: " + result.message);
  }
} catch (e) {
  alert("Something went wrong. Invalid response from server.");
}
  await fetch(`https://wishandsurprise.com/backend/update-gift.php?id=${selectedOrder.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userData.token}`,
    },
    body: JSON.stringify({
      remainingAmount: selectedOrder.remainingAmount - parseFloat(paymentAmount),
      noOfPayments: (selectedOrder.noOfPayments || 0) + 1,
      paymentAmount: (selectedOrder.paymentAmount) + parseFloat(paymentAmount),
    }),
  });

          setModalVisible(false);
          setShowModal(true);
          setPaymentDetails({
            amount: parseFloat(paymentAmount),
            paymentId:  data.razorpay_payment_id,
            paymentMode: 'Netbanking',
            createdAt:  new Date().toISOString(),
          });
  
          fetchOrders();
        })
        .catch((error) => {
          console.error('Razorpay Payment Failed:', error);
          Alert.alert('Payment Failed', error.description || 'Something went wrong');
        });
  
    } catch (err) {
      console.error('Error initiating Razorpay:', err);
      Alert.alert('Error', 'Something went wrong while processing your payment.');
    }
  };
  const closeModal = () => {
    setShowModal(false); 
    // navigation.navigate('MyBottomTab')
  };
  const handleShare = (order) => {
    const shareLink = order.sharablelink || `https://wishandsurprise.com/gift/${order.id}`;
    const message = `🎁 Gift Idea for ${order.name}'s ${order.occasion}!\n\n` +
      `🛍️ Product: ${order.productName}\n💰 Price: ₹${order.productPrice}\n\n` +
      `👉 View More: ${shareLink}`;
    const url = `whatsapp://send?text=${encodeURIComponent(message)}`;
    Linking.canOpenURL(url)
      .then((supported) => {
        if (!supported) {
          Alert.alert('Error', 'WhatsApp is not installed on your device');
        } else {
          Linking.openURL(url);
        }
      })
      .catch((err) => console.error('An error occurred', err));
  };

  const fetchOrders = async () => {
   
    try {
      const userDataString = await AsyncStorage.getItem('userData');
      const userData = JSON.parse(userDataString);
      const userId = userData.id;
      const token = userData.token;
      const response = await axios.post(`https://wishandsurprise.com/backend/get_user_requests.php?userId=${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data?.length > 0) {
        const sortedData = response.data.sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        );
        setOrders(sortedData);
        
      } else {
        Alert.alert('No orders found');
      }
    } catch (error) {
      console.error('Error fetching gift order:', error.message);
      Alert.alert('Failed to load gift order');
    } finally {
      setLoading(false);
    }
  };
  useFocusEffect(
    React.useCallback(() => {
      fetchOrders();
    }, [])
  );
  if (loading) {
    return <ActivityIndicator style={{ marginTop: 20 }} size="large" color="#2980b9" />;
  }
  if (!orders || orders.length === 0) {
    return <Text style={{ textAlign: 'center', marginTop: 20 }}>No order data available</Text>;
  }
  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
      {orders.map((order) => (
        <View key={order._id} style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.name}>{order.name}</Text>
            <Text style={styles.occasion}>
              <Icon name="calendar-star" size={16} color="#f39c12" /> {order.occasion} ({new Date(order.date).toDateString()})
            </Text>
          </View>
          <View style={styles.row}>
            <Icon name="gift" size={20} color="#3498db" />
            <Text style={styles.text}>{order.productName}</Text>
          </View>
          <View style={styles.row}>
            <Icon name="currency-inr" size={20} color="#2ecc71" />
            <Text style={styles.text}>{order.productPrice}</Text>
          </View>
          <View style={styles.row}>
            <Icon name="home-map-marker" size={20} color="#9b59b6" />
            <Text style={styles.text}>
              {order.flatNumber}, {order.building}, {order.landmark}, {order.district}, {order.state}, {order.pincode}
            </Text>
          </View>
          <View style={styles.row}>
            <Icon name="credit-card-check-outline" size={20} color="#16a085" />
            <Text style={styles.text}>
              Payment: {order.payment ? 'Paid' : 'Pending'} ({order.paymentAmount}/{order.totalAmount})
              no of payments: {order.noOfPayments}
            </Text>
          </View>
          <View style={styles.row}>
            <Icon name="progress-clock" size={20} color="#e67e22" />
            <Text style={styles.text}>Status: {order.status}</Text>
          </View>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, !order.sharable && styles.disabledButton]}
              disabled={!order.sharable}
              onPress={() => order.sharable && handleShare(order)}
            >
              <Icon name="share-variant" size={18} color="#fff" />
              <Text style={styles.buttonText}>Share</Text>
            </TouchableOpacity>
            <TouchableOpacity
  style={[styles.button, !order.payment && styles.disabledButton]}
  disabled={!order.payment}
  onPress={() => {
    if (order.payment) {
      handlePay(order);
    }
  }}
>

              <Icon name="cash-refund" size={18} color="#fff" />
              <Text style={styles.buttonText}>Pay</Text>
            </TouchableOpacity>
            <TouchableOpacity
    style={styles.button}
    onPress={() => navigation.navigate('GiftDetails', { id: order.id })}
  >
    <Icon name="information-outline" size={18} color="#fff" />
    <Text style={styles.buttonText}>Details</Text>
  </TouchableOpacity>
          </View>
          {!order.sharable && (
            <Text style={styles.disabledNote}>Sharing is not allowed for this request.</Text>
          )}
          {!order.payment &&  (
            <Text style={styles.disabledNote}>Payment is not allowed for this request.</Text>
          )}
        </View>
      ))}
      
          <PaymentSuccessModal
  isOpen={ showModal}
  amount={paymentDetails.amount}
  paymentId={paymentDetails.paymentId}
  paymentMode={paymentDetails.paymentMode}
  createdAt={paymentDetails.createdAt}
  onClose={() => closeModal()}
/>

      {/* Razorpay Modal */}
      {selectedOrder && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Enter Payment Amount</Text>
              <TextInput
                placeholder="Enter amount"
                keyboardType="numeric"
                value={paymentAmount}
                onChangeText={setPaymentAmount}
                style={styles.input}
              />
              <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalButton} onPress={() => initiateRazorpay(selectedOrder.id)}>
  <Text style={styles.modalButtonText}>Pay</Text>
</TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: '#e74c3c' }]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </ScrollView>
  );
};

// ... styles stay the same


const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 16,
    margin: 12,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
  },
  header: {
    marginBottom: 10,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
  },
  occasion: {
    fontSize: 14,
    color: '#888',
    marginTop: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  text: {
    marginLeft: 8,
    fontSize: 14,
    flex: 1,
    flexWrap: 'wrap',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#2980b9',
    padding: 8,
    marginLeft: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    marginLeft: 4,
  },
  disabledButton: {
    backgroundColor: '#bdc3c7', // greyed-out look
  },
  disabledNote: {
    color: '#e74c3c',  // Red color for note
    fontSize: 12,
    marginTop: 6,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    backgroundColor: '#2980b9',
    padding: 12,
    borderRadius: 6,
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  modalButtonText: {
    color: '#fff',
  fontWeight: '600',
  },
});
export default withSplashScreen(GiftOrderCard);
