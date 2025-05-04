import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Modal,
  TextInput,
} from "react-native";
import ImageViewing from "react-native-image-viewing";
import RazorpayCheckout from 'react-native-razorpay';
import RNPickerSelect from "react-native-picker-select";
import DateTimePicker from "@react-native-community/datetimepicker";
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
  import { useNavigation } from "@react-navigation/native";
  import PaymentSuccessModal from "./PaymentSuccessModal";



const screenWidth = Dimensions.get("window").width;

const ProductDetails = ({ route }) => {
const { product } = route.params || {};
const [giftModalVisible, setGiftModalVisible] = useState(false);
const [showFullDescription, setShowFullDescription] = useState(false);
const [isDescriptionTruncated, setIsDescriptionTruncated] = useState(false);
 const navigation = useNavigation();

const [formStep, setFormStep] = useState(1);
const [formData, setFormData] = useState({
  name: "",
  phone: "",
  relation: "",
  occasion: "",
  date: "",
  flatNo: "",
  apartment: "",
  landmark: "",
  district: "",
  state: "",
  pincode: "",
});
const [showDatePicker, setShowDatePicker] = useState(false);
const [paymentDetails, setPaymentDetails] = useState({
  amount: 0,
  paymentId: "",
  paymentMode: "",
  createdAt: "",
});

const handleInputChange = (key, value) => {
  setFormData({ ...formData, [key]: value });
};
const [showModal, setShowModal] = useState(false);
const openRazorpay = async () => {
  const amountInPaise = product.price * 100;
  const userDataString = await AsyncStorage.getItem('userData');
  const userData = JSON.parse(userDataString);
  const userId = userData.id

  try {
    const orderResponse = await fetch('https://easyshop-7095.onrender.com/api/v1/users/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: 'INR',
      }),
    });
    const orderData = await orderResponse.json();
    const options = {
      description: 'Purchase Product',
      currency: 'INR',
      key: 'rzp_test_Zr4AoaaUCDwWjy',
      amount: 499,
      name: 'Wish and Surprise',
      order_id: orderData.orderId, // Ensure this matches the backend response
      prefill: {
        email: 'test@example.com',
        contact: '9876543210',
        name: 'Test User',
      },
      theme: { color: '#F37254' },
    };

    RazorpayCheckout.open(options)
    .then((data) => {
      return fetch('https://easyshop-7095.onrender.com/api/v1/users/save-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpay_payment_id: data.razorpay_payment_id,
          razorpay_order_id: data.razorpay_order_id,
          razorpay_signature: data.razorpay_signature,
          productId: product.id,
          amount: amountInPaise / 100,
          userId: userId,
        }),
      });
    })
    .then(response => response.json())
    .then(result => {
      // Set the modal visibility to true after a successful payment
      setShowModal(true);
      
      
      setPaymentDetails({
        amount: amountInPaise/ 100,
        paymentId: result.paymentId,
        paymentMode: 'Netbanking', 
        createdAt: result.createdAt, 
      });
      
    })
    .catch(error => {
      console.error('Error saving payment:', error);
    });
  
  } catch (err) {
    console.error('Error initiating Razorpay payment:', err);
  }
};
  if (!product || Object.keys(product).length === 0) {
    return (
      <View style={styles.container}>
        <Text style={{ fontSize: 18, color: "red" }}>No product data found</Text>
      </View>
    );
  }
  const [mainImage, setMainImage] = useState(product.image || "https://via.placeholder.com/250");
  const [modalVisible, setModalVisible] = useState(false);

  const imageList = [mainImage, ...(product.images || [])].map((uri) => ({ uri }));

  
  const closeModal = () => {
    setShowModal(false);  
    navigation.navigate('MyBottomTab')
  };
  
  return (
    <ScrollView style={styles.container}>
      {/* Main Image - open viewer on press */}
  
      <TouchableOpacity onPress={() => setModalVisible(true)}>
        <Image source={{ uri: mainImage }} style={styles.productImage} />
      </TouchableOpacity>

      {/* Fullscreen Modal Viewer */}
      <ImageViewing
        images={imageList}
        imageIndex={0}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      />
    <PaymentSuccessModal
  isOpen={showModal}
  amount={paymentDetails.amount}
  paymentId={paymentDetails.paymentId}
  paymentMode={paymentDetails.paymentMode}
  createdAt={paymentDetails.createdAt}
  onClose={() => closeModal()}
/>
      {/* Gallery Thumbnails */}
      {Array.isArray(product.images) && product.images.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbnailContainer}>
          {product.images.map((imgUri, index) => (
            <TouchableOpacity key={index} onPress={() => setMainImage(imgUri)}>
              <Image source={{ uri: imgUri }} style={styles.thumbnail} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
      <Text style={styles.productName}>{product.name}</Text>
      <Text style={styles.brand}>Brand: {product.brand}</Text>
      <Text style={styles.category}>
        Category: {product.category?.name || product.category || "Unknown"}
      </Text>
      <View style={styles.priceAndButtonsContainer}>
  <Text style={styles.price}>Price: ${product.price}</Text>

  <View style={styles.buttonsRow}>
    <TouchableOpacity style={[styles.smallButton]} onPress={() => setGiftModalVisible(true)}>
      <Text style={styles.buttonText}>Gift</Text>
    </TouchableOpacity>

    <TouchableOpacity style={[styles.smallButton, { backgroundColor: "green" }]} onPress={openRazorpay}>
      <Text style={styles.buttonText}>Buy</Text>
    </TouchableOpacity>
  </View>
</View>
      <Text style={styles.stock}>In Stock: {product.countInStock}</Text>
      <Text style={styles.rating}>Rating: {product.rating} ⭐</Text>
      <View style={{ marginTop: 10 }}>
  <Text
    style={styles.description}
    numberOfLines={showFullDescription ? undefined : 5}
    onTextLayout={(e) => {
      // Only check truncation when NOT expanded
      if (!showFullDescription) {
        setIsDescriptionTruncated(e.nativeEvent.lines.length > 5);
      }
    }}
  >
    {product.description || "No description available."}
  </Text>


  {isDescriptionTruncated && (
    <TouchableOpacity
      onPress={() => setShowFullDescription(!showFullDescription)}
      style={{ flexDirection: "row", alignItems: "center", marginTop: 5 }}
    >
      <Icon
        name={showFullDescription ? "expand-less" : "expand-more"}
        size={24}
        color="#007bff"
      />
      <Text style={{ color: "#007bff", marginLeft: 5 }}>
        {showFullDescription ? "Show Less" : "Read More"}
      </Text>
    </TouchableOpacity>
  )}
</View>
<Modal
  animationType="slide"
  transparent={true}
  visible={giftModalVisible}
  onRequestClose={() => {
    setGiftModalVisible(false);
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
              { backgroundColor: formStep >= s ? "#007bff" : "#ccc" },
            ]}
          />
        ))}
      </View>

      {/* Step Descriptions */}
      <Text style={styles.modalTitle}>Step {formStep}</Text>
      {formStep === 1 && <Text style={styles.modalText}>Enter recipient's basic contact information.</Text>}
      {formStep === 2 && <Text style={styles.modalText}>Specify your relationship and the occasion.</Text>}
      {formStep === 3 && <Text style={styles.modalText}>Provide the building and location details.</Text>}
      {formStep === 4 && <Text style={styles.modalText}>Finish with district, state, and pincode.</Text>}

      {/* Step 1 */}
      {formStep === 1 && (
        <>
          <Text style={styles.label}>Name</Text>
          <TextInput
            placeholder="Enter recipient's name"
            style={styles.input}
            value={formData.name}
            onChangeText={(text) => handleInputChange("name", text)}
          />
          <Text style={styles.label}>Phone</Text>
          <TextInput
            placeholder="Enter phone number"
            keyboardType="phone-pad"
            style={styles.input}
            value={formData.phone}
            onChangeText={(text) => handleInputChange("phone", text)}
          />
        </>
      )}

      {/* Step 2 */}
      {formStep === 2 && (
  <>
    <Text style={styles.label}>Relation</Text>
    <RNPickerSelect
      onValueChange={(value) => handleInputChange("relation", value)}
      value={formData.relation}
      items={[
        { label: "Friend", value: "Friend" },
        { label: "Brother", value: "Brother" },
        { label: "Sister", value: "Sister" },
        { label: "Mother", value: "Mother" },
        { label: "Father", value: "Father" },
      ]}
      placeholder={{ label: "Select a relation", value: null }}
      style={pickerSelectStyles}
    />

    <Text style={styles.label}>Occasion</Text>
    <RNPickerSelect
      onValueChange={(value) => handleInputChange("occasion", value)}
      value={formData.occasion}
      items={[
        { label: "Birthday", value: "Birthday" },
        { label: "Anniversary", value: "Anniversary" },
        { label: "Wedding", value: "Wedding" },
        { label: "Graduation", value: "Graduation" },
        { label: "Festival", value: "Festival" },
      ]}
      placeholder={{ label: "Select an occasion", value: null }}
      style={pickerSelectStyles}
    />

    <Text style={styles.label}>Date</Text>
    <TouchableOpacity
      style={[styles.input, { justifyContent: "center" }]}
      onPress={() => setShowDatePicker(true)}
    >
      <Text>{formData.date || "Select date"}</Text>
    </TouchableOpacity>
    {showDatePicker && (
      <DateTimePicker
        mode="date"
        display="default"
        value={new Date()}
        onChange={(event, selectedDate) => {
          setShowDatePicker(false);
          if (selectedDate) {
            const year = selectedDate.getFullYear();
            const month = String(selectedDate.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
            const day = String(selectedDate.getDate()).padStart(2, '0');
            const formattedDate = `${year}-${month}-${day}`; // yyyy-mm-dd
            handleInputChange("date", formattedDate);
          }
        }}
      />
    )}
  </>
)}
      {/* Step 3 */}
      {formStep === 3 && (
        <>
          <Text style={styles.label}>Flat No.</Text>
          <TextInput
            placeholder="Enter flat number"
            style={styles.input}
            value={formData.flatNo}
            onChangeText={(text) => handleInputChange("flatNo", text)}
          />
          <Text style={styles.label}>Apartment</Text>
          <TextInput
            placeholder="Apartment name"
            style={styles.input}
            value={formData.apartment}
            onChangeText={(text) => handleInputChange("apartment", text)}
          />
          <Text style={styles.label}>Landmark</Text>
          <TextInput
            placeholder="Nearby landmark"
            style={styles.input}
            value={formData.landmark}
            onChangeText={(text) => handleInputChange("landmark", text)}
          />
        </>
      )}

      {/* Step 4 */}
      {formStep === 4 && (
        <>
          <Text style={styles.label}>District</Text>
          <TextInput
            placeholder="Enter district"
            style={styles.input}
            value={formData.district}
            onChangeText={(text) => handleInputChange("district", text)}
          />
          <Text style={styles.label}>State</Text>
          <TextInput
            placeholder="Enter state"
            style={styles.input}
            value={formData.state}
            onChangeText={(text) => handleInputChange("state", text)}
          />
          <Text style={styles.label}>Pincode</Text>
          <TextInput
            placeholder="Enter pincode"
            keyboardType="numeric"
            style={styles.input}
            value={formData.pincode}
            onChangeText={(text) => handleInputChange("pincode", text)}
          />
        </>
      )}

      {/* Navigation Buttons */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", width: "100%" }}>
        {formStep > 1 && (
          <TouchableOpacity
            style={[styles.button, { flex: 1, marginRight: 5 }]}
            onPress={() => setFormStep(formStep - 1)}
          >
            <Text style={styles.buttonText}>Back</Text>
          </TouchableOpacity>
        )}
        {formStep < 4 ? (
          <TouchableOpacity
            style={[styles.button, { flex: 1, marginLeft: formStep > 1 ? 5 : 0 }]}
            onPress={() => setFormStep(formStep + 1)}
          >
            <Text style={styles.buttonText}>Next</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.button, { flex: 1, marginLeft: 5 }]}
            onPress={async () => {
              const userDataString = await AsyncStorage.getItem('userData');
              const userData = JSON.parse(userDataString);
              try {
                const payload = {
                  name: formData.name,
                  phone: formData.phone,
                  relation: formData.relation,
                  occasion: formData.occasion,
                  date: formData.date,
                  flatNumber: formData.flatNo,
                  building: formData.apartment,
                  landmark: formData.landmark,
                  district: formData.district,
                  state: formData.state,
                  pincode: formData.pincode,
                  productId: product._id,
                  productName: product.name,
                  productPrice: product.price,
                  status: "pending",
                  feedback: [],
                  payment: false,
                  sharable: false,
                  userName: userData.id,
                  paymentlink: "",
                  sharablelink: "",
                  totalAmount: product.price,
                  remainingAmount: product.price,
                  noOfPayments: 0,
                };
              
                console.log("=====token---------"," 'Authorization':", `Bearer ${userData.token}`)
                const response = await axios.post('https://easyshop-7095.onrender.com/api/v1/giftrequests', payload, {
                  headers: {
                    'Content-Type': 'application/json',
                    'Token': `Bearer ${userData.token}`
                  }
                });
                if (response.status === 200 || response.status === 201) {
                  alert("Gift request submitted successfully!");
                  console.log("API Response:", response.data);
                  setGiftModalVisible(false);
                  setFormStep(1);
                  navigation.navigate('Request');
                } else {
                  alert("Failed to submit gift request. Try again.");
                }
              } catch (error) {
                console.error("Error submitting gift request:", error);
                alert("Error submitting gift request!");
              }
            }}
          >
            <Text style={styles.buttonText}>Submit</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  </View>
</Modal>



</ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  productImage: {
    width: "100%",
    height: 250,
    resizeMode: "contain",
    marginBottom: 10,
  },
  thumbnailContainer: {
    flexDirection: "row",
    marginBottom: 15,
  },
  thumbnail: {
    width: 60,
    height: 60,
    resizeMode: "cover",
    borderRadius: 5,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  productName: {
    fontSize: 22,
    fontWeight: "bold",
  },
  brand: {
    fontSize: 18,
    color: "gray",
  },
  category: {
    fontSize: 18,
    color: "blue",
  },
  price: {
    fontSize: 20,
    fontWeight: "bold",
    color: "green",
  },
  stock: {
    fontSize: 16,
    color: "red",
  },
  rating: {
    fontSize: 16,
    color: "gold",
  },
 
  button: {
    backgroundColor: "#007bff",
    padding: 12,
    borderRadius: 5,
    marginTop: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },

  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 5,
    justifyContent:'left'
  },
  progressContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
    width: "100%",
  },
  progressStep: {
    flex: 1,
    height: 6,
    marginHorizontal: 3,
    borderRadius: 3,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  modalText: {
    fontSize: 14,
    color: "#555",
    marginBottom: 15,
    textAlign: "center",
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: "#333",
  },
  priceAndButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 10,
  },
  buttonsRow: {
    flexDirection: "row",
    gap: 8,
  },
  smallButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    backgroundColor: "#007bff",
    marginLeft: 10,
  },

});

const pickerSelectStyles = {
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    color: "black",
    paddingRight: 30,
    marginBottom: 10,
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    color: "black",
    paddingRight: 30,
    marginBottom: 10,
  },
};


export default ProductDetails;
