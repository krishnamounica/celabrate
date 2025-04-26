import React from 'react';
import { View, Text, Image, FlatList, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const celebrations = [
  {
    id: '1',
    date: '19ᵀᴴ APR',
    title: 'Husband Appreciation Day',
    image: require('../../src/assets/husband.png'),
  },
  {
    id: '2',
    date: '20ᵀᴴ APR',
    title: 'Easter',
    image: require('../../src/assets/easter.png'),
  },
  {
    id: '3',
    date: '22ᴺᴰ APR',
    title: 'Earth Day',
    image: require('../../src/assets/earth.png'),
  },
  {
    id: '4',
    date: '11ᵀᴴ MAY',
    title: "Mother's Day",
    image: require('../../src/assets/mother.png'),
  },
  {
    id: '5',
    date: '24ᵀᴴ MAY',
    title: "Brother's Day",
    image: require('../../src/assets/brother.png'),
  },
];

const CelebrationsCalendar = () => {
  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.dateContainer}>
        <Text style={styles.dateText}>{item.date}</Text>
      </View>
      <Image source={item.image} style={styles.image} resizeMode="cover" />
      <Text style={styles.title}>{item.title}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Celebrations Calendar</Text>
      <FlatList
        data={celebrations}
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
  },
  list: {
    paddingLeft: 2,
  },
  card: {
    width: CARD_WIDTH,
    marginRight: 12,
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
    overflow: 'hidden',
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
    height: 140,
  },
  title: {
    fontSize: 13,
    textAlign: 'center',
    padding: 10,
    color: '#333',
  },
});

export default CelebrationsCalendar;
