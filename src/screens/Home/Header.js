import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faBars, faSearch, faBell, faTimes } from '@fortawesome/free-solid-svg-icons';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';

const Header = () => {
    const [searchText, setSearchText] = useState('');
    const [menuOpen, setMenuOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [searchResults, setSearchResults] = useState([]);
    const navigation = useNavigation();

    // Get products from Redux state
    const { items: products } = useSelector(state => state.products);

    // Extract unique categories from products
   // Extract unique category names (Ensure category is a string)
const categories = [...new Set(products.map(product => product.category?.name || product.category))];


    useEffect(() => {
        if (searchText.length > 0) {
            const filtered = products.filter(product =>
                product.name.toLowerCase().includes(searchText.toLowerCase())
            );
            setSearchResults(filtered.slice(0, 5)); // Limit to 5 results
        } else {
            setSearchResults([]);
        }
    }, [searchText, products]);




const handleSelectOption = (category) => {
    setSelectedCategory(category);
    setMenuOpen(false);
    navigation.navigate("ProductsScreen", { categoryId: category.id })
};


    return (
        <View style={styles.container}>
            <View style={styles.topBar}>
                <View style={styles.searchContainer}>
                    {/* <TouchableOpacity onPress={() => setMenuOpen(!menuOpen)} style={styles.menuIcon}>
                        {selectedCategory ? (
                            <Text style={styles.menuText}>{selectedCategory}</Text>
                        ) : (
                            <FontAwesomeIcon icon={faBars} size={20} color="#6e7a8a" />
                        )}
                    </TouchableOpacity> */}

                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search..."
                        placeholderTextColor="#6e7a8a"
                        value={searchText}
                        onChangeText={setSearchText}
                        onFocus={() => setMenuOpen(false)}
                    />

                    <TouchableOpacity onPress={() => setSearchText('')}>
                        <FontAwesomeIcon
                            icon={searchText.length > 0 ? faTimes : faSearch}
                            size={18}
                            color="#6e7a8a"
                        />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.notificationIcon}>
                    <FontAwesomeIcon icon={faBell} size={22} color="#6e7a8a" />
                </TouchableOpacity>
            </View>

            {menuOpen && (
                <View style={styles.menu}>
                    {categories.length === 0 ? (
                        <Text style={styles.menuText}>No Categories</Text>
                    ) : (
                        categories.map((category, index) => (
                            <TouchableOpacity key={index} style={styles.menuItem} onPress={() => handleSelectOption(category)}>
                                <Text style={styles.menuText}>{category}</Text>
                            </TouchableOpacity>
                        ))
                    )}
                </View>
            )}

            {searchResults.length > 0 && (
                <View style={styles.searchResults}>
                    <FlatList
                        data={searchResults}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.resultItem}
                                onPress={() => {
                                    setSearchText('');
                                    setSearchResults([]);
                                    navigation.navigate('ProductDetails', { product: item });
                                }}
                            >
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
    container: {
        backgroundColor: '#f0f4f8',
        padding: 15,
        borderBottomLeftRadius: 15,
        borderBottomRightRadius: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
        position: 'relative',
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
        backgroundColor: '#eaf2f8',
        borderRadius: 16,
        paddingHorizontal: 14,
        flex: 1,
        marginRight: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    searchInput: {
        flex: 1,
        paddingVertical: 10,
        fontSize: 18,
        color: '#333333',
        fontFamily: 'sans-serif',
    },
    menuIcon: {
        paddingHorizontal: 12,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    menuText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333333',
    },
    notificationIcon: {
        padding: 10,
    },
    menu: {
        position: 'absolute',
        top: 60,
        left: 10,
        backgroundColor: '#fff',
        borderRadius: 8,
        elevation: 15,
        padding: 10,
        width: 150,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        zIndex: 999,
    },
    menuItem: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    searchResults: {
        position: 'absolute',
        top: 60,
        left: 50,
        right: 50,
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 10,
        elevation: 5,
        zIndex: 999,
    },
    resultItem: {
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    resultText: {
        fontSize: 16,
        color: '#333',
    },
});
