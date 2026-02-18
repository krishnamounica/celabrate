import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RazorpayCheckout from 'react-native-razorpay';
import { useNavigation } from '@react-navigation/native';

const BRAND = '#FF9F1C';

export default function RazorpayPaymentButton({ route }) {
  const navigation = useNavigation();
  const checkout = route?.params?.checkout;

  if (!checkout) {
    return (
      <View style={styles.center}>
        <Text style={{ color: 'red' }}>Checkout data missing</Text>
      </View>
    );
  }

  const { billingAddress = '', type = 'CART' } = checkout;

  const [summary, setSummary] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPaying, setIsPaying] = useState(false);

  /* ================= FETCH SUMMARY ================= */
  useEffect(() => {
  const initCheckout = async () => {
    try {
      // ---------------- BUY NOW ----------------
      if (checkout.type === 'BUY_NOW') {
        const baseAmount = checkout.items.reduce(
          (sum, i) => sum + Number(i.total_price),
          0
        );

        const gst = 0;       // adjust if needed
        const delivery = 0; // adjust if needed

        setItems(checkout.items);
        setSummary({
          base_amount: baseAmount,
          discount: 0,
          gst,
          delivery,
          total_payable: baseAmount + gst + delivery,
        });

        setLoading(false);
        return;
      }

      // ---------------- CART ----------------
      const stored = await AsyncStorage.getItem('userData');
      const parsed = JSON.parse(stored || '{}');
      const username = parsed?.user || parsed?.email;

      if (!username) {
        Alert.alert('Error', 'User not logged in');
        setLoading(false);
        return;
      }

      const res = await fetch(
        'https://wishandsurprise.com/backend/calculate_checkout.php',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username,
            coupon_discount: 0,
          }),
        }
      );

      const data = await res.json();

      if (!data.success) {
        Alert.alert('Error', data.message || 'Calculation failed');
        setLoading(false);
        return;
      }

      setSummary(data.data.summary);
      setItems(data.data.items || []);
    } catch (e) {
      console.error('Summary error:', e);
      Alert.alert('Error', 'Failed to load order summary');
    } finally {
      setLoading(false);
    }
  };

  initCheckout();
}, []);


  /* ================= PAY ================= */
  const openRazorpay = async () => {
    if (isPaying || !summary) return;
    setIsPaying(true);

    try {
      const stored = await AsyncStorage.getItem('userData');
      const user = JSON.parse(stored || '{}');

      /* Create Razorpay order */
      const orderRes = await fetch(
        'https://wishandsurprise.com/backend/create-order.php',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: Math.round(summary.total_payable * 100),
            currency: 'INR',
          }),
        }
      );

      const order = await orderRes.json();

      const payment = await RazorpayCheckout.open({
        key: 'rzp_live_yOvVxv8Djhx8ds',
        amount: Math.round(summary.total_payable * 100),
        currency: 'INR',
        name: 'Wish and Surprise',
        order_id: order.orderId,
        prefill: {
          name: user.name || 'Customer',
          email: user.email || 'test@example.com',
          contact: user.phone || '9999999999',
        },
        theme: { color: BRAND },
      });
const normalizedItems =
  checkout.type === 'BUY_NOW'
    ? items.map(i => ({
        product_id: i.product_id,
        name: i.name,
        product_type: i.product_type,
        quantity: Number(i.quantity),

        // ✅ REQUIRED BY BACKEND
        base_price: Number(i.total_price),
        gst_amount: 0,
        delivery_price: 0,
        final_price: Number(i.total_price),
      }))
    : items;


const res = await fetch(
  'https://wishandsurprise.com/backend/save-payment.php',
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      razorpay_payment_id: payment.razorpay_payment_id,
      razorpay_order_id: payment.razorpay_order_id,
      razorpay_signature: payment.razorpay_signature,
      userId: user.id,
      summary,
      items: normalizedItems,
      billingAddress,
      order_type: checkout.type,
    }),
  }
);

const result = await res.json();   // ✅ READ BODY

console.log('Save payment response:', result);

if (!result.success) {
  Alert.alert(
    'Order Save Failed',
    result?.message || 'Unknown error'
  );
  setIsPaying(false);
  return;
}


console.log('Order saved with ID:', result.order_id);

      navigation.replace('Invoice', {
        summary,
        items,
        billingAddress,
        paymentId: payment.razorpay_payment_id,
      });
    } catch (e) {
      console.error(e);
      Alert.alert('Payment cancelled or failed');
      setIsPaying(false);
    }
  };

  /* ================= UI ================= */
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={BRAND} />
      </View>
    );
  }

  if (!summary) {
    return (
      <View style={styles.center}>
        <Text>Failed to load summary</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card title="Order Summary">
        {items.map((i, idx) => (
          <Row
            key={idx}
            label={`${i.name} × ${i.quantity}`}
            value={`₹ ${i.final_price}`}

          />
        ))}
      </Card>

      <Card title="Billing Address">
        <Text>{billingAddress}</Text>
      </Card>

      <Card title="Payment Summary">
        <Row label="Base Amount" value={`₹ ${summary.base_amount}`} />
        <Row label="Discount" value={`- ₹ ${summary.discount}`} />
        <Row label="GST" value={`₹ ${summary.gst}`} />
        <Row label="Delivery" value={`₹ ${summary.delivery}`} />
        <Divider />
        <Row
          label="Total Payable"
          value={`₹ ${summary.total_payable}`}
          bold
        />
      </Card>

      <TouchableOpacity
        style={[styles.payBtn, isPaying && { opacity: 0.6 }]}
        onPress={openRazorpay}
        disabled={isPaying}
      >
        <Text style={styles.payText}>
          {isPaying
            ? 'Processing…'
            : `Pay ₹ ${summary.total_payable}`}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

/* ================= UI HELPERS ================= */

const Card = ({ title, children }) => (
  <View style={styles.card}>
    <Text style={styles.cardTitle}>{title}</Text>
    {children}
  </View>
);

const Row = ({ label, value, bold }) => (
  <View style={styles.row}>
    <Text style={[styles.text, bold && styles.bold]}>{label}</Text>
    <Text style={[styles.text, bold && styles.bold]}>{value}</Text>
  </View>
);

const Divider = () => (
  <View style={{ height: 1, backgroundColor: '#eee', marginVertical: 8 }} />
);

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: {
    backgroundColor: '#f9f9f9',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
  },
  cardTitle: { fontSize: 16, fontWeight: '800', marginBottom: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 4 },
  text: { fontSize: 14, color: '#333' },
  bold: { fontWeight: '900', fontSize: 16 },
  payBtn: {
    backgroundColor: BRAND,
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  payText: { color: '#fff', fontSize: 16, fontWeight: '900' },
});
