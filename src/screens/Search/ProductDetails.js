import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";

const ProductDetails = ({ route }) => {
  console.log("Route Params:", JSON.stringify(route.params, null, 2));

  const { product } = route.params || {}; // Prevent crash

  if (!product || Object.keys(product).length === 0) {
    return (
      <View style={styles.container}>
        <Text style={{ fontSize: 18, color: "red" }}>No product data found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Safe Image Fallback */}
      <Image
        source={{ uri: product.image || "https://via.placeholder.com/250" }}
        style={styles.productImage}
      />
      <Text style={styles.productName}>{product.name}</Text>
      <Text style={styles.brand}>Brand: {product.brand}</Text>

      {/* Safe Category Fallback */}
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
      <TouchableOpacity style={[styles.button, { backgroundColor: "green" }]}>
        <Text style={styles.buttonText}>Buy Now</Text>
      </TouchableOpacity>
    </View>
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
