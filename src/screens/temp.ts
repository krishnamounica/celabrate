import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BillingAddressListScreen = () => {
  const [billingData, setBillingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
  });

  const fetchBillingAddresses = async () => {
    try {
      const userDataString = await AsyncStorage.getItem('userData');
      const userData = JSON.parse(userDataString);
      const userId = userData._id;

      const response = await axios.get(`https://your-backend.com/api/payments/?userId=${userId}`);
      const payments = Array.isArray(response.data) ? response.data : [];
      setBillingData(payments);
    } catch (error) {
      console.error('Failed to fetch billing addresses', error);
      setBillingData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBillingAddresses();
  }, []);

  const handleSubmit = async () => {
    try {
      const userDataString = await AsyncStorage.getItem('userData');
      const userData = JSON.parse(userDataString);
      const userId = userData._id;

      const response = await axios.post('https://your-backend.com/api/payments/add-address', {
        userId,
        address: formData,
      });

      if (response.status === 200) {
        Alert.alert('Success', 'Address added successfully');
        setShowModal(false);
        fetchBillingAddresses();
        setFormData({
          fullName: '',
          street: '',
          city: '',
          state: '',
          postalCode: '',
          country: '',
        });
      }
    } catch (error) {
      console.error('Failed to add address', error);
      Alert.alert('Error', 'Failed to add address');
    }
  };

  const renderCard = ({ item }) => {
    if (!item?.address) return null;

    const { fullName, street, city, state, postalCode, country } = item.address;

    return (
      <View style={styles.card}>
        <View style={styles.row}>
          <Icon name="person" size={20} color="#333" style={styles.icon} />
          <Text style={styles.name}>{fullName}</Text>
        </View>
        <View style={styles.row}>
          <Icon name="location-on" size={20} color="#333" style={styles.icon} />
          <Text style={styles.address}>
            {street}, {city}, {state} - {postalCode}, {country}
          </Text>
        </View>
        <View style={styles.row}>
          <Icon name="payment" size={20} color="#333" style={styles.icon} />
          <Text style={styles.meta}>
            Payment: ₹{item.amount} | Mode: {item.payment_mode}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.addButton} onPress={() => setShowModal(true)}>
        <Text style={styles.addButtonText}>+ Add Address</Text>
      </TouchableOpacity>

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#28a745" />
        </View>
      ) : billingData.filter(item => item?.address).length === 0 ? (
        <View style={styles.noDataView}>
          <Text style={styles.noDataText}>No billing addresses found.</Text>
        </View>
      ) : (
        <FlatList
          data={billingData.filter(item => item?.address)}
          keyExtractor={(item) => item._id}
          renderItem={renderCard}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}

      {/* Modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <ScrollView>
              <Text style={styles.modalTitle}>Add Billing Address</Text>
              {['fullName', 'street', 'city', 'state', 'postalCode', 'country'].map((field) => (
                <TextInput
                  key={field}
                  placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                  value={formData[field]}
                  onChangeText={(text) => setFormData({ ...formData, [field]: text })}
                  style={styles.input}
                />
              ))}
              <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                <Text style={styles.submitText}>Submit</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowModal(false)} style={styles.cancelButton}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default BillingAddressListScreen;
const styles= StyleSheet.create({
  addButton: {
  backgroundColor: '#28a745',
  padding: 12,
  borderRadius: 8,
  alignItems: 'center',
  marginBottom: 16,
},
addButtonText: {
  color: '#fff',
  fontSize: 16,
  fontWeight: 'bold',
},
modalBackground: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.5)',
  justifyContent: 'center',
  alignItems: 'center',
},
modalContainer: {
  backgroundColor: '#fff',
  padding: 20,
  width: '90%',
  borderRadius: 10,
},
modalTitle: {
  fontSize: 18,
  fontWeight: 'bold',
  marginBottom: 12,
  textAlign: 'center',
},
input: {
  borderWidth: 1,
  borderColor: '#ccc',
  borderRadius: 6,
  padding: 10,
  marginBottom: 10,
},
submitButton: {
  backgroundColor: '#28a745',
  padding: 12,
  borderRadius: 6,
  alignItems: 'center',
  marginBottom: 10,
},
submitText: {
  color: '#fff',
  fontSize: 16,
},
cancelButton: {
  alignItems: 'center',
},
cancelText: {
  color: '#999',
  fontSize: 14,
},

})
