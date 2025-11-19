import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Keyboard,
  Alert
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';

const Search = () => {
  const [searchText, setSearchText] = useState('');
  const [recentSearches, setRecentSearches] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const navigation = useNavigation();

  const { items: products } = useSelector(state => state.products);

  useEffect(() => {
    const loadRecentSearches = async () => {
      try {
        const history = await AsyncStorage.getItem('searchHistory');
        if (history) {
          setRecentSearches(JSON.parse(history));
        }
      } catch (error) {
        console.error('Failed to load search history:', error);
      }
    };
    loadRecentSearches();
  }, []);

  const handleSearchSubmit = async () => {
    if (!searchText.trim()) {
      Alert.alert('Invalid Search', 'Please enter a valid search term.');
      return;
    }
    try {
      const updatedSearches = [searchText, ...recentSearches].slice(0, 5);
      setRecentSearches(updatedSearches);
      await AsyncStorage.setItem('searchHistory', JSON.stringify(updatedSearches));
      setShowResults(true);
      Keyboard.dismiss();
    } catch (error) {
      console.error('Error saving search:', error);
    }
  };

  const filteredProducts = products?.filter(product =>
    product.name.toLowerCase().includes(searchText.toLowerCase())
  ) || [];

  const searchSuggestions = searchText.length > 0 ? filteredProducts.slice(0, 5) : [];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
        <TextInput
          placeholder="Search for products..."
          style={styles.searchInput}
          value={searchText}
          onChangeText={(text) => {
            setSearchText(text);
            setShowResults(false);
          }}
          onSubmitEditing={handleSearchSubmit}
          returnKeyType="search"
          blurOnSubmit={false}
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => setSearchText('')} style={styles.closeButton}>
            <Ionicons name="close" size={20} color="#888" />
          </TouchableOpacity>
        )}
      </View>

      {searchSuggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          {searchSuggestions.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.suggestionItem}
              onPress={() => {
                if (!item) {
                  Alert.alert('Error', 'Product data is missing.');
                  return;
                }
                setSearchText(item.name);
                setShowResults(true);
                navigation.navigate('ProductDetails', { product: item });
              }}
            >
              <Ionicons name="pricetag-outline" size={18} color="#555" />
              <Text style={styles.suggestionText}>{item.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f8f8',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 5,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  closeButton: {
    padding: 4,
  },
  suggestionsContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 8,
    elevation: 5,
    marginTop: 5,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  suggestionText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
});

export default Search;
