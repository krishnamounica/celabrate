import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  SafeAreaView,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { moderateScale, scale, verticalScale } from '../styles/scaling';
import colors from '../styles/colors';

const ShippingAddressScreen = () => {
  const [billingData, setBillingData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBillingAddresses = async () => {
    try {
      const userDataString = await AsyncStorage.getItem('userData');
      const userData = JSON.parse(userDataString);
      const token = userData.token;
      const userId = userData.id || userData._id;

      const response = await axios.get(
        `https://easyshop-7095.onrender.com/api/v1/users/address/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const payments = Array.isArray(response.data) ? response.data : [];
      setBillingData(payments.map(p => p.address).filter(Boolean));
    } catch (error) {
      console.error('Failed to fetch billing addresses:', error.response?.data || error.message);
      setBillingData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBillingAddresses();
  }, []);

  const renderCard = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.cardText}>Name: {item.fullName}</Text>
      <Text style={styles.cardText}>Phone: {item.phone}</Text>
      <Text style={styles.cardText}>Street: {item.street}</Text>
      <Text style={styles.cardText}>City: {item.city}</Text>
      <Text style={styles.cardText}>State: {item.state}</Text>
      <Text style={styles.cardText}>Pincode: {item.pinCode}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Shipping Addresses</Text>
      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} />
      ) : billingData.length === 0 ? (
        <Text style={styles.noDataText}>No addresses found.</Text>
      ) : (
        <FlatList
          data={billingData}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderCard}
          contentContainerStyle={styles.list}
        />
      )}
    </SafeAreaView>
  );
};

export default ShippingAddressScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: moderateScale(16),
  },
  title: {
    fontSize: scale(16),
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: verticalScale(20),
  },
  list: {
    paddingBottom: verticalScale(20),
  },
  card: {
    backgroundColor: colors.backgorundColor,
    borderRadius: moderateScale(10),
    padding: moderateScale(12),
    marginBottom: verticalScale(12),
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  cardText: {
    fontSize: scale(13),
    marginBottom: verticalScale(4),
    color: colors.black,
  },
  noDataText: {
    textAlign: 'center',
    marginTop: verticalScale(20),
    fontSize: scale(14),
    color: 'gray',
  },
});
