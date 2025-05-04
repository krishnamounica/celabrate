import React from "react";
import { View, Text, FlatList, StyleSheet, StatusBar, TouchableOpacity } from "react-native";
import { useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import Header from "../Home/Header";

const CategoryList = () => {
  const { items: products } = useSelector((state) => state.products);
  const navigation = useNavigation();
  // Extract unique categories safely
  const categories = Array.from(
    new Map(
      (products || []) // in case products is undefined
        .filter((product) => product?.category?.id) // safe filtering
        .map((product) => [product.category.id, product.category])
    )
  ).map(([_, category]) => category);

  const handleCategoryPress = (item) => {
    if (item?.id) {
      navigation.navigate("ProductsScreen", { categoryId: item.id });
    }
  };

  return (
    <View style={styles.container}>
      <Header />
      <FlatList
        data={categories}
        keyExtractor={(item) => item?.id?.toString() || Math.random().toString()}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={[styles.categoryBox, { backgroundColor: item?.color || "#ccc" }]}
            onPress={() => handleCategoryPress(item)}
          >
            <Text style={styles.categoryText}>{item?.name || "Unnamed"}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
    paddingTop: StatusBar.currentHeight,
    backgroundColor: "#f5f5f5",
  },
  categoryBox: {
    padding: 15,
    marginVertical: 10,
    borderRadius: 12,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  categoryText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    textTransform: "uppercase",
  },
});

export default CategoryList;
