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
  Pressable,
  TextInput,
  Alert,
} from 'react-native';
import LEDNamePreview from '../../LEDNamePreview';

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
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [customName, setCustomName] = useState('');
  const [customOrders, setCustomOrders] = useState([]); // 💡 Save orders here

  const openModal = (item) => {
    setSelectedOffer(item);
    setCustomName('');
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedOffer(null);
  };

  const handleConfirm = () => {
    if (!customName.trim()) {
      Alert.alert('Enter a name to continue.');
      return;
    }

    const order = {
      id: Date.now().toString(), // Unique ID
      product: selectedOffer.name,
      name: customName.toUpperCase(),
    };

    setCustomOrders((prev) => [...prev, order]);
    Alert.alert('Success!', `Saved "${customName.toUpperCase()}" for ${selectedOffer.name}`);
    closeModal();
  };

  const isLightsWithName = selectedOffer?.name === 'LIGHTS WITH NAMES';

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>🔥 Top Highlights</Text>
          <View style={styles.underline} />
        </View>

        {/* Grid */}
        <FlatList
          data={offers}
          numColumns={2}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.offerCard} onPress={() => openModal(item)}>
              <Image source={item.image} style={styles.image} />
              <Text style={styles.cardText}>{item.name}</Text>
            </TouchableOpacity>
          )}
        />

        {/* Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={closeModal}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              {selectedOffer && (
                <>
                  <Image source={selectedOffer.image} style={styles.modalImage} />
                  <Text style={styles.modalTitle}>{selectedOffer.name}</Text>

                  {isLightsWithName ? (
                   <>
  <Text style={styles.modalSubHeading}>✨ Light-Up Your Name ✨</Text>
  
  <Text style={styles.modalDescription}>
    We bend glowing LED light wires to form your custom name! Perfect for wall decor, birthdays, and gifts.
  </Text>

  <Text style={styles.modalLabel}>Enter your name below:</Text>

  <TextInput
    style={styles.input}
    placeholder="e.g. ANITA"
    value={customName}
    onChangeText={setCustomName}
    placeholderTextColor="#aaa"
  />
 {/* <Text style={styles.lightPreview}>The actual product may not be 100% identical to the live preview shown here. Variations may occur.</Text> */}
   
  <Text style={styles.previewLabel}>Live Preview</Text>
  <View style={styles.previewBox}>
    <LEDNamePreview text={customName} />

  </View>

  <Pressable style={styles.confirmButton} onPress={handleConfirm}>
    <Text style={styles.confirmText}>Confirm Order</Text>
  </Pressable>
                    </>
                  ) : (
                    <>
                      <Text style={styles.modalDescription}>{selectedOffer.description}</Text>
                      <Pressable style={styles.closeButton} onPress={closeModal}>
                        <Text style={styles.closeText}>Close</Text>
                      </Pressable>
                    </>
                  )}
                </>
              )}
            </View>
          </View>
        </Modal>
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
    cardText: {
    marginTop: 8,
    color: '#FFD700',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    width: '100%',
  },
  modalImage: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    resizeMode: 'cover',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  closeText: {
    fontWeight: 'bold',
    color: '#000'
    },
      input: {
    borderColor: '#FFD700',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
    width: '100%',
    color: 'black',
    fontWeight: 'bold',
    fontSize: 16,
  },
  previewBox: {
    marginTop: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: '#FFD700',
    borderRadius: 10,
    backgroundColor: '#000',
    width: '100%',
    alignItems: 'center',
  },
  lightPreview: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFD700',
    textShadowColor: '#f0e130',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 10,
    letterSpacing: 2,
  },

  confirmButton: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 15,
  },
  modalSubHeading: {
  fontSize: 20,
  fontWeight: 'bold',
  color: '#FFD700',
  textAlign: 'center',
  marginBottom: 10,
},
modalLabel: {
  marginTop: 10,
  fontSize: 16,
  fontWeight: '600',
  color: '#333',
},
previewLabel: {
  marginTop: 20,
  fontSize: 16,
  fontWeight: '600',
  color: '#555',
},
confirmText: {
  color: '#000',
  fontWeight: 'bold',
  textAlign: 'center',
}
});
