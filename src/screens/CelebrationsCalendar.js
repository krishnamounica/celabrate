import axios from 'axios';
import React ,{useState,useEffect} from 'react';
import { View, Text, Image, FlatList, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import normalizeUri from '../utils/normalizeUri';
import { useNavigation } from "@react-navigation/native";
import { faBold } from '@fortawesome/free-solid-svg-icons';

const { width } = Dimensions.get('window');



const CelebrationsCalendar = () => {
    const [relationships, setRelationships] = useState([]);
    const [loading, setLoading] = useState(true);
   const navigation = useNavigation();
    useEffect(() => {
      fetchRelationships();
    }, []);
    const BASE_URL = "https://wishandsurprise.com/backend";
  
    const fetchRelationships = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/get-categories.php`);
        const filteredData = response.data
          .filter(item => item.block === "dates")
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
  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View>
        <Text style={styles.dateText}>{item.date}</Text>
      </View>
        <TouchableOpacity 
                                style={[styles.categoryBox, { backgroundColor: item?.color || "#ccc" }]}
                                onPress={() => handleCategoryPress(item)}
                              >
                  <Image source={{ uri: normalizeUri(item.image) }} style={styles.image} />
                  </TouchableOpacity>
      <Text style={styles.title}>{item.name}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Celebrations Calendar</Text>
      <FlatList
        data={relationships}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const CARD_WIDTH = 160;

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    display:'flex',
    justifyContent:"center"
  },
  list: {
    paddingLeft: 2,
  },
  card: {
    width: CARD_WIDTH,
    marginRight: 12,
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
    // overflow: 'hidden',
    alignItems: 'center',
  },
  dateContainer: {
    width: '100%',
    backgroundColor: '#dce3ec',
    paddingVertical: 6,
    alignItems: 'center',
  },
  dateText: {
    fontWeight: '700',
    fontSize: 13,
    color: '#000',
  },
  image: {
    width: CARD_WIDTH,
    height: 200,
  },
  title: {
    fontSize: 17,
    textAlign: 'center',
    padding: 10,
    color: '#333',
   fontWeight:'700',
  },
});

export default CelebrationsCalendar;
