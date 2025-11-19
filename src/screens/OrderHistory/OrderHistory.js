import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const OrderHistoryScreen = () => {
  const [orderData, setOrderData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBillingAddresses = async () => {
    try {
      const userDataString = await AsyncStorage.getItem('userData');
      const userData = JSON.parse(userDataString);
      const token = userData.token;
      const userId = userData.id || userData._id;

      const response = await axios.get(
        `https://wishandsurprise.com/backend/get_orders.php?userId=${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      let payments = Array.isArray(response.data) ? response.data : [];

      // Sort by createdAt (latest first)
      payments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setOrderData(payments);
    } catch (error) {
      console.error(
        'Failed to fetch orders:',
        error.response?.data || error.message
      );
      setOrderData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBillingAddresses();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.label}>Product:</Text>
      <Text style={styles.value}>{item.productName || 'N/A'}</Text>

      <Text style={styles.label}>Amount Paid:</Text>
      <Text style={styles.value}>₹{item.amount}</Text>

      <Text style={styles.label}>Tax:</Text>
      <Text style={styles.value}>₹{item.tax || 0}</Text>

      <Text style={styles.label}>Payment Mode:</Text>
      <Text style={styles.value}>{item.payment_mode}</Text>

      <Text style={styles.label}>Payment ID:</Text>
      <Text style={styles.value}>{item.razorpay_payment_id}</Text>

      <Text style={styles.label}>Order Date:</Text>
      <Text style={styles.value}>
        {new Date(item.createdAt).toLocaleString()}
      </Text>

      {item.address ? (
        <>
          <Text style={styles.label}>Shipping Address:</Text>
          <Text style={styles.value}>{item.address}</Text>
        </>
      ) : null}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Orders</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#000" />
      ) : orderData.length === 0 ? (
        <Text style={styles.emptyText}>No orders found.</Text>
      ) : (
        <FlatList
          data={orderData}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
};

export default OrderHistoryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  list: {
    paddingBottom: 20,
  },
  card: {
    padding: 14,
    backgroundColor: '#f7f7f7',
    borderRadius: 10,
    marginBottom: 14,
    elevation: 2,
  },
  label: {
    fontWeight: '600',
    color: '#444',
  },
  value: {
    marginBottom: 8,
    color: '#333',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 20,
    color: '#777',
  },
});
