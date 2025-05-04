import React, { useEffect } from "react";
import { Modal, Text, View, StyleSheet, TouchableOpacity } from "react-native";
import RazorpayCheckout from "react-native-razorpay";

const BuyModal = ({ visible, onClose, product }) => {
  useEffect(() => {
    if (visible && product) {
      openRazorpayCheckout();
    }
  }, [visible, product]);

  const openRazorpayCheckout = () => {
    const options = {
      description: `Buy ${product.name}`,
      image: "https://your-logo-url.com/logo.png", // Optional: Replace with your brand/logo
      currency: "INR",
      key: "rzp_test_YourKeyHere", // Replace with your Razorpay API key
      amount: product.price * 100, // Convert to paise
      name: "Your Company Name",
      prefill: {
        email: "test@example.com", // Optional: You can make this dynamic
        contact: "9876543210", // Optional
        name: "Customer Name", // Optional
      },
      theme: { color: "#F37254" },
    };

    RazorpayCheckout.open(options)
      .then((data) => {
        alert(`Success! Payment ID: ${data.razorpay_payment_id}`);
        onClose();
      })
      .catch((error) => {
        alert(`Payment failed: ${error.description}`);
        onClose();
      });
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.message}>Redirecting to payment...</Text>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default BuyModal;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
  },
  message: {
    fontSize: 16,
    marginBottom: 20,
  },
  cancelButton: {
    backgroundColor: "#ccc",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  cancelText: {
    color: "#000",
  },
});
