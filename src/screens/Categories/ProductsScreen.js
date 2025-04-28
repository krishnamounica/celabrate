import React, { useState } from "react";
import { 
  View, Text, FlatList, StyleSheet, Image, TouchableOpacity, ScrollView 
} from "react-native";
import { useSelector } from "react-redux";

const ProductsScreen = ({ route }) => {
  const { categoryId } = route.params || {}; // safe destructure
  console.log(categoryId)
  const { items: products } = useSelector((state) => state.products);

  // Safely filter products
  const filteredProducts = (products || []).filter(
    (product) => product?.category?.id === categoryId
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

  return (
    <View style={styles.productCard}>
      {/* Main Image */}
      {mainImage ? (
        <Image source={{ uri: mainImage }} style={styles.productImage} />
      ) : (
        <View style={[styles.productImage, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text>No Image</Text>
        </View>
      )}

      {/* Thumbnails */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbnailContainer}>
        {(product?.images || []).map((img, index) => (
          <TouchableOpacity key={index} onPress={() => setMainImage(img)}>
            <Image source={{ uri: img }} style={styles.thumbnail} />
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Product Details */}
      <View style={styles.detailsContainer}>
        <Text style={styles.productName}>{product?.name || "Unnamed Product"}</Text>
        <Text style={styles.brandText}>Brand: {product?.brand || "Unknown"}</Text>
        <Text style={styles.categoryText}>Category: {product?.category?.name || "Unknown"}</Text>
        <Text style={styles.priceText}>Price: ${product?.price ?? "N/A"}</Text>
        <Text style={styles.stockText}>
          {(product?.countInStock ?? 0) > 0 ? "In Stock" : "Out of Stock"}
        </Text>
        <Text style={styles.ratingText}>⭐ Rating: {product?.rating ?? "0"}/5</Text>
        <Text style={styles.description}>{product?.description || "No description available."}</Text>
      </View>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.sendGiftButton}>
          <Text style={styles.buttonText}>Send Gift</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buyNowButton}>
          <Text style={styles.buttonText}>Buy Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#fff",
  },
  productCard: {
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 15,
    marginVertical: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  productImage: {
    width: "100%",
    height: 250,
    borderRadius: 10,
    resizeMode: "cover",
  },
  thumbnailContainer: {
    flexDirection: "row",
    marginTop: 10,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginHorizontal: 5,
    borderWidth: 2,
    borderColor: "#ddd",
  },
  detailsContainer: {
    paddingVertical: 10,
  },
  productName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  brandText: {
    fontSize: 16,
    color: "#666",
  },
  categoryText: {
    fontSize: 16,
    color: "#666",
  },
  priceText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#d9534f",
    marginTop: 5,
  },
  stockText: {
    fontSize: 16,
    color: "#5cb85c",
    marginTop: 5,
  },
  ratingText: {
    fontSize: 16,
    color: "#f0ad4e",
    marginTop: 5,
  },
  description: {
    fontSize: 14,
    color: "#555",
    marginTop: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },
  sendGiftButton: {
    flex: 1,
    backgroundColor: "#ff9800",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginRight: 5,
  },
  buyNowButton: {
    flex: 1,
    backgroundColor: "#2196f3",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginLeft: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#999",
  },
});

export default ProductsScreen;
