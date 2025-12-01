import axios from "axios";
import React, { useState ,useEffect } from "react";
import { View, Text, Image, FlatList, StyleSheet, ScrollView,ActivityIndicator, TouchableOpacity} from "react-native";
import normalizeUri from '../utils/normalizeUri';
import { useNavigation } from "@react-navigation/native";

const RelationshipScreen = () => {
  const [relationships, setRelationships] = useState([]);
  const [loading, setLoading] = useState(true);
 const navigation = useNavigation();
  useEffect(() => {
    fetchRelationships();
  }, []);
  const BASE_URL = "https://wishandsurprise.com/backend"; // or http://10.0.2.2:3000 if you're on Android emulator

  const fetchRelationships = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/get-categories.php`);
      const filteredData = response.data
        .filter(item => item.block === "relation")
        .map(item => ({
          ...item,
          image: `${BASE_URL}/${item.image}`,
        }));
      setRelationships(filteredData);
    } catch (error) {
      console.error("Error fetching relationships:", error);
    } finally {
      setLoading(false);
    }
  };
  const handleCategoryPress = (item) => {
    if (item?.id) {
      navigation.navigate("ProductsScreen", { categoryId: item.id });
    }
  };

  return (
    // Outer container with enhanced styling
    <View style={styles.outerContainer}>
      <Text style={styles.header}>For Every Relationship</Text>
      {loading ? "...loading" :<FlatList
        data={relationships}
        keyExtractor={(item) => item.id}
        numColumns={3}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
  <TouchableOpacity
    style={styles.itemContainer}
    onPress={() => handleCategoryPress(item)}
  >
    <View style={styles.imageContainer}>
      <Image source={{ uri: normalizeUri(item.image) }} style={styles.image} />
    </View>
    <Text style={styles.label}>{item.name}</Text>
  </TouchableOpacity>
)}

      />}
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    backgroundColor: "#e8f5e9",      // Soft light green background
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    // borderColor: "#c8e6c9",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 15, // Ensures spacing when used in App.js section container
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#2e7d32",
  },
  listContainer: {
    // paddingBottom: 20,
    alignItems: "center",
  },
  itemContainer: {
  alignItems: "center",
  margin: 10,
  width: 100, // to align consistently in 3 columns
},
imageContainer: {
  width: 90,
  height: 90,
  borderRadius: 45,
  overflow: "hidden", // important to clip inner content
  backgroundColor: "#fff", // optional clean background
  justifyContent: "center",
  alignItems: "center",
  elevation: 3,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
},
image: {
  width: "100%",
  height: "100%",
  resizeMode: "cover",
},

  label: {
    marginTop: 5,
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },
});

export default RelationshipScreen;
