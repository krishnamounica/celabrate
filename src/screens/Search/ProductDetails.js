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
} from "react-native";
import ImageViewing from "react-native-image-viewing";
import RazorpayCheckout from 'react-native-razorpay';

const screenWidth = Dimensions.get("window").width;

const ProductDetails = ({ route }) => {
  const { product } = route.params || {};
  const openRazorpay = () => {
    const amountInPaise = product.price * 100; // Razorpay needs amount in paise
  
    const options = {
      description: 'Purchase Product',
      currency: 'INR',
      key: 'rzp_test_Zr4AoaaUCDwWjy', // Replace with your Razorpay test key
      amount: amountInPaise.toString(),
      name: 'YourAppName',
      prefill: {
        email: 'test@example.com',
        contact: '9876543210',
        name: 'Test User',
      },
      theme: { color: '#F37254' },
    };
  
    RazorpayCheckout.open(options)
      .then((data) => {
        alert(`Success: ${data.razorpay_payment_id}`);
        // Optionally, call backend to verify/capture payment
      })
      .catch((error) => {
        alert(`Payment Failed: ${error.code} | ${error.description}`);
      });
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

      <Text style={styles.price}>Price: ${product.price}</Text>
      <Text style={styles.stock}>In Stock: {product.countInStock}</Text>
      <Text style={styles.rating}>Rating: {product.rating} ⭐</Text>
      <Text style={styles.description}>{product.description}</Text>

      {/* Buttons */}
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Send Gift</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, { backgroundColor: "green" }]} onPress={openRazorpay}>
  <Text style={styles.buttonText}>Buy Now</Text>
</TouchableOpacity>

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
  description: {
    fontSize: 14,
    marginTop: 10,
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
});

export default ProductDetails;
