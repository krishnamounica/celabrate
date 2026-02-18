import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Button,
  Alert,
  ScrollView,
} from 'react-native';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import Share from 'react-native-share';
import moment from 'moment';

const InvoiceScreen = ({ route, navigation }) => {
  const {
    summary,
    items = [],
    billingAddress = '',
    paymentId,
  } = route.params || {};

  /* ---------- SAFETY ---------- */
  if (!summary) {
    return (
      <View style={styles.center}>
        <Text style={{ color: 'red' }}>
          Invoice data missing
        </Text>
      </View>
    );
  }

  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [pdfPath, setPdfPath] = useState('');

  /* ---------- INVOICE NUMBER ---------- */
  useEffect(() => {
    const random = Math.floor(100000 + Math.random() * 900000);
    setInvoiceNumber(`INV-${random}`);
  }, []);

  /* ---------- AUTO REDIRECT ---------- */
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('OrderHistory');
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigation]);

  /* ---------- CREATE PDF ---------- */
  const createPDF = async () => {
    try {
      const itemsHtml = items
        .map(
          i => `
          <tr>
            <td>${i.name}</td>
            <td>${i.quantity}</td>
            <td>₹ ${i.final_price}</td>
          </tr>
        `
        )
        .join('');

      const html = `
        <h1 style="text-align:center">Wish & Surprise</h1>

        <p><strong>Invoice:</strong> ${invoiceNumber}</p>
        <p><strong>Date:</strong> ${moment().format(
          'DD-MM-YYYY'
        )}</p>
        <p><strong>Payment ID:</strong> ${paymentId}</p>

        <hr />

        <h3>Billing Address</h3>
        <p>${billingAddress}</p>

        <hr />

        <h3>Items</h3>
        <table width="100%" border="1" cellspacing="0" cellpadding="8">
          <tr>
            <th align="left">Product</th>
            <th>Qty</th>
            <th>Amount</th>
          </tr>
          ${itemsHtml}
        </table>

        <hr />

        <h3>Payment Summary</h3>
        <p>Base Amount: ₹ ${summary.base_amount}</p>
        <p>Discount: ₹ ${summary.discount}</p>
        <p>GST: ₹ ${summary.gst}</p>
        <p>Delivery: ₹ ${summary.delivery}</p>
        <h2>Total Paid: ₹ ${summary.total_payable}</h2>
      `;

      const file = await RNHTMLtoPDF.convert({
        html,
        fileName: invoiceNumber,
        directory: 'Documents',
      });

      setPdfPath(file.filePath);
      Alert.alert('Success', 'Invoice PDF generated');
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to generate PDF');
    }
  };

  /* ---------- SHARE PDF ---------- */
  const sharePDF = async () => {
    if (!pdfPath) {
      Alert.alert('No PDF', 'Generate invoice first');
      return;
    }

    try {
      await Share.open({
        url: `file://${pdfPath}`,
        type: 'application/pdf',
      });
    } catch (e) {
      console.warn('Share cancelled');
    }
  };

  /* ---------- UI ---------- */
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>Invoice</Text>

      <Text>Invoice #: {invoiceNumber}</Text>
      <Text>Date: {moment().format('DD MMM YYYY')}</Text>
      <Text>Payment ID: {paymentId}</Text>

      <Text style={styles.section}>Billing Address</Text>
      <Text>{billingAddress}</Text>

      <Text style={styles.section}>Items</Text>
      {items.map((i, idx) => (
        <Text key={idx}>
          {i.name} × {i.quantity} — ₹ {i.final_price}
        </Text>
      ))}

      <Text style={styles.section}>Summary</Text>
      <Text>Base: ₹ {summary.base_amount}</Text>
      <Text>Discount: ₹ {summary.discount}</Text>
      <Text>GST: ₹ {summary.gst}</Text>
      <Text>Delivery: ₹ {summary.delivery}</Text>
      <Text style={styles.total}>
        Total Paid: ₹ {summary.total_payable}
      </Text>

      <View style={styles.buttons}>
        <Button title="Generate PDF" onPress={createPDF} />
        <Button title="Share Invoice" onPress={sharePDF} />
      </View>
    </ScrollView>
  );
};

export default InvoiceScreen;

/* ---------- STYLES ---------- */
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  heading: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  section: { marginTop: 20, fontSize: 18, fontWeight: '600' },
  total: {
    marginTop: 10,
    fontWeight: 'bold',
    fontSize: 18,
    color: '#FF6A00',
  },
  buttons: { marginTop: 30, gap: 12 },
});
