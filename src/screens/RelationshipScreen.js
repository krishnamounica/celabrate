import React from "react";
import { View, Text, Image, FlatList, StyleSheet, ScrollView } from "react-native";

const relationships = [
  { id: "1", name: "men", image: require("../../src/assets/images/men.png") },
  { id: "2", name: "women", image: require("../../src/assets/images/women.png") },
  { id: "3", name: "kids", image: require("../../src/assets/images/kids.png") },
  { id: "4", name: "Friend", image: require("../../src/assets/images/friend.png") },
  { id: "5", name: "Girlfriend", image: require("../../src/assets/images/girlfriend.png") },
  { id: "6", name: "Boyfriend", image: require("../../src/assets/images/boyfriend.png") },
  { id: "7", name: "Wife", image: require("../../src/assets/images/wife.png") },
  { id: "8", name: "Husband", image: require("../../src/assets/images/husband.png") },
];

const RelationshipScreen = () => {
  return (
    // Outer container with enhanced styling
    <View style={styles.outerContainer}>
      <Text style={styles.header}>For Every Relationship</Text>
      <FlatList
        data={relationships}
        keyExtractor={(item) => item.id}
        numColumns={3}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <View style={styles.imageContainer}>
              <Image source={item.image} style={styles.image} />
            </View>
            <Text style={styles.label}>{item.name}</Text>
          </View>
        )}
      />
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
    borderColor: "#c8e6c9",
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
    paddingBottom: 20,
    alignItems: "center",
  },
  itemContainer: {
    alignItems: "center",
    margin: 10,
  },
  imageContainer: {
    width: 90,
    height: 90,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 45,
    backgroundColor: "#F0F0F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  label: {
    marginTop: 5,
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },
});

export default RelationshipScreen;
