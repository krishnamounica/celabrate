import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import axios from 'axios';

const BRAND = '#ff7a00';

export default function OrderDetailsScreen({ route }) {
  const { orderId } = route.params;

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetchDetails();
  }, []);

  const fetchDetails = async () => {
    try {
      const res = await axios.get(
        `https://wishandsurprise.com/backend/get_order_details.php?order_id=${orderId}`
      );

      if (res.data.success) {
        setOrder(res.data.order);
        setItems(res.data.items);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={BRAND} />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.center}>
        <Text>Order not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Order Details</Text>

      <Text style={styles.label}>Order ID:</Text>
      <Text>{order.id}</Text>

      <Text style={styles.label}>Payment Status:</Text>
      <Text>{order.payment_status}</Text>

      <Text style={styles.label}>Payment Method:</Text>
      <Text>{order.payment_method}</Text>

      <Text style={styles.label}>Total Amount:</Text>
      <Text style={styles.total}>₹ {order.total_amount}</Text>

      <View style={styles.divider} />

      {items.map(item => (
        <View key={item.id} style={styles.card}>
          <Text style={styles.product}>{item.product_name}</Text>
          <Text>Type: {item.product_type}</Text>
          <Text>Qty: {item.quantity}</Text>
          <Text>Line Total: ₹ {item.line_total}</Text>

          {item.customizations.length > 0 && (
            <View style={styles.customBox}>
              <Text style={styles.customTitle}>Customizations</Text>
              {item.customizations.map((c, i) => (
                <Text key={i}>
                  {c.field_label}: {c.text_value}
                </Text>
              ))}
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  label: { fontWeight: '700', marginTop: 8 },
  total: { fontSize: 18, fontWeight: 'bold', color: BRAND },
  divider: { height: 1, backgroundColor: '#ddd', marginVertical: 16 },
  card: {
    backgroundColor: '#f9f9f9',
    padding: 14,
    borderRadius: 10,
    marginBottom: 14,
  },
  product: { fontWeight: 'bold', fontSize: 15 },
  customBox: { marginTop: 8 },
  customTitle: { fontWeight: '700' },
});
