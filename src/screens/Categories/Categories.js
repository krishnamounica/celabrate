import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import Header from '../Home/Header';
import withSplashScreen from '../../navigation/withSplashScreen';

const screenWidth = Dimensions.get('window').width;
const cardWidth = (screenWidth - 40) / 3; // 3 items per row with margin

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  const handleCategoryPress = (item) => {
    if (item?.id) {
      navigation.navigate("ProductsScreen", { categoryId: item.id });
    }
  };

  useEffect(() => {
    fetch('https://wishandsurprise.com/backend/get-categories.php')
      .then((res) => res.json())
      .then((data) => {
        const filtered = data.filter(item => item.image && item.image !== null);
        setCategories(filtered);
        console.log(filtered);
      })
      .catch((err) => console.error('API error:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color="#ff7a00" style={styles.loader} />;
  }

  return (
    <SafeAreaView style={styles.safeContainer}>
      {/* Fixed Header */}
     <Header />

      {/* Scrollable Content */}
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.headerText}>Explore by Category</Text>

        <View style={styles.grid}>
          {categories.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.itemContainer}
              onPress={() => handleCategoryPress(item)}
            >
              <View style={styles.card}>
                <Image
                  source={{ uri: `https://wishandsurprise.com/backend/${item.image}` }}
                  style={styles.image}
                  resizeMode="cover"
                />
              </View>
              <View style={styles.labelBox}>
                <Text style={styles.name} numberOfLines={1}>
                  {item.name}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#fffefb',
  },
  headerWrapper: {
  backgroundColor: '#ffe5b4', // Light orange highlight
  borderRadius: 10,
  padding: 8,
  marginBottom: 12,
  elevation: 3,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
},

  container: {
    paddingHorizontal: 10,
    paddingBottom: 30,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ff7a00',
    textAlign: 'center',
    marginVertical: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  itemContainer: {
    alignItems: 'center',
    marginBottom: 25,
    width: cardWidth,
  },
  card: {
    width: 90,
    height: 90,
    borderRadius: 45,
    overflow: 'hidden',
    backgroundColor: '#fff7ec',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  labelBox: {
    marginTop: 8,
    backgroundColor: '#ffedd5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  name: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  loader: {
    marginTop: 50,
  },
});

export default withSplashScreen(CategoryList);
