import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import ImageViewing from "react-native-image-viewing";
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from "@react-navigation/native";
import GiftRequestModal from "../GiftRequestModal";

const screenWidth = Dimensions.get("window").width;

const ProductDetails = ({ route }) => {
  const { product } = route.params || {};
  const navigation = useNavigation();

  const [mainImage, setMainImage] = useState(product?.image || "https://via.placeholder.com/250");
  const [modalVisible, setModalVisible] = useState(false);
  const [giftModalVisible, setGiftModalVisible] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isDescriptionTruncated, setIsDescriptionTruncated] = useState(false);

  if (!product || Object.keys(product).length === 0) {
    return (
      <View style={styles.container}>
        <Text style={{ fontSize: 18, color: "red" }}>No product data found</Text>
      </View>
    );
  }

  const imageList = [mainImage, ...(product.images || [])].map((uri) => ({ uri }));

  return (
    <ScrollView style={styles.container}>
      {/* Product Main Image */}
      <TouchableOpacity onPress={() => setModalVisible(true)}>
        <Image source={{ uri: mainImage }} style={styles.productImage} />
      </TouchableOpacity>

      {/* Fullscreen Image Viewer */}
      <ImageViewing
        images={imageList}
        imageIndex={0}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      />

      {/* Image Thumbnails */}
      {Array.isArray(product.images) && product.images.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbnailContainer}>
          {product.images.map((imgUri, index) => (
            <TouchableOpacity key={index} onPress={() => setMainImage(imgUri)}>
              <Image source={{ uri: imgUri }} style={styles.thumbnail} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Product Info */}
      <Text style={styles.productName}>{product.name}</Text>
      <Text style={styles.brand}>Brand: {product.brand}</Text>
      <Text style={styles.category}>Category: {product.category?.name || product.category || "Unknown"}</Text>

      {/* Price & Buttons */}
      <View style={styles.priceAndButtonsContainer}>
        <Text style={styles.price}>Price: ${product.price}</Text>

        <View style={styles.buttonsRow}>
          <TouchableOpacity style={styles.smallButton} onPress={() => setGiftModalVisible(true)}>
            <Text style={styles.buttonText}>Gift</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.smallButton}
            onPress={() => navigation.navigate('BillingAddress', { product })}
          >
            <Text style={styles.buttonText}>Buy Now</Text>
          </TouchableOpacity>
        </View>
      </View>

      <GiftRequestModal
        visible={giftModalVisible}
        onClose={() => setGiftModalVisible(false)}
        product={product}
      />

      {/* Stock & Rating */}
      <Text style={styles.stock}>In Stock: {product.countInStock}</Text>
      <Text style={styles.rating}>Rating: {product.rating} ⭐</Text>

      {/* Description */}
      <View style={{ marginTop: 10 }}>
        <Text
          style={styles.description}
          numberOfLines={showFullDescription ? undefined : 5}
          onTextLayout={(e) => {
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
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: "#333",
  },
});

export default ProductDetails;
