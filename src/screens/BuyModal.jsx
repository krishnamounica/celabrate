// src/screens/Search/BuyModal.js
import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { TextInput } from 'react-native';
import RazorpayCheckout from 'react-native-razorpay';
import axios from 'axios';
import normalizeUri from '../utils/normalizeUri';

const isHtml = (s) => {
  if (!s) return false;
  const sn = String(s).trim().slice(0, 40).toLowerCase();
  return sn.startsWith('<!doctype') || sn.startsWith('<html') || sn.includes('<div id="root">');
};

const BuyModal = ({ visible, onClose, product }) => {
  const [qty, setQty] = useState(1);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!visible) {
      setQty(1);
      setName('');
      setPhone('');
      setAddress('');
      setLoading(false);
    }
  }, [visible]);

  if (!product) return null;

  const totalAmount = (Number(product.price || 0) * Number(qty || 1)).toFixed(2);

  const validate = () => {
    if (!name.trim()) { Alert.alert('Missing name', 'Please enter full name.'); return false; }
    if (!phone.trim() || phone.trim().length < 6) { Alert.alert('Invalid phone', 'Please enter a valid phone number.'); return false; }
    if (!address.trim()) { Alert.alert('Missing address', 'Please enter a delivery address.'); return false; }
    return true;
  };

  // Candidate endpoints to try (add/modify to match your server)
  const CREATE_CANDIDATES = [
    'https://wishandsurprise.com/backend/create_order.php',
    'https://wishandsurprise.com/create_order.php',
    'https://wishandsurprise.com/api/create_order.php',
    'https://wishandsurprise.com/backend/create_order_new.php',
    // local dev fallbacks (if testing on emulator and backend on dev machine)
    'http://10.0.2.2/backend/create_order.php',
    'http://10.0.2.2/create_order.php',
  ];

  const tryCreateOrderOne = async (url, payload, method = 'post') => {
    try {
      console.log('[BuyModal] trying create order', method.toUpperCase(), url, payload);
      const resp = method === 'post' ? await axios.post(url, payload, { timeout: 15000 }) : await axios.get(url, { params: payload, timeout: 15000 });
      // If server returned HTML, treat as wrong endpoint
      const bodyText = typeof resp.data === 'string' ? resp.data : JSON.stringify(resp.data);
      if (isHtml(bodyText)) {
        console.warn('[BuyModal] createOrder got HTML from', url);
        return { ok: false, html: bodyText, url, raw: resp.data };
      }
      return { ok: true, data: resp.data, url };
    } catch (err) {
      console.warn('[BuyModal] createOrder error for', url, err?.toString());
      if (err?.response && err.response.data) {
        const body = err.response.data;
        if (typeof body === 'string' && isHtml(body)) {
          // server served index.html (SPA) -> wrong route
          return { ok: false, html: body, url, status: err.response.status, raw: body };
        }
        return { ok: false, status: err.response.status, raw: err.response.data, url };
      }
      return { ok: false, error: err, url };
    }
  };

  const createOrder = async (payload) => {
    // try candidates with POST first, then GET fallback
    let lastHtmlSnippet = null;
    let lastErr = null;
    for (const url of CREATE_CANDIDATES) {
      const res = await tryCreateOrderOne(url, payload, 'post');
      if (res.ok) return { url: res.url, data: res.data };
      if (res.html) lastHtmlSnippet = { url: res.url, html: String(res.html).slice(0, 1200) };
      lastErr = res;
    }
    // fallback: try GET on same urls (in case backend expects GET)
    for (const url of CREATE_CANDIDATES) {
      const res = await tryCreateOrderOne(url, payload, 'get');
      if (res.ok) return { url: res.url, data: res.data };
      if (res.html) lastHtmlSnippet = { url: res.url, html: String(res.html).slice(0, 1200) };
      lastErr = res;
    }

    const debugMsg = lastHtmlSnippet
      ? `Order creation failed (server returned HTML at ${lastHtmlSnippet.url}). Server response (snippet):\n\n${lastHtmlSnippet.html}`
      : `Order creation failed. Last error: ${JSON.stringify(lastErr?.raw || lastErr?.error?.message || lastErr?.status || lastErr?.url).slice(0, 1000)}`;

    throw new Error(debugMsg);
  };

  const verifyPayment = async (razorpay_res) => {
    const VERIFY_URL = 'https://wishandsurprise.com/backend/verify_payment.php';
    try {
      const payload = {
        payment_id: razorpay_res.razorpay_payment_id || razorpay_res.payment_id,
        order_id: razorpay_res.razorpay_order_id || razorpay_res.order_id,
        signature: razorpay_res.razorpay_signature || razorpay_res.signature,
        product_id: product.id,
        amount: Math.round(Number(totalAmount) * 100),
      };
      console.log('[BuyModal] verify payload', VERIFY_URL, payload);
      const resp = await axios.post(VERIFY_URL, payload, { timeout: 15000 });
      const data = resp?.data ?? {};
      if (data.success === true || data.status === 'paid' || data.paid === true) return { ok: true, raw: data };
      if (data.data && (data.data.success === true || data.data.status === 'paid' || data.data.paid === true)) return { ok: true, raw: data.data };
      return { ok: false, message: data.message || data.msg || JSON.stringify(data).slice(0, 1200), raw: data };
    } catch (err) {
      console.error('[BuyModal] verify error', err?.response?.data || err?.message || err);
      throw err;
    }
  };

  const startPayment = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const createPayload = {
        productId: product.id,
        qty,
        amount: Math.round(Number(totalAmount) * 100),
        customer_name: name,
        customer_phone: phone,
        customer_address: address,
      };

      // 1) create order (probe endpoints)
      const { url: usedUrl, data: orderResp } = await createOrder(createPayload);
      console.log('[BuyModal] createOrder succeeded from', usedUrl, 'resp:', orderResp);

      // parse order id & key robustly
      const containerCandidates = [orderResp, orderResp.data, orderResp.result, orderResp.order];
      const maybe = (obj, keys) => { for (const k of keys) if (obj && Object.prototype.hasOwnProperty.call(obj, k) && obj[k]) return obj[k]; return undefined; };
      let orderId, razorpayKey;
      for (const c of containerCandidates) {
        if (!c) continue;
        orderId = orderId || maybe(c, ['order_id', 'id', 'orderId', 'razorpay_order_id']);
        razorpayKey = razorpayKey || maybe(c, ['razorpay_key', 'key', 'razorpayKey']);
      }
      orderId = orderId || maybe(orderResp, ['order_id', 'id', 'orderId']);
      razorpayKey = razorpayKey || maybe(orderResp, ['razorpay_key', 'key', 'razorpayKey']);

      if (!orderId || !razorpayKey) {
        throw new Error('Order created but missing orderId or razorpayKey. Server returned: ' + JSON.stringify(orderResp).slice(0, 1200));
      }

      // 2) open razorpay
      const options = {
        description: product.name || 'Purchase',
        image: product.feature_image ? normalizeUri(product.feature_image) : undefined,
        currency: 'INR',
        key: razorpayKey,
        amount: String(Math.round(Number(totalAmount) * 100)),
        name: 'WishAndSurprise',
        order_id: orderId,
        prefill: { name, contact: phone, email: '' },
        theme: { color: '#FF9F1C' },
      };
      console.log('[BuyModal] opening razorpay with', options);
      const r = await RazorpayCheckout.open(options);
      console.log('[BuyModal] razorpay response', r);

      // 3) verify
      const verification = await verifyPayment(r);
      if (!verification.ok) throw new Error(verification.message || 'Payment verification failed');

      Alert.alert('Payment success', 'Your payment was successful.');
      onClose && onClose();
    } catch (err) {
      console.error('BuyModal error:', err);
      // show a clear message with snippet for debugging
      const msg = err?.message || String(err);
      Alert.alert('Payment / Order error', msg.length > 1200 ? msg.slice(0, 1200) + '...' : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={() => !loading && onClose && onClose()}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <ScrollView contentContainerStyle={{ padding: 16 }}>
            <Text style={styles.title}>Buy: {product.name}</Text>

            <Text style={styles.label}>Quantity</Text>
            <View style={styles.qtyRow}>
              <TouchableOpacity style={styles.qtyBtn} onPress={() => setQty(Math.max(1, qty - 1))} disabled={loading}><Text>-</Text></TouchableOpacity>
              <Text style={styles.qtyValue}>{qty}</Text>
              <TouchableOpacity style={styles.qtyBtn} onPress={() => setQty(qty + 1)} disabled={loading}><Text>+</Text></TouchableOpacity>
            </View>

            <Text style={styles.label}>Your name</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Full name" editable={!loading} />

            <Text style={styles.label}>Phone</Text>
            <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="Phone number" keyboardType="phone-pad" editable={!loading} />

            <Text style={styles.label}>Billing / Delivery address</Text>
            <TextInput style={[styles.input, { height: 90 }]} value={address} onChangeText={setAddress} placeholder="Full address" multiline editable={!loading} />

            <Text style={styles.summary}>Total: ₹ {totalAmount}</Text>

            <TouchableOpacity style={styles.payBtn} onPress={startPayment} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.payText}>Pay ₹ {totalAmount}</Text>}
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelBtn} onPress={() => !loading && onClose && onClose()} disabled={loading}><Text style={styles.cancelText}>Cancel</Text></TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 16 },
  container: { backgroundColor: '#fff', borderRadius: 10, maxHeight: '90%' },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  label: { fontWeight: '600', marginTop: 8, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, backgroundColor: '#fff' },
  qtyRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  qtyBtn: { padding: 8, backgroundColor: '#eee', borderRadius: 6, minWidth: 40, alignItems: 'center' },
  qtyBtnText: { fontSize: 18 },
  qtyValue: { marginHorizontal: 12, fontSize: 16, fontWeight: '700' },
  summary: { marginTop: 12, fontSize: 16, fontWeight: '700', color: '#ff6600' },
  payBtn: { backgroundColor: '#FF9F1C', marginTop: 12, padding: 12, borderRadius: 8, alignItems: 'center' },
  payText: { color: '#fff', fontWeight: '700' },
  cancelBtn: { marginTop: 10, padding: 10, alignItems: 'center' },
  cancelText: { color: '#333' },
});

export default BuyModal;
