import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNPickerSelect from 'react-native-picker-select';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import styles from './GiftModalStyles';
import pickerSelectStyles from './pickerSelectStyles';
import { useNavigation } from '@react-navigation/native';

const GiftRequestModal = ({ visible, onClose, product }) => {
  const navigation = useNavigation();

  const [formStep, setFormStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    relation: '',
    occasion: '',
    date: '',
    flatNo: '',
    apartment: '',
    landmark: '',
    district: '',
    state: '',
    pincode: '',
  });
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleInputChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const submitGiftRequest = async () => {
    try {
      const userDataString = await AsyncStorage.getItem('userData');
      const userData = JSON.parse(userDataString);

      const payload = {
        ...formData,
        productId: product.id,
        productName: product.name,
        productPrice: product.price,
        status: 'pending',
        feedback: [],
        payment: false,
        sharable: false,
        userName: userData.id,
        paymentlink: '',
        sharablelink: '',
        totalAmount: product.price,
        remainingAmount: product.price,
        noOfPayments: 0,
      };
      const response = await axios.post(
        'https://wishandsurprise.com/backend/gift_submit.php',
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Token': `Bearer ${userData.token}`,
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        alert('Gift request submitted successfully!');
        setFormStep(1);
        onClose();
        navigation.navigate('Request');
      } else {
        alert('Failed to submit gift request. Try again.');
      }
    } catch (error) {
      console.error('Error submitting gift request:', error);
      alert('Error submitting gift request!');
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={() => {
        onClose();
        setFormStep(1);
      }}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            {[1, 2, 3, 4].map((s) => (
              <View
                key={s}
                style={[
                  styles.progressStep,
                  { backgroundColor: formStep >= s ? '#007bff' : '#ccc' },
                ]}
              />
            ))}
          </View>

          {/* Titles */}
          <Text style={styles.modalTitle}>Step {formStep}</Text>
          {formStep === 1 && <Text style={styles.modalText}>Enter recipient's basic contact information.</Text>}
          {formStep === 2 && <Text style={styles.modalText}>Specify your relationship and the occasion.</Text>}
          {formStep === 3 && <Text style={styles.modalText}>Provide the building and location details.</Text>}
          {formStep === 4 && <Text style={styles.modalText}>Finish with district, state, and pincode.</Text>}

          {/* Step Inputs */}
          {formStep === 1 && (
            <>
              <Text style={styles.label}>Name</Text>
              <TextInput style={styles.input} value={formData.name} onChangeText={(text) => handleInputChange('name', text)} placeholder="Recipient Name" />
              <Text style={styles.label}>Phone</Text>
              <TextInput style={styles.input} value={formData.phone} keyboardType="phone-pad" onChangeText={(text) => handleInputChange('phone', text)} placeholder="Phone Number" />
            </>
          )}

          {formStep === 2 && (
            <>
              <Text style={styles.label}>Relation</Text>
              <RNPickerSelect
                onValueChange={(value) => handleInputChange('relation', value)}
                value={formData.relation}
                items={[
                  { label: 'Friend', value: 'Friend' },
                  { label: 'Brother', value: 'Brother' },
                  { label: 'Sister', value: 'Sister' },
                  { label: 'Mother', value: 'Mother' },
                  { label: 'Father', value: 'Father' },
                ]}
                placeholder={{ label: 'Select a relation', value: null }}
                style={pickerSelectStyles}
              />
              <Text style={styles.label}>Occasion</Text>
              <RNPickerSelect
                onValueChange={(value) => handleInputChange('occasion', value)}
                value={formData.occasion}
                items={[
                  { label: 'Birthday', value: 'Birthday' },
                  { label: 'Anniversary', value: 'Anniversary' },
                  { label: 'Wedding', value: 'Wedding' },
                  { label: 'Graduation', value: 'Graduation' },
                  { label: 'Festival', value: 'Festival' },
                ]}
                placeholder={{ label: 'Select an occasion', value: null }}
                style={pickerSelectStyles}
              />
              <Text style={styles.label}>Date</Text>
              <TouchableOpacity style={[styles.input, { justifyContent: 'center' }]} onPress={() => setShowDatePicker(true)}>
                <Text>{formData.date || 'Select date'}</Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  mode="date"
                  display="default"
                  value={new Date()}
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(false);
                    if (selectedDate) {
                      const formatted = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
                      handleInputChange('date', formatted);
                    }
                  }}
                />
              )}
            </>
          )}

          {formStep === 3 && (
            <>
              <Text style={styles.label}>Flat No.</Text>
              <TextInput style={styles.input} value={formData.flatNo} onChangeText={(text) => handleInputChange('flatNo', text)} placeholder="Flat Number" />
              <Text style={styles.label}>Apartment</Text>
              <TextInput style={styles.input} value={formData.apartment} onChangeText={(text) => handleInputChange('apartment', text)} placeholder="Apartment Name" />
              <Text style={styles.label}>Landmark</Text>
              <TextInput style={styles.input} value={formData.landmark} onChangeText={(text) => handleInputChange('landmark', text)} placeholder="Landmark" />
            </>
          )}

          {formStep === 4 && (
            <>
              <Text style={styles.label}>District</Text>
              <TextInput style={styles.input} value={formData.district} onChangeText={(text) => handleInputChange('district', text)} placeholder="District" />
              <Text style={styles.label}>State</Text>
              <TextInput style={styles.input} value={formData.state} onChangeText={(text) => handleInputChange('state', text)} placeholder="State" />
              <Text style={styles.label}>Pincode</Text>
              <TextInput style={styles.input} keyboardType="numeric" value={formData.pincode} onChangeText={(text) => handleInputChange('pincode', text)} placeholder="Pincode" />
            </>
          )}

          {/* Buttons */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            {formStep > 1 && (
              <TouchableOpacity style={[styles.button, { flex: 1, marginRight: 5 }]} onPress={() => setFormStep(formStep - 1)}>
                <Text style={styles.buttonText}>Back</Text>
              </TouchableOpacity>
            )}
            {formStep < 4 ? (
              <TouchableOpacity style={[styles.button, { flex: 1, marginLeft: formStep > 1 ? 5 : 0 }]} onPress={() => setFormStep(formStep + 1)}>
                <Text style={styles.buttonText}>Next</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={[styles.button, { flex: 1, marginLeft: 5 }]} onPress={submitGiftRequest}>
                <Text style={styles.buttonText}>Submit</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default GiftRequestModal;
