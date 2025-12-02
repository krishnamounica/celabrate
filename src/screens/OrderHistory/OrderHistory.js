// OrderHistoryScreen.js
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

const OrderHistoryScreen = () => {
  const navigation = useNavigation();
  const [orderData, setOrderData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const normalizeAndEnsureUniqueKeys = useCallback((arr = []) => {
    const normalized = (arr || []).map((o, i) => ({
      ...o,
      __key: (o.id ?? o._id ?? o.razorpay_payment_id ?? `order-fallback-${i}`).toString(),
    }));

    const seen = new Map();
    const duplicates = [];
    normalized.forEach((o, idx) => {
      const base = o.__key;
      if (!seen.has(base)) seen.set(base, [idx]);
      else {
        seen.get(base).push(idx);
        duplicates.push(base);
      }
    });

    if (duplicates.length > 0) {
      const uniq = Array.from(new Set(duplicates));
      console.warn('Duplicate order keys detected from backend:', uniq);
      console.warn(
        'Duplicate key -> indices map:',
        Object.fromEntries(Array.from(seen.entries()).filter(([, arr]) => arr.length > 1))
      );
    }

    const counts = {};
    return normalized.map((o, idx) => {
      const base = o.__key;
      counts[base] = (counts[base] || 0) + 1;
      if (counts[base] === 1) return o;
      return { ...o, __key: `${base}-${counts[base]}-${idx}` };
    });
  }, []);

  const extractOrdersFromResponse = (respData) => {
    // Try several shapes to extract an array of orders
    if (!respData) return [];
    if (Array.isArray(respData)) return respData;
    // If it's a string that looks like JSON, try parse
    if (typeof respData === 'string') {
      try {
        const parsed = JSON.parse(respData);
        return extractOrdersFromResponse(parsed);
      } catch (e) {
        // not parseable, give empty
        return [];
      }
    }
    // if it's an object, look for common fields
    if (typeof respData === 'object') {
      if (Array.isArray(respData.orders)) return respData.orders;
      if (Array.isArray(respData.data)) return respData.data;
      if (Array.isArray(respData.result)) return respData.result;
      // Sometimes API returns { success: true, payload: [...] }
      const maybeArray = Object.values(respData).find((v) => Array.isArray(v));
      if (maybeArray) return maybeArray;
    }
    return [];
  };

  const fetchBillingAddresses = useCallback(async () => {
    setLoading(true);
    try {
      const userDataString = await AsyncStorage.getItem('userData');
      const userData = userDataString ? JSON.parse(userDataString) : null;
      const token = userData?.token;
      const userIdRaw = userData?.id ?? userData?._id ?? userData?.userId ?? userData?.uid;

      const hasUserId = userIdRaw !== undefined && userIdRaw !== null && userIdRaw !== '';
      console.log('Resolved userId (debug):', userIdRaw, 'hasUserId:', hasUserId);

      if (!hasUserId || !token) {
        console.warn('No userId or token found in AsyncStorage (userData).');
        Alert.alert('Not signed in', 'Please sign in to view your orders.');
        setOrderData([]);
        setLoading(false);
        return;
      }

      // Coerce to string for URL (keeps 0 as "0")
      const userId = String(userIdRaw);

      // Make the API call and log response shape for debugging
      const url = `https://wishandsurprise.com/backend/get_orders.php?userId=${encodeURIComponent(userId)}`;
      console.log('Fetching orders from:', url);

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 15000,
      });

      // Helpful debug logs — remove in production
      console.log('API status:', response.status);
      // Log a trimmed version of response.data to avoid huge logs
      try {
        const preview = typeof response.data === 'string'
          ? response.data.slice(0, 1000)
          : JSON.stringify(response.data).slice(0, 1000);
        console.log('Response data preview (first 1000 chars):', preview);
      } catch (e) {
        console.log('Could not stringify response.data for preview', e);
      }

      // Attempt to extract orders from response in several ways
      const payments = extractOrdersFromResponse(response.data);
      if (!payments || payments.length === 0) {
        console.warn('API returned no orders or unrecognized shape. Full response:', response.data);
      }

      // Sort and normalize
      payments.sort((a, b) => {
        const ta = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tb = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
        return tb - ta;
      });

      const normalized = normalizeAndEnsureUniqueKeys(payments);
      setOrderData(normalized);
    } catch (error) {
      console.error('Failed to fetch orders:', error?.response?.data ?? error?.message ?? error);
      setOrderData([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [normalizeAndEnsureUniqueKeys]);

  useEffect(() => {
    fetchBillingAddresses();
  }, [fetchBillingAddresses]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchBillingAddresses();
  }, [fetchBillingAddresses]);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={() => navigation.navigate('OrderDetails', { orderId: item.__key })}
    >
      <Text style={styles.label}>Product:</Text>
      <Text style={styles.value}>{item.productName || item.product_name || item.name || 'N/A'}</Text>

      <Text style={styles.label}>Amount Paid:</Text>
      <Text style={styles.value}>₹{item.amount ?? item.total ?? '0'}</Text>

      <Text style={styles.label}>Tax:</Text>
      <Text style={styles.value}>₹{item.tax ?? 0}</Text>

      <Text style={styles.label}>Payment Mode:</Text>
      <Text style={styles.value}>{item.payment_mode ?? item.paymentMode ?? 'N/A'}</Text>

      <Text style={styles.label}>Payment ID:</Text>
      <Text style={styles.value}>{item.razorpay_payment_id ?? item.payment_id ?? item.__key}</Text>

      <Text style={styles.label}>Order Date:</Text>
      <Text style={styles.value}>
        {item.createdAt ? new Date(item.createdAt).toLocaleString() : '—'}
      </Text>

      {item.address ? (
        <>
          <Text style={styles.label}>Shipping Address:</Text>
          <Text style={styles.value}>{item.address}</Text>
        </>
      ) : null}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={[styles.header, { color: ORANGE }]}>My Orders</Text>

      {loading && orderData.length === 0 ? (
        <ActivityIndicator size="large" color={ORANGE} />
      ) : orderData.length === 0 ? (
        <Text style={styles.emptyText}>No orders found.</Text>
      ) : (
        <FlatList
          data={orderData}
          keyExtractor={(item, index) => item.__key ?? (item.id ? String(item.id) : `order-${index}`)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          initialNumToRender={8}
          maxToRenderPerBatch={10}
          windowSize={10}
        />
      )}
    </View>
  );
};

export default OrderHistoryScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' },
  list: { paddingBottom: 20 },
  card: { padding: 14, backgroundColor: '#f7f7f7', borderRadius: 10, marginBottom: 14, elevation: 2 },
  label: { fontWeight: '600', color: '#444' },
  value: { marginBottom: 8, color: '#333' },
  emptyText: { textAlign: 'center', fontSize: 16, marginTop: 20, color: '#777' },
});
