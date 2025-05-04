import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, Image, useColorScheme 
} from 'react-native';
import { useSelector } from 'react-redux';

const Categories = () => {
  const colorScheme = useColorScheme();
  const { items: products, loading, error } = useSelector(state => state.products);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Extract unique category names (ensure category is a string)
  const categories = products && Array.isArray(products)
    ? [...new Set(products.map((product) => 
        typeof product.category === 'string' ? product.category : product.category?.name
      ))]
      .filter(Boolean) // Remove undefined/null values
      .map((category, index) => ({
        id: String(index + 1),
        name: category,
        // icon: require('../../assets/burger.jpg'), // Static image for now
      }))
    : [];

  return (
    <View style={[
      styles.container,
      {backgroundColor: '#fff'}
    ]}>

      {/* Header with "View All" */}
      <View style={styles.header}>
        <Text style={styles.title}>Top Categories</Text>
        <TouchableOpacity>
          <Text style={styles.viewAll}>View All</Text>
        </TouchableOpacity>
      </View>

      {/* Categories List */}
      {categories.length > 0 ? (
        <FlatList
          data={categories}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={[
                styles.categoryCard,
                selectedCategory === item.id && styles.selectedCategory
              ]}
              onPress={() => setSelectedCategory(item.id)}
              activeOpacity={0.7}
            >
              <Image source={item.icon} style={styles.icon} />
              <Text style={styles.categoryText}>{item.name}</Text>
            </TouchableOpacity>
          )}
        />
      ) : (
        <Text style={styles.noCategories}>No categories available</Text>
      )}
    </View>
  );
};

export default Categories;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 15,
    marginTop: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF5733',
  },
  viewAll: {
    fontSize: 14,
    color: '#007BFF',
    fontWeight: 'bold',
  },
  categoryCard: {
    backgroundColor: '#F8F8F8',
    padding: 15,
    marginRight: 12,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    width: 90,
  },
  selectedCategory: {
    backgroundColor: '#FF5733',
  },
  icon: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
  categoryText: {
    marginTop: 5,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  noCategories: {
    textAlign: 'center',
    color: '#888',
    fontSize: 16,
    marginTop: 10,
  },
});
