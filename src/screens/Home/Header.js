import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Dimensions,
} from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faSearch, faTimes, faBell } from '@fortawesome/free-solid-svg-icons';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';

const screenWidth = Dimensions.get('window').width;

const Header = () => {
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const navigation = useNavigation();

  const { items: products } = useSelector((state) => state.products);

  const categories = [...new Set(products.map(product => product.category?.name || product.category))];

  useEffect(() => {
    if (searchText.length > 0) {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(searchText.toLowerCase())
      );
      setSearchResults(filtered.slice(0, 5));
    } else {
      setSearchResults([]);
    }
  }, [searchText, products]);

  const handleSelectProduct = (item) => {
    setSearchText('');
    setSearchResults([]);
    navigation.navigate('ProductDetails', { product: item });
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.topBar}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search gifts..."
            placeholderTextColor="#6e7a8a"
            value={searchText}
            onChangeText={setSearchText}
          />
          <TouchableOpacity onPress={() => setSearchText('')}>
            <FontAwesomeIcon
              icon={searchText.length > 0 ? faTimes : faSearch}
              size={18}
              color="#6e7a8a"
            />
          </TouchableOpacity>
        </View>
      <TouchableOpacity style={styles.notificationIcon} onPress={() => navigation.navigate('Notifications')}>
  <FontAwesomeIcon icon={faBell} size={22} color="#6e7a8a" />
</TouchableOpacity>

      </View>

      {searchResults.length > 0 && (
        <View style={styles.searchResults}>
          <FlatList
            data={searchResults}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.resultItem} onPress={() => handleSelectProduct(item)}>
                <Text style={styles.resultText}>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#ffe4b5',
    padding: 15,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 5,
    zIndex: 10,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  searchContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#fff',
  borderRadius: 20,
  paddingHorizontal: 16,
  paddingVertical: 10, // increased height
  flex: 1,
  marginRight: 10,
  elevation: 3,
},

searchInput: {
  flex: 1,
  fontSize: 18, // increased font size
  color: '#333',
  paddingVertical: 6, // more vertical space
},

  notificationIcon: {
    padding: 10,
  },
  searchResults: {
    position: 'absolute',
    top: 65,
    left: 15,
    right: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    elevation: 10,
    zIndex: 999,
  },
  resultItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  resultText: {
    fontSize: 15,
    color: '#333',
  },
});
