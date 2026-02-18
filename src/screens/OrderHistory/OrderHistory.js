// src/screens/OrderHistoryScreen.js
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

const ORANGE = '#ff7a00';

export default function OrderHistoryScreen() {
  const navigation = useNavigation();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  /* ---------------- FETCH ORDERS ---------------- */
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);

      const stored = await AsyncStorage.getItem('userData');
      const user = JSON.parse(stored || '{}');

      if (!user?.id) {
        Alert.alert('Login required', 'Please login to view orders');
        setOrders([]);
        return;
      }

      const res = await axios.get(
        `https://wishandsurprise.com/backend/get_orders.php?user_id=${user.id}`
      );
console.log(res.data);
      if (!res.data?.success) {
        throw new Error(res.data?.message || 'Failed to load orders');
      }

      setOrders(res.data.orders || []);
    } catch (err) {
      console.error('Order fetch error:', err.message);
      setOrders([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  /* ---------------- RENDER ITEM ---------------- */
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={() =>
        navigation.navigate('OrderDetails', {
          orderId: item.id,
        })
      }
    >
      <Text style={styles.row}>
        <Text style={styles.label}>Order ID: </Text>#{item.id}
      </Text>

      <Text style={styles.row}>
        <Text style={styles.label}>Total Paid: </Text>
        ₹{item.total_amount}
      </Text>

      <Text style={styles.row}>
        <Text style={styles.label}>Payment: </Text>
        {item.payment_method} ({item.payment_status})
      </Text>

      <Text style={styles.row}>
        <Text style={styles.label}>Payment ID: </Text>
        {item.payment_id}
      </Text>

      <Text style={styles.row}>
        <Text style={styles.label}>Date: </Text>
        {new Date(item.created_at).toLocaleString()}
      </Text>
    </TouchableOpacity>
  );

  /* ---------------- UI ---------------- */
  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Orders</Text>

      {loading ? (
        <ActivityIndicator size="large" color={ORANGE} />
      ) : orders.length === 0 ? (
        <Text style={styles.empty}>No orders found.</Text>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={item => String(item.id)}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: ORANGE,
    textAlign: 'center',
    marginBottom: 14,
  },
  card: {
    backgroundColor: '#f9f9f9',
    padding: 14,
    borderRadius: 12,
    marginBottom: 14,
    elevation: 3,
  },
  row: {
    marginBottom: 6,
    color: '#333',
  },
  label: {
    fontWeight: '700',
    color: '#555',
  },
  empty: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    color: '#777',
  },
});
