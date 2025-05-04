import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Linking } from 'react-native';


const GiftOrderCard = () => {
  const [orders, setOrders] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleShare = (order) => {
    // const imageUrl = order.imageUrl || 'https://yourdomain.com/images/default-product.jpg';
    const shareLink = order.sharablelink || `http://Wishandsurprise.com/gift/${order._id}`;
    
    const message = `🎁 Gift Idea for ${order.name}'s ${order.occasion}!\n\n` +
      `🛍️ Product: ${order.productName}\n💰 Price: ₹${order.productPrice}\n\n` +
      `👉 View More: ${shareLink}\n` 
    //   `🖼️ Preview: ${imageUrl}`;
  
    const url = `whatsapp://send?text=${encodeURIComponent(message)}`;
  
    Linking.canOpenURL(url)
      .then((supported) => {
        if (!supported) {
          Alert.alert('Error', 'WhatsApp is not installed on your device');
        } else {
          return Linking.openURL(url);
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

      const response = await axios.get('https://easyshop-7095.onrender.com/api/v1/giftrequests', {
        params: { userName: userId },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log(response.data, '=== API Response ===');

      if (response.data?.length > 0) {
        setOrders(response.data);
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

  useEffect(() => {
    fetchOrders();
  }, []);

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
    disabled={order.payment}
  >
    <Icon name="cash-refund" size={18} color="#fff" />
    <Text style={styles.buttonText}>Pay</Text>
  </TouchableOpacity>
</View>

{/* Add note explaining why buttons are disabled */}
{!order.sharable && (
  <Text style={styles.disabledNote}>Sharing is not allowed for this order.</Text>
)}
{order.payment && (
  <Text style={styles.disabledNote}>This order has already been paid for.</Text>
)}


        </View>
      ))}
    </ScrollView>
  );
};

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
  }
  
  
});

export default GiftOrderCard;
