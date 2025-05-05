import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import axios from 'axios';

const GiftDetailsScreen = ({ route }) => {
  const { id } = route.params; // get gift ID from navigation
  console.log(id,"=========")
  // '68160802bace24e9c7b555dc'
 
  const [gift, setGift] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGift();
  }, []);
  useEffect(() => {
    if (route.params?.id) {
      console.log('Deep link ID:', route.params.id);  // Log the received ID
    }
  }, [route]);

  const fetchGift = async () => {
    try {
      const response = await axios.get(`https://easyshop-7095.onrender.com/api/v1/giftrequests/gift/${id}`);
      setGift(response.data.gift);
    } catch (error) {
      console.error('Error fetching gift:', error);
      Alert.alert('Error', 'Failed to fetch gift details.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <ActivityIndicator style={{ flex: 1 }} size="large" color="#000" />;
  }

  if (!gift) {
    return (
      <View style={styles.center}>
        <Text>No gift found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🎁 Gift for {gift.name}</Text>

      <Section title="Recipient Info">
        <Item label="Name" value={gift.name} />
        <Item label="Phone" value={gift.phone} />
        <Item label="Relation" value={gift.relation} />
        <Item label="Occasion" value={gift.occasion} />
        <Item label="Date" value={new Date(gift.date).toDateString()} />
      </Section>

      <Section title="Delivery Address">
        <Item label="Flat Number" value={gift.flatNumber} />
        <Item label="Building" value={gift.building} />
        <Item label="Landmark" value={gift.landmark} />
        <Item label="District" value={gift.district} />
        <Item label="State" value={gift.state} />
        <Item label="Pincode" value={gift.pincode} />
      </Section>

      <Section title="Product Info">
        <Item label="Product Name" value={gift.productName} />
        <Item label="Product Price" value={`₹${gift.productPrice}`} />
      </Section>

      <Section title="Payment">
        <Item label="Status" value={gift.status} />
        <Item label="Payment" value={gift.payment ? 'Paid ✅' : 'Unpaid ❌'} />
        <Item label="Total Amount" value={`₹${gift.totalAmount}`} />
        <Item label="Remaining Amount" value={`₹${gift.remainingAmount}`} />
        <Item label="No. of Payments" value={gift.noOfPayments?.toString()} />
        <Item label="Payment Amount" value={`₹${gift.paymentAmount}`} />
      </Section>

      <Section title="Links">
        <Item label="Payment Link" value={gift.paymentlink || 'Not generated'} />
        <Item label="Sharable Link" value={gift.sharablelink || 'Not generated'} />
      </Section>
    </ScrollView>
  );
};

const Section = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

const Item = ({ label, value }) => (
  <View style={styles.itemRow}>
    <Text style={styles.label}>{label}:</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#FAFAFA',
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
    color: '#333',
  },
  section: {
    marginBottom: 20,
    padding: 12,
    backgroundColor: '#FFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#555',
  },
  itemRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    fontWeight: '500',
    width: 140,
    color: '#444',
  },
  value: {
    flex: 1,
    color: '#111',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default GiftDetailsScreen;
