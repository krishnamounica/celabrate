import React from 'react';
import { View, Text, StyleSheet, Image, FlatList, SafeAreaView } from 'react-native';

const offers = [
  { id: '1', name: 'LIGHTS WITH NAMES', image: require('../../assets/lights.png') },
  { id: '2', name: 'KEY CHAINS, MUGS T-SHIRTS WITH NAMES', image: require('../../assets/keychains.png') },
  { id: '3', name: 'MAGNETIC TILES', image: require('../../assets/magnetic.png') },
  { id: '4', name: 'RESIN PHOTO FRAMES WITH LOVE SYMBOL', image: require('../../assets/resin.png') },
];

const BestOffers = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Title Block with Styling */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>🔥 Top Highlights</Text>
          <View style={styles.underline} />
        </View>

        <FlatList
          data={offers}
          numColumns={2}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer} // Ensures proper bottom spacing
          renderItem={({ item }) => (
            <View style={styles.offerCard}>
              <Image source={item.image} style={styles.image} />
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
};

export default BestOffers;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#121212',
  },
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingTop: 20, // Added spacing at the top
    
  },
  titleContainer: {
    marginBottom: 5, // Increased space below title
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'black',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  underline: {
    width: 80,
    height: 4,
    backgroundColor: '#FFD700',
    marginTop: 5,
    borderRadius: 2,
  },
  listContainer: {
    paddingBottom: 10, // Extra space at the bottom
  },
  offerCard: {
    backgroundColor: '#1e1e1e',
    padding: 15,
    margin: 8,
    borderRadius: 15,
    alignItems: 'center',
    width: '45%',
    shadowColor: '#FFD700',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  image: {
    width: '100%',
    height: 120,
    borderRadius: 10,
    resizeMode: 'cover',
  },
});
