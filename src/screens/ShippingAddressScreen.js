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
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAddresses = async () => {
    try {
      const userDataString = await AsyncStorage.getItem('userData');
      const userData = JSON.parse(userDataString);
      const token = userData.token;
      const userId = userData.id || userData._id;

      const response = await axios.get(
        `https://wishandsurprise.com/backend/get-addresses.php?userId=${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const raw = Array.isArray(response.data.addresses) ? response.data.addresses : [];
      const allAddresses = raw.map(item => item.full_address).filter(Boolean);
      const unique = [...new Set(allAddresses)];
      setAddresses(unique);
    } catch (error) {
      console.error('Failed to fetch addresses:', error.response?.data || error.message);
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const renderCard = ({ item }) => (
  <View style={styles.card}>
  <Text style={styles.cardText}>{item}</Text> /

  </View>
);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Shipping Addresses</Text>
      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} />
      ) : addresses.length === 0 ? (
        <Text style={styles.noDataText}>No addresses found.</Text>
      ) : (
        <FlatList
          data={addresses}
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
