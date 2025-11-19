import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, AccessibilityInfo } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const PaymentSuccessModal = ({ isOpen, amount, paymentId, paymentMode, createdAt, onClose }) => {
  const navigation = useNavigation();
  const [countdown, setCountdown] = useState(5);

 useEffect(() => {
  if (!isOpen) return;

  AccessibilityInfo.announceForAccessibility(
    `Payment successful. You will be redirected in ${countdown} seconds.`
  );

  const timer = setTimeout(() => {
    navigation.navigate('MyBottomTab');
  }, 5000);

  return () => clearTimeout(timer);
}, [isOpen, navigation]);

useEffect(() => {
  if (!isOpen) return;

  let counter = 5;
  const interval = setInterval(() => {
    counter--;
    setCountdown(counter);
    if (counter <= 0) clearInterval(interval);
  }, 1000);

  return () => clearInterval(interval);
}, [isOpen]);


  if (!isOpen) return null;

  return (
    <Modal transparent animationType="fade" visible={isOpen}>
      <View style={styles.modalOverlay} accessibilityViewIsModal>
        <View style={styles.modalContent} accessible accessibilityLabel="Payment Successful Modal">
          <View style={styles.checkmarkContainer}>
            <Text style={styles.checkmark}>✓</Text>
          </View>

          <Text style={styles.modalTitle}>Payment Successful</Text>

          <Text style={styles.modalText}>Amount: ₹{amount}</Text>
          <Text style={styles.modalText}>Payment ID: {paymentId}</Text>
          <Text style={styles.modalText}>Payment Mode: {paymentMode}</Text>

          <Text style={styles.tertiaryText}>Created At: {new Date(createdAt).toLocaleString()}</Text>

          <TouchableOpacity style={styles.closeButton} onPress={onClose} accessibilityRole="button">
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>

          <Text style={styles.countdownText} accessibilityLiveRegion="polite">
            Redirecting in {countdown} second{countdown !== 1 ? 's' : ''}...
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#FAFAFA',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 8,
  },
  checkmarkContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#e6f4ea',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkmark: {
    color: '#4BB543',
    fontSize: 32,
    fontWeight: '600',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    color: '#666',
    marginVertical: 6,
    textAlign: 'center',
  },
  tertiaryText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    fontStyle: 'italic',
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: '#4BB543',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 30,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  countdownText: {
    marginTop: 10,
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
});

export default PaymentSuccessModal;
