import React, { useEffect, useState } from "react";
import { 
  View, Text, FlatList, StyleSheet, Image, TouchableOpacity, ScrollView, 
  Modal,
  TextInput
} from "react-native";
import { useSelector } from "react-redux";
import RNPickerSelect from "react-native-picker-select";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import RazorpayCheckout from 'react-native-razorpay';
import axios from "axios";
import normalizeUri from '../../utils/normalizeUri';

const ProductsScreen = ({ route }) => {
  const { categoryId } = route.params || {}; 

  const { items: products } = useSelector((state) => state.products);

  // Safely filter products
  const filteredProducts = (products || []).filter(
    (product) => product?.category_id === categoryId
  );

  return (
    <ScrollView style={styles.container}>
      {filteredProducts.length > 0 ? (
        filteredProducts.map((product) => <ProductCard key={product?.id || Math.random()} product={product} />)
      ) : (
        <Text style={styles.emptyText}>No products found</Text>
      )}
    </ScrollView>
  );
};
// Individual Product Card Component
const ProductCard = ({ product }) => {
  const [mainImage, setMainImage] = useState(product?.image);
  const [buyModalVisible, setBuyModalVisible] = useState(false);
  const [selectedProductForBuy, setSelectedProductForBuy] = useState(null);
const [userData, setUserData] = useState(null);
const [giftModalVisible, setGiftModalVisible] = useState(false);
const [formStep, setFormStep] = useState(1);
const handleInputChange = (key, value) => {
  setFormData({ ...formData, [key]: value });
};
 useEffect(() => {
    AsyncStorage.getItem("userData")
      .then((str) => {
        if (str) setUserData(JSON.parse(str));
      })
      .catch(console.error);
  }, []);
const navigation = useNavigation();
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
const [showModal, setShowModal] = useState(false);
const [paymentDetails, setPaymentDetails] = useState({
  amount: 0,
  paymentId: "",
  paymentMode: "",
  createdAt: "",
});

  return (
    <View style={styles.productCard}>
      {/* Main Image */}
      {mainImage ? (
        <Image source={{ uri: normalizeUri(mainImage) }} style={styles.productImage} />
      ) : (
        <View style={[styles.productImage, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text>No Image</Text>
        </View>
      )}

      {/* Thumbnails */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbnailContainer}>
        {/* {(product?.images || []).map((img, index) => (
          <TouchableOpacity key={index} onPress={() => setMainImage(img)}>
            <Image source={{ uri: normalizeUri(img) }} style={styles.thumbnail} />
          </TouchableOpacity>
        ))} */}
      </ScrollView>

      {/* Product Details */}
      <View style={styles.detailsContainer}>
        <Text style={styles.productName}>{product?.name || "Unnamed Product"}</Text>
        <Text style={styles.brandText}>Brand: {product?.brand || "Unknown"}</Text>
        <Text style={styles.categoryText}>Category: {product?.category_id || "Unknown"}</Text>
        <Text style={styles.priceText}>Price: ${product?.price ?? "N/A"}</Text>
        <Text style={styles.stockText}>
          {(product?.countInStock ?? 0) > 0 ? "In Stock" : "Out of Stock"}
        </Text>
        <Text style={styles.ratingText}>⭐ Rating: {product?.rating ?? "0"}/5</Text>
        <Text style={styles.description}>{product?.description || "No description available."}</Text>
      </View>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.sendGiftButton}
          onPress={() => setGiftModalVisible(true)}
        >
          <Text style={styles.buttonText}>Send Gift</Text>
        </TouchableOpacity>
        {/* <TouchableOpacity style={styles.buyNowButton} onPress={openRazorpay}>
          <Text style={styles.buttonText}>Buy Now</Text>
        </TouchableOpacity> */}
        <TouchableOpacity
                    style={styles.buyNowButton}
                    onPress={() => { setSelectedProductForBuy && setSelectedProductForBuy( product .product ||  product ); setBuyModalVisible && setBuyModalVisible(true); }}
                  >
                    <Text style={styles.buttonText}>Buy Now</Text>
                  </TouchableOpacity>
         {/* Modal */}
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
        {label:"Husband", value:"Husband"},
        {label:"Wife", value: "Wife"},
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
                  productId: product.id,
                  flatNumber: formData.flatNo,
                  building: formData.apartment,
                  landmark: formData.landmark,
                  district: formData.district,
                  state: formData.state,
                  pincode: formData.pincode,
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
              
                const response = await axios.post(`https://wishandsurprise.com/backend/gift_submit.php`, payload, {
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${userData.token}`
  }
});

                if (response.status === 200 || response.status === 201) {
                  alert("Gift request submitted successfully!");
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
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#ffffff",
  },
  productCard: {
    backgroundColor: "#f4f6f8",
    borderRadius: 16,
    padding: 16,
    marginVertical: 12,
    elevation: 4,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  productImage: {
    width: "100%",
    height: 250,
    borderRadius: 12,
    resizeMode: "cover",
  },
  thumbnailContainer: {
    flexDirection: "row",
    marginTop: 12,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginHorizontal: 4,
    borderWidth: 2,
    borderColor: "#ccc",
  },
  detailsContainer: {
    paddingVertical: 12,
  },
  productName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#333333",
  },
  brandText: {
    fontSize: 16,
    color: "#777",
    marginTop: 4,
  },
  categoryText: {
    fontSize: 16,
    color: "#777",
    marginTop: 2,
  },
  priceText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#e53935",
    marginTop: 6,
  },
  stockText: {
    fontSize: 16,
    color: "#4caf50",
    marginTop: 4,
  },
  ratingText: {
    fontSize: 16,
    color: "#ffa726",
    marginTop: 4,
  },
  description: {
    fontSize: 15,
    color: "#555555",
    marginTop: 12,
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 18,
  },
  sendGiftButton: {
    flex: 1,
    backgroundColor: "#ffb74d",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginRight: 8,
  },
  buyNowButton: {
    flex: 1,
    backgroundColor: "#42a5f5",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginLeft: 8,
  },
  button: {
    backgroundColor: "#1976d2",
    padding: 14,
    borderRadius: 8,
    marginTop: 16,
    alignItems: "center",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 30,
    fontSize: 16,
    color: "#aaa",
  },

  /** ✅ MODAL STYLES UPDATED **/
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: "#2196f3",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  

  // Label above each input
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
    marginBottom: 4,
  },

  // Standard text input style
  input: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f5f5f5',
    fontSize: 16,
    color: '#333',
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    // Android elevation
    elevation: 1,
  },

  // Focused state override (if you want to change border color on focus)
  inputFocused: {
    borderColor: '#1976d2',
    backgroundColor: '#ffffff',
  },

  // Error state override
  inputError: {
    borderColor: '#e53935',
  },

  // Placeholder text style (only for styling TextInput placeholder in RN)
  placeholderText: {
    color: '#888',
    fontStyle: 'italic',
  },

});

const pickerSelectStyles = {
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#bbb",
    borderRadius: 8,
    color: "#333",
    paddingRight: 30,
    backgroundColor: "#f0f0f0",
    marginBottom: 12,
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#bbb",
    borderRadius: 8,
    color: "#333",
    paddingRight: 30,
    backgroundColor: "#f0f0f0",
    marginBottom: 12,
  },
};

export default ProductsScreen;
