import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import LEDNamePreview from '../../LEDNamePreview';
import Magnetics from './Magnetics';
import Resin from './Resin';
import CustomModal from './CustomModal';

const offers = [
  {
    id: '1',
    name: 'LIGHTS WITH NAMES',
    image: require('../../assets/lights.png'),
    description: 'We craft light wires shaped exactly like your name!',
  },
  {
    id: '2',
    name: 'KEY CHAINS, MUGS T-SHIRTS WITH NAMES',
    image: require('../../assets/keychains.png'),
    description: 'Personalized merchandise for all occasions.',
  },
  {
    id: '3',
    name: 'MAGNETIC TILES',
    image: require('../../assets/magnetic.png'),
    description: 'Creative photo magnetic tiles to stick on metal surfaces.',
  },
  {
    id: '4',
    name: 'RESIN PHOTO FRAMES WITH LOVE SYMBOL',
    image: require('../../assets/resin.png'),
    description: 'Beautiful resin frames with love theme and photo inserts.',
  },
];

const BestOffers = () => {
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [customModalVisible, setCustomModalVisible] = useState(false);

  const openOffer = (item) => {
    setSelectedOffer(item);

    // Show modal only for Keychains, Mugs, T-shirts
    if (item.name === 'KEY CHAINS, MUGS T-SHIRTS WITH NAMES') {
      setCustomModalVisible(true);
    }
  };

  const closeCustomModal = () => {
    setCustomModalVisible(false);
  };

  const renderSelectedComponent = () => {
    if (!selectedOffer) return null;

    switch (selectedOffer.name) {
      case 'LIGHTS WITH NAMES':
        return <LEDNamePreview />;
      case 'MAGNETIC TILES':
        return <Magnetics />;
      case 'RESIN PHOTO FRAMES WITH LOVE SYMBOL':
        return <Resin />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>🔥 Top Highlights</Text>
          <View style={styles.underline} />
        </View>

        <FlatList
          data={offers}
          numColumns={2}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.offerCard}
              onPress={() => openOffer(item)}
            >
              <Image source={item.image} style={styles.image} />
              <Text style={styles.cardText}>{item.name}</Text>
            </TouchableOpacity>
          )}
        />

        {/* Render component if selected offer is not keychain/mug/tshirt */}
        {!customModalVisible && renderSelectedComponent()}

        {/* Modal shown only for keychain/mug/tshirt */}
        <CustomModal
          visible={customModalVisible}
          onClose={closeCustomModal}
          productType="selector"
        />
      </View>
    </SafeAreaView>
  );
};

export default BestOffers;


const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 10,
  },
  closeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF4444',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
  selectorContainer: {
    alignItems: 'center',
  },
  selectorHeading: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  optionBtn: {
    backgroundColor: '#FFD700',
    padding: 10,
    marginVertical: 5,
    borderRadius: 8,
    width: '80%',
    alignItems: 'center',
  },
  optionText: {
    fontWeight: 'bold',
    color: '#000',
  },
});
