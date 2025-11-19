import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import Share from 'react-native-share';
import moment from 'moment';

const InvoiceScreen = ({ route ,navigation }) => {
  const { paymentDetails, product, billingAddress } = route.params;


  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [pdfPath, setPdfPath] = useState('');

  const gstRate = 0.18;
  const gstAmount = (paymentDetails.amount * gstRate) / (1 + gstRate);
  const baseAmount = paymentDetails.amount - gstAmount;

  useEffect(() => {
    const generateInvoiceNumber = () => {
      const random = Math.floor(100000 + Math.random() * 900000);
      setInvoiceNumber(`INV-${random}`);
    };
    generateInvoiceNumber();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.navigate('OrderHistory'); 
    }, 5000);

    return () => clearTimeout(timer); 
  }, []);

  const createPDF = async () => {
    const htmlContent = `
      <h1 style="text-align:center">Wish & Surprise</h1>
      <h3>Invoice Number: ${invoiceNumber}</h3>
      <p><strong>Date:</strong> ${moment(paymentDetails.createdAt).format('DD-MM-YYYY')}</p>
      <hr/>
      <h4>Billing Address:</h4>
      <p>
        ${billingAddress}<br/>
        
      </p>
      <hr/>
      <h4>Product:</h4>
      <p>${product.name} (Qty: ${product.quantity || 1})</p>
      <hr/>
      <h4>Payment Details:</h4>
      <p>Base Amount: ₹${baseAmount.toFixed(2)}</p>
      <p>GST (18%): ₹${gstAmount.toFixed(2)}</p>
      <p>Delivery Charges: ₹${paymentDetails.deliveryCharges || 0}</p>
      <p>Transaction Charges: ₹${paymentDetails.transactionCharges || 0}</p>
      <p><strong>Total Paid:</strong> ₹${paymentDetails.amount.toFixed(2)}</p>
      <p>Payment Mode: ${paymentDetails.paymentMode}</p>
    `;

    const options = {
      html: htmlContent,
      fileName: invoiceNumber,
      directory: 'Documents',
    };

    const file = await RNHTMLtoPDF.convert(options);
    setPdfPath(file.filePath);
    Alert.alert('PDF Generated', 'Invoice PDF created successfully!');
  };

  const sharePDF = async () => {
    if (!pdfPath) return Alert.alert('No PDF', 'Please generate PDF first.');

    try {
      await Share.open({
        title: 'Share Invoice',
        url: `file://${pdfPath}`,
        type: 'application/pdf',
      });
    } catch (error) {
      console.warn('Sharing failed:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Invoice Preview</Text>
      <Text style={styles.label}>Invoice #: {invoiceNumber}</Text>
      <Text style={styles.label}>Date: {moment(paymentDetails.createdAt).format('DD MMM YYYY')}</Text>

      <Text style={styles.section}>Billing Address</Text>
      <Text>{billingAddress}</Text>
      {/* <Text>{billingAddress.addressLine1}</Text>
      <Text>{billingAddress.city}, {billingAddress.state} - {billingAddress.pincode}</Text>
      <Text>Phone: {billingAddress.phone}</Text> */}

      <Text style={styles.section}>Product</Text>
      <Text>{product.name} (Qty: {product.quantity || 1})</Text>

      <Text style={styles.section}>Amount Summary</Text>
      <Text>Base Amount: ₹{baseAmount.toFixed(2)}</Text>
      <Text>GST (18%): ₹{gstAmount.toFixed(2)}</Text>
      <Text>Delivery Charges: ₹{paymentDetails.deliveryCharges || 0}</Text>
      <Text>Transaction Charges: ₹{paymentDetails.transactionCharges || 0}</Text>
      <Text style={styles.total}>Total Paid: ₹{paymentDetails.amount.toFixed(2)}</Text>

      <View style={styles.buttons}>
        <Button title="Generate PDF" onPress={createPDF} />
        <Button title="Share Invoice" onPress={sharePDF} />
      </View>
    </View>
  );
};

export default InvoiceScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  heading: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  label: { fontSize: 16 },
  section: { marginTop: 20, fontSize: 18, fontWeight: '600' },
  total: { marginTop: 10, fontWeight: 'bold', fontSize: 18, color: '#1e90ff' },
  buttons: { marginTop: 30, gap: 10 },
});
