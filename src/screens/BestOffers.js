import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import LEDNamePreview from '../../LEDNamePreview';
import Magnetics from './Magnetics';
import Resin from './Resin';
import TShirt from './Tshirt';
import MugCustomizer from './MugCustomizer';
import KeychainCustomizer from './KeychainCustomizer';
import LEDLightCustomizer from './LEDLightCustomizer';
import TShirtCustomizer from '../../TShirtCustomizer';
;

const offers = [
  { id: '1', name: 'LIGHTS WITH NAMES', image: require('../../assets/lights.png') },
  { id: '2', name: 'KEY CHAINS, MUGS T-SHIRTS', image: require('../../assets/keychains.png') },
  { id: '3', name: 'MAGNETIC TILES', image: require('../../assets/magnetic.png') },
  { id: '4', name: 'RESIN PHOTO FRAMES', image: require('../../assets/resin.png') },
];

const BestOffers = () => {
  const [selectedOfferId, setSelectedOfferId] = useState(null);
  const [comboChoice, setComboChoice] = useState(null); // for id=2 flow
  const [modalVisible, setModalVisible] = useState(false);
  const [cart,setCartItems] = useState([])

  const openModal = (id) => {
    setSelectedOfferId(id);
    setComboChoice(null);
    setModalVisible(true);
  };
  const closeModal = () => setModalVisible(false);

  const renderModalContent = () => {
    switch (selectedOfferId) {
      case '1':
        return <LEDLightCustomizer
  onSubmit={(order) => {
    // e.g. add to your cart state
    setCartItems(items => [...items, order]);
    Alert.alert('Success', 'Your custom LED light was added to cart!');
  }}
/>

      case '3':
        return <Magnetics />;
      case '4':
        return <Resin />;

      case '2':
        // COMBO: user must pick T-Shirt, Mug or Keychain first
        if (!comboChoice) {
          return (
            <View style={styles.comboSelector}>
              <Text style={styles.comboTitle}>Choose Product:</Text>
              <TouchableOpacity style={styles.comboBtn} onPress={() => setComboChoice('TShirt')}>
                <Text>T‑Shirt</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.comboBtn} onPress={() => setComboChoice('Mug')}>
                <Text>Mug</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.comboBtn} onPress={() => setComboChoice('Keychain')}>
                <Text>Keychain</Text>
              </TouchableOpacity>
            </View>
          );
        }
        // once chosen, render that customizer
        if (comboChoice === 'TShirt')  return <TShirtCustomizer onBack={() => setComboChoice(null)} />;
        if (comboChoice === 'Mug')     return <MugCustomizer  onBack={() => setComboChoice(null)} />;
        if (comboChoice === 'Keychain')return <KeychainCustomizer onBack={() => setComboChoice(null)} />;
        return null;

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <FlatList
          data={offers}
          numColumns={2}
          keyExtractor={i => i.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => openModal(item.id)}>
              <Image source={item.image} style={styles.cardImage} />
              <Text style={styles.cardText}>{item.name}</Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.list}
        />

        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={closeModal}
        >
          <View style={styles.overlay}>
            <View style={styles.modal}>
              <TouchableOpacity onPress={closeModal} style={styles.closeBtn}>
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
              {renderModalContent()}
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

export default BestOffers;

const styles = StyleSheet.create({
  safeArea:  { flex: 1, backgroundColor: '#121212' },
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  list:      { justifyContent: 'space-between' },
  card:      { flex: 0.5, margin: 8, alignItems: 'center', backgroundColor: '#1e1e1e', padding: 12, borderRadius: 12 },
  cardImage: { width: '100%', height: 100, borderRadius: 8, resizeMode: 'cover' },
  cardText:  { color: '#FFD700', marginTop: 8, textAlign: 'center' },

  overlay:   { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 20 },
  modal:     { backgroundColor: '#fff', borderRadius: 12, padding: 16, minHeight: 300 },

  closeBtn:  { alignSelf: 'flex-end' },
  closeText: { fontSize: 20, color: '#444' },

  comboSelector: { alignItems: 'center' },
  comboTitle:    { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  comboBtn:      { backgroundColor: '#FFD700', padding: 10, borderRadius: 8, marginVertical: 6, width: '80%', alignItems: 'center' },
});
