import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import AddressModal from './AddressModal';
// import AddressModal from './AddressModal'; // If you're using it for adding a new address

const BillingAddressScreen = ({ navigation, route }) => {
  const { product } = route.params;
  const [billingData, setBillingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    fetchBillingAddresses();
  }, []);

  const fetchBillingAddresses = async () => {
    try {
      const userDataString = await AsyncStorage.getItem('userData');
      const userData = JSON.parse(userDataString);
      const token = userData.token;
      const userId = userData.id || userData._id;

      const response = await axios.post(
        `https://wishandsurprise.com/backend/get-addresses.php?userId=${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const addresses = Array.isArray(response.data.addresses)
        ? response.data.addresses.map(a => a.full_address).filter(Boolean)
        : [];

      const unique = [...new Set(addresses)];
      setBillingData(unique);
    } catch (error) {
      console.error('Failed to fetch billing addresses:', error.response?.data || error.message);
      setBillingData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAddress = (selectedFullAddress) => {
    navigation.navigate('RazorpayPayment', {
      product,
      billingAddress: selectedFullAddress, // Pass full string address
    });
  };

  const handleAddNewAddress = () => {
    setIsModalVisible(true);
  };

  const handleAddressAdded = (newAddress) => {
    setIsModalVisible(false);
    setBillingData(prev => [...new Set([newAddress, ...prev])]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Billing Address</Text>

      {loading ? (
        <ActivityIndicator size="large" color="orange" />
      ) : billingData.length === 0 ? (
        <Text style={styles.noAddressText}>No billing addresses found.</Text>
      ) : (
        <FlatList
          data={billingData}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => handleSelectAddress(item)}>
              <Text style={styles.addressText}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      )}

      <TouchableOpacity style={styles.addButton} onPress={handleAddNewAddress}>
        <Text style={styles.addButtonText}>+ Add New Address</Text>
      </TouchableOpacity>

      <Modal visible={isModalVisible} animationType="slide">
        <AddressModal
          onClose={() => setIsModalVisible(false)}
          onSave={handleAddressAdded}
        />
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  card: {
    backgroundColor: '#f2f2f2',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  addressText: {
    fontSize: 16,
    color: '#333',
  },
  noAddressText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 20,
  },
  addButton: {
    backgroundColor: 'orange',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default BillingAddressScreen;
