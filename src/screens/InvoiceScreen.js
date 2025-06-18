import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import Share from 'react-native-share';
import AsyncStorage from '@react-native-async-storage/async-storage';

const InvoiceScreen = ({ route }) => {
  const { paymentDetails, product, billingAddress } = route.params;

  const [invoiceNumber, setInvoiceNumber] = useState(null);

  const gstRate = 0.18;
  const gstAmount = (paymentDetails.amount * gstRate) / (1 + gstRate);
  const baseAmount = paymentDetails.amount - gstAmount;

  useEffect(() => {
    generateInvoiceNumber();
  }, []);

  const generateInvoiceNumber = async () => {
    try {
      const current = await AsyncStorage.getItem('invoiceCounter');
      const nextNumber = current ? parseInt(current) + 1 : 1001;
      await AsyncStorage.setItem('invoiceCounter', nextNumber.toString());
      setInvoiceNumber(nextNumber);
    } catch (err) {
      console.error('Failed to generate invoice number', err);
    }
  };

  const generatePDF = async () => {
    const htmlContent = `
      <html>
        <head>
          <style>
            body { font-family: Arial; padding: 20px; }
            .header { text-align: center; }
            .box { border: 1px solid #ccc; padding: 20px; border-radius: 10px; margin-top: 20px; }
            .row { display: flex; justify-content: space-between; margin: 6px 0; }
            .info-label { font-weight: bold; }
            .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #888; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Wish & Surprise</h1>
            <p><strong>Invoice #${invoiceNumber}</strong></p>
          </div>

          <div class="box">
            <h3>Billing Details</h3>
            <p>${billingAddress.fullName}</p>
            <p>${billingAddress.street}, ${billingAddress.city}, ${billingAddress.state}, ${billingAddress.postalCode}</p>
            <p>Country: ${billingAddress.country}</p>
          </div>

          <div class="box">
            <h3>Payment Details</h3>
            <div class="row"><span class="info-label">Product:</span><span>${product.name}</span></div>
            <div class="row"><span class="info-label">Base Amount:</span><span>₹${baseAmount.toFixed(2)}</span></div>
            <div class="row"><span class="info-label">GST (18%):</span><span>₹${gstAmount.toFixed(2)}</span></div>
            <div class="row"><span class="info-label">Total Amount Paid:</span><span>₹${paymentDetails.amount.toFixed(2)}</span></div>
            <div class="row"><span class="info-label">Payment Mode:</span><span>${paymentDetails.paymentMode}</span></div>
            <div class="row"><span class="info-label">Payment ID:</span><span>${paymentDetails.paymentId}</span></div>
            <div class="row"><span class="info-label">Date:</span><span>${new Date(paymentDetails.createdAt).toLocaleString()}</span></div>
          </div>

          <div class="box">
            <h3>GST & Compliance</h3>
            <div class="row"><span class="info-label">GSTIN:</span><span>29ABCDE1234F2Z5</span></div>
            <div class="row"><span class="info-label">HSN/SAC:</span><span>998729</span></div>
          </div>

          <div class="footer">
            Thank you for shopping with us!<br />
            For queries: support@wishandsurprise.com
          </div>
        </body>
      </html>
    `;

    try {
      const file = await RNHTMLtoPDF.convert({
        html: htmlContent,
        fileName: `Invoice_${invoiceNumber}`,
        base64: false,
      });

      await Share.open({
        url: `file://${file.filePath}`,
        type: 'application/pdf',
        failOnCancel: false,
      });
    } catch (error) {
      Alert.alert('Error', 'Could not generate or share PDF');
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Invoice #{invoiceNumber}</Text>
      <Text>Product: {product.name}</Text>
      <Text>Total Paid: ₹{paymentDetails.amount}</Text>
      <Text>Base: ₹{baseAmount.toFixed(2)} | GST: ₹{gstAmount.toFixed(2)}</Text>
      <Text>Mode: {paymentDetails.paymentMode}</Text>
      <Text>Date: {new Date(paymentDetails.createdAt).toLocaleString()}</Text>
      <Button title="Download / Share Invoice" onPress={generatePDF} />
    </View>
  );
};


export default InvoiceScreen;

const styles = StyleSheet.create({
  container: { padding: 20 },
  heading: { fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
});
