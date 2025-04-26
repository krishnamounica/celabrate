import React, { useEffect } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProducts } from '../redux/productSlice';
import { useNavigation } from '@react-navigation/native';

const ProductListScreen = () => {
  const dispatch = useDispatch();
  const { items: products, loading, error } = useSelector(state => state.products);
  const navigation = useNavigation()

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#FF6347" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load products.</Text>
      </View>
    );
  }

  const renderItem = ({ item }) => {
    if (!item) return null;

    const discountedPrice = item.price || 0;
    const mrp = discountedPrice + 100;
    const discount = (mrp - discountedPrice).toFixed(0);
    const productName = item.name?.length > 30 ? `${item.name.substring(0, 27)}...` : item.name;

    return (
      <View style={styles.card}>
        {/* Price Container */}
        <View style={styles.priceContainer}>
          <Text style={styles.price}>₹{discountedPrice.toFixed(2)}</Text>
        </View>
        <Text style={styles.mrp}>
          MRP <Text style={styles.strikeThrough}>₹{mrp.toFixed(2)}</Text>
        </Text>

        {/* Product Image */}
        <View style={styles.imageContainer}>
          <TouchableOpacity
                                          style={styles.resultItem}
                                          onPress={() => {navigation.navigate('ProductDetails', { product: item });
                                          }}
                                      >
          <Image
            source={{ uri: item.image || 'https://via.placeholder.com/150' }} // Placeholder if no image
            style={styles.image}
            onError={(e) => console.log('Image Load Error:', e.nativeEvent.error)} // Debugging
          />
          </TouchableOpacity>
          <View style={styles.offerTag}>
            <Text style={styles.offerText}>₹{discount} off</Text>
          </View>
        </View>

        {/* Delivery Time */}
        <Text style={styles.deliveryTime}>⏳ 3 Days</Text>

        {/* Product Name */}
        <Text style={styles.productName} numberOfLines={2}>
          {productName}
        </Text>

        {/* Stock Count */}
        <Text style={styles.stock}>Stock: {item.countInStock || 0}</Text>

        {/* Ratings */}
        <View style={styles.ratingContainer}>
          <Text style={styles.rating}>⭐ {item.rating || 0} ({item.numReviews || 0})</Text>
        </View>

        {/* Add to Cart Button */}
        <TouchableOpacity style={styles.addToCartButton}>
          <Text style={styles.addToCartText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Recent Products</Text>
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="blue" style={{ marginTop: 20 }} />
      ) : products.length === 0 ? (
        <Text style={styles.noProducts}>No products available</Text>
      ) : (

        <FlatList
        data={products}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item, index) => item._id ? item._id.toString() : index.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        snapToAlignment="start"
        decelerationRate="fast"
        snapToInterval={190} // card width + spacing
      />
      
      )}
      <View pointerEvents="none" style={styles.rightFade} />

    </View>
  );
};


const styles = StyleSheet.create({
  headerContainer: {
    marginHorizontal: 10,
    marginBottom: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    // backgroundColor: '#f0f8ff', // AliceBlue for highlight
    padding: 10,
    // borderRadius: 10,
    // borderWidth: 1,
    // borderColor: '#00aaff',
  },
  noProducts: {
    textAlign: 'center',
    marginTop: 20,
  },
  // listContainer: {
  //   paddingHorizontal: 10,
  // },
  card: {
    width: 180,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    marginRight: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 5,
  
  },
  priceContainer: {
    backgroundColor: 'green',
    paddingVertical: 5,
    borderRadius: 5,
    alignItems: 'center',
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff'
  },
  mrp: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginTop: 5
  },
  strikeThrough: {
    textDecorationLine: 'line-through',
    color: 'red',
    fontWeight: 'bold'
  },
  imageContainer: {
    position: 'relative'
  },
  image: {
    width: '100%',
    height: 120,
    borderRadius: 5,
    marginVertical: 5
  },
  offerTag: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: 'green',
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  offerText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold'
  },
  deliveryTime: {
    fontSize: 12,
    color: '#888',
    marginVertical: 2,
    textAlign: 'center'
  },
  productName: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  stock: {
    fontSize: 12,
    color: '#555',
    textAlign: 'center',
    marginTop: 2
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 5
  },
  rating: {
    fontSize: 12,
    color: '#fff',
    backgroundColor: 'green',
    paddingHorizontal: 5,
    borderRadius: 5
  },
  addToCartButton: {
    backgroundColor: '#ff4081',
    padding: 10,
    borderRadius: 5,
    marginTop: 5,
    alignItems: 'center'
  },
  addToCartText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold'
  },

  listContainer: {
    paddingLeft: 10,
    paddingRight: 30, // allow room for gradient
  },
  rightFade: {
    position: 'absolute',
    top: 80, // adjust based on layout
    right: 0,
    height: 200, // adjust based on card height
    width: 30,
    backgroundColor: 'transparent',
    zIndex: 1,
    backgroundImage: 'linear-gradient(to left, white, rgba(255,255,255,0))', // iOS WebView way
  },
  
  
});

export default ProductListScreen;