import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView,
  Alert, Modal, FlatList, ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

const BillingAddressScreen = ({ route }) => {
  const { product } = route.params;
  const navigation = useNavigation();

  const [billingData, setBillingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [newAddress, setNewAddress] = useState({
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
    const token = userData.token;
    const userId = userData.id || userData._id;

    console.log('Token:', token, 'UserID:', userId);
console.log()
    const response = await axios.get(
  `https://easyshop-7095.onrender.com/api/v1/users/address/${userId}`,
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);


    console.log(response.data, "====response data=====");
const payments = Array.isArray(response.data) ? response.data : [];

setBillingData(payments.map(p => p.address).filter(Boolean));


  } catch (error) {
    console.error(
      'Failed to fetch billing addresses:',
      error.response?.data || error.message
    );
    setBillingData([]);
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    fetchBillingAddresses();
  }, []);

  const handleSelectAddress = (selectedAddress) => {
    navigation.navigate('RazorpayPayment', {
      product,
      billingAddress: selectedAddress,
    });
  };

  const handleAddNewAddress = () => {
    const { fullName, street, city } = newAddress;
    if (fullName && street && city) {
      setModalVisible(false);
      navigation.navigate('RazorpayPayment', {
        product,
        billingAddress: newAddress,
      });
    } else {
      Alert.alert('Validation', 'Please fill all required fields');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Select Existing Address</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#28a745" />
      ) : billingData.length === 0 ? (
        <Text style={{ color: '#777' }}>No saved addresses found.</Text>
      ) : (
        <FlatList
          data={billingData}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => handleSelectAddress(item)}>
              <Text style={styles.name}>{item.fullName}</Text>
              <Text style={styles.addressText}>
                {item.street}, {item.city}, {item.state} - {item.postalCode}, {item.country}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}

      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.addButtonText}>+ Add New Address</Text>
      </TouchableOpacity>

      {/* Modal for New Address Input */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>Enter New Address</Text>
            <TextInput placeholder="Full Name" style={styles.input} value={newAddress.fullName} onChangeText={(text) => setNewAddress({ ...newAddress, fullName: text })} />
            <TextInput placeholder="Street Address" style={styles.input} value={newAddress.street} onChangeText={(text) => setNewAddress({ ...newAddress, street: text })} />
            <TextInput placeholder="City" style={styles.input} value={newAddress.city} onChangeText={(text) => setNewAddress({ ...newAddress, city: text })} />
            <TextInput placeholder="State" style={styles.input} value={newAddress.state} onChangeText={(text) => setNewAddress({ ...newAddress, state: text })} />
            <TextInput placeholder="Postal Code" keyboardType="numeric" style={styles.input} value={newAddress.postalCode} onChangeText={(text) => setNewAddress({ ...newAddress, postalCode: text })} />
            <TextInput placeholder="Country" style={styles.input} value={newAddress.country} onChangeText={(text) => setNewAddress({ ...newAddress, country: text })} />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.button} onPress={handleAddNewAddress}>
                <Text style={styles.buttonText}>Proceed</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, { backgroundColor: '#ccc' }]} onPress={() => setModalVisible(false)}>
                <Text style={[styles.buttonText, { color: '#000' }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default BillingAddressScreen;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  card: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 10,
  },
  name: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  addressText: {
    color: '#555',
  },
  addButton: {
    backgroundColor: '#28a745',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    marginVertical: 6,
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 48,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000099',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
  },
  modalHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  button: {
    flex: 1,
    backgroundColor: '#28a745',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
