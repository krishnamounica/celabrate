import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Linking,
} from 'react-native';
import { useSelector } from 'react-redux';
// import { useNavigation } from '@react-navigation/native';

const RequestsScreen = ({ route }) => {
  const [storedRequests, setStoredRequests] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const reduxRequests = useSelector((state) => state.user.user?.requests || []);
  const { updatedRequests } = route.params || {};
  // const navigation = useNavigation();

  const fetchStoredRequests = async () => {
    try {
      const storedUserData = await AsyncStorage.getItem('userData');
      if (storedUserData) {
        const parsedData = JSON.parse(storedUserData);
        setStoredRequests(parsedData.requests || []);
      }
    } catch (error) {
      console.error('Error fetching data from AsyncStorage:', error);
    }
  };

  useEffect(() => {
    fetchStoredRequests();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchStoredRequests();
    setRefreshing(false);
  };
  const handleShareOnWhatsApp = (message) => {
    const encodedMessage = encodeURIComponent(message); // Encode special characters
    const whatsappURL = `https://wa.me/?text=${encodedMessage}`; // Open WhatsApp with pre-filled message
  
    Linking.openURL(whatsappURL).catch((err) =>
      console.error('Error opening WhatsApp:', err)
    );
  };
  const displayRequests = updatedRequests || storedRequests || reduxRequests;
// console.log(displayRequests,"====displayRequests====")
  return (
    <FlatList
      data={displayRequests}
      keyExtractor={(item, index) => index.toString()}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
      renderItem={({ item, index }) => (
       
        <View style={styles.requestItem}>
          {/* { console.log("=====item",item,index)} */}
          <Text style={styles.descriptionText}>
            {item.userName} has created a request for {item.name} to send a surprise gift "{item.productName}" costing ₹{item.productPrice} for his {item.relation}'s birthday. The delivery is planned for Pincode {item.pincode}, {item.state}, and the contact phone number provided is {item.phone}. The celebration is planned for {new Date(item.date).toLocaleDateString()}.
          </Text>

          <Text style={styles.statusText}>
            Status: {item.status}
          </Text>

          {/* Conditional message based on the status */}
          {item.status === "pending" && (
            <Text style={styles.statusText}>
              The payment link is available once status is approved only.
            </Text>
          )}
          
    

{item.payment === true && (
  <TouchableOpacity
    style={styles.whatsappButton}
    onPress={() => handleShareOnWhatsApp(item.sharablelink)}
  >
    <Text style={styles.statusText}>Share on WhatsApp</Text>
  </TouchableOpacity>
)}


          

          {/* Show payment button only if the request is approved */}
          {item.status === "approved" && (
            // <TouchableOpacity
            //   style={styles.payButton}
            //   onPress={() =>
            //     navigation.navigate('PaymentScreen', {
            //       productName: item.productName,
            //       productPrice: item.productPrice,
            //       remaingamount:item.remaingamount,
            //       rowId: index,
            //       id: item.id,
            //     })
            //   }
            // >
              <Text style={styles.payButtonText}>Make Payment</Text>
            // </TouchableOpacity>
          )
          }
        </View>
      )}
    />
  );
};

export default RequestsScreen;

const styles = StyleSheet.create({
  requestItem: {
    backgroundColor: '#f9f9f9',
    padding: 20,
    marginVertical: 10,
    marginHorizontal: 16,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#dcdcdc',
  },
  descriptionText: {
    fontSize: 16,
    color: '#4a4a4a',
    lineHeight: 22,
    marginBottom: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
    color:'black'
  },
  payButton: {
    backgroundColor: '#6200ea',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  payButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  whatsappButton: {
    backgroundColor: '#25D366', // WhatsApp green
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  statusText: {
    color: 'black',
    fontWeight: 'bold',
  },
});
