import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import AddressModal from './AddressModal';

const BRAND = '#FF9F1C';

const BillingAddressScreen = ({ navigation, route }) => {
  const { checkout } = route.params || {};
  const { items = [], totalAmount = 0, type } = checkout || {};
  console.log('Checkout Data:', type);

  const [billingData, setBillingData] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    fetchBillingAddresses();
  }, []);

  const fetchBillingAddresses = async () => {
    try {
      const stored = await AsyncStorage.getItem('userData');
      const userData = JSON.parse(stored || '{}');
      const token = userData.token;
      const userId = userData.id;

      const res = await axios.post(
        `https://wishandsurprise.com/backend/get-addresses.php?userId=${userId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const addresses = Array.isArray(res.data.addresses)
        ? res.data.addresses.map(a => a.full_address).filter(Boolean)
        : [];

      setBillingData([...new Set(addresses)]);
    } catch (e) {
      console.log('Address fetch error', e);
      setBillingData([]);
    } finally {
      setLoading(false);
    }
  };

  const proceedToPayment = () => {
    if (!selectedAddress) {
      alert('Please select a billing address');
      return;
    }

    navigation.navigate('RazorpayPayment', {
      checkout: {
        type,
        items,
        totalAmount,
        billingAddress: selectedAddress,
      },
    });
  };

  const renderAddress = ({ item }) => {
    const selected = selectedAddress === item;

    return (
      <TouchableOpacity
        style={[
          styles.addressCard,
          selected && styles.addressSelected,
        ]}
        onPress={() => setSelectedAddress(item)}
      >
        <View style={styles.radio}>
          {selected && <View style={styles.radioInner} />}
        </View>

        <Text style={styles.addressText}>{item}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 140 }}>
        <Text style={styles.title}>Billing Address</Text>

        {/* ORDER SUMMARY */}
        <View style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>Order Summary</Text>

          {items.map((item, i) => (
            <View key={i} style={styles.summaryRow}>
              <Text style={styles.summaryName}>
                {item.name} × {item.quantity}
              </Text>
              <Text style={styles.summaryPrice}>
                ₹ {item.total_price}
              </Text>
            </View>
          ))}

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>
              ₹ {Number(totalAmount).toFixed(2)}
            </Text>
          </View>
        </View>

        {/* ADDRESS LIST */}
        <Text style={styles.sectionTitle}>Select Address</Text>

        {loading ? (
          <ActivityIndicator size="large" color={BRAND} />
        ) : billingData.length === 0 ? (
          <Text style={styles.emptyText}>
            No billing addresses found
          </Text>
        ) : (
          <FlatList
            data={billingData}
            keyExtractor={(item, i) => i.toString()}
            renderItem={renderAddress}
            scrollEnabled={false}
          />
        )}

        {/* ADD ADDRESS */}
        <TouchableOpacity
          style={styles.addAddressBtn}
          onPress={() => setIsModalVisible(true)}
        >
          <Text style={styles.addAddressText}>
            + Add New Address
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* STICKY FOOTER */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.payBtn,
            !selectedAddress && { opacity: 0.6 },
          ]}
          onPress={proceedToPayment}
        >
          <Text style={styles.payText}>
            Continue • ₹ {Number(totalAmount).toFixed(2)}
          </Text>
        </TouchableOpacity>
      </View>

      {/* MODAL */}
      <Modal visible={isModalVisible} animationType="slide">
        <AddressModal
          onClose={() => setIsModalVisible(false)}
          onSave={addr => {
            setIsModalVisible(false);
            setBillingData(prev => [
              addr,
              ...new Set(prev),
            ]);
            setSelectedAddress(addr);
          }}
        />
      </Modal>
    </View>
  );
};

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  title: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 16,
    paddingHorizontal: 16,
    marginTop: 10,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginVertical: 12,
    paddingHorizontal: 16,
  },

  summaryCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    padding: 14,
    borderRadius: 14,
    elevation: 4,
    marginBottom: 12,
  },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },

  summaryName: {
    color: '#444',
    fontWeight: '600',
  },

  summaryPrice: {
    fontWeight: '700',
    color: '#333',
  },

  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 8,
  },

  totalLabel: {
    fontSize: 16,
    fontWeight: '800',
  },

  totalValue: {
    fontSize: 16,
    fontWeight: '900',
    color: BRAND,
  },

  addressCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f9fafb',
    padding: 14,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },

  addressSelected: {
    borderColor: BRAND,
    backgroundColor: '#FFF7ED',
  },

  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: BRAND,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },

  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: BRAND,
  },

  addressText: {
    flex: 1,
    color: '#333',
    fontSize: 14,
    lineHeight: 20,
  },

  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 20,
  },

  addAddressBtn: {
    marginHorizontal: 16,
    marginTop: 10,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BRAND,
    alignItems: 'center',
  },

  addAddressText: {
    color: BRAND,
    fontWeight: '700',
  },

  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#eee',
  },

  payBtn: {
    backgroundColor: BRAND,
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
  },

  payText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
  },
});

export default BillingAddressScreen;
