import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  StyleSheet,
  Dimensions,
  Animated,
  Easing,
  Pressable,
  ActivityIndicator,
  Modal,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import axios from 'axios';

const numColumns = 2;
const screenWidth = Dimensions.get('window').width;
const spacing = 12;
const cardWidth = (screenWidth - spacing * (numColumns + 1)) / numColumns;

const API_URL = 'https://wishandsurprise.com/backend/get_gift_packs.php';
const IMAGE_BASE_URL = 'https://wishandsurprise.com/backend/images/'; // your uploads folder

const GiftPacksGrid = () => {
  const [giftPacks, setGiftPacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [animations, setAnimations] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null);

  useEffect(() => {
    console.log(API_URL)
    axios.get(API_URL)
      .then((res) => {
        console.log(res,"+++++++++++++++")
        if (res.data.success) {
          setGiftPacks(res.data.data);
          const anims = res.data.data.map(() => new Animated.Value(0));
          setAnimations(anims);
          animateCards(anims);
        }
      })
      .catch((err) => console.error('Failed to load combo packs:', err))
      .finally(() => setLoading(false));
  }, []);

  const animateCards = (anims) => {
    const animatedSequence = anims.map((anim, index) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 350,
        delay: index * 100,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      })
    );
    Animated.stagger(100, animatedSequence).start();
  };

  const openModal = (index) => {
    setSelectedIndex(index);
    setModalVisible(true);
  };

  const renderItem = ({ item, index }) => {
    const scale = animations[index] || new Animated.Value(1);
    return (
      <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
        <Pressable
          android_ripple={{ color: '#ddd' }}
          onPress={() => openModal(index)}
        >
          <Image
            source={{ uri: IMAGE_BASE_URL + item.feature_image }}
            style={styles.image}
            resizeMode="cover"
          />
          <Text style={styles.name}>{item.name}</Text>
        </Pressable>
      </Animated.View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#444" />
      </View>
    );
  }

  const selectedPack = selectedIndex !== null ? giftPacks[selectedIndex] : null;

  return (
    <View style={styles.section}>
      <Text style={styles.header}>🎁 Our Combo Packs</Text>
      <FlatList
        data={giftPacks}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={numColumns}
        contentContainerStyle={styles.grid}
      />

      {/* Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedPack && (
              <ScrollView>
                <Image
                  source={{ uri: IMAGE_BASE_URL + selectedPack.feature_image }}
                  style={styles.modalImage}
                />
                <Text style={styles.modalTitle}>{selectedPack.name}</Text>
                <Text style={styles.modalDesc}>{selectedPack.description}</Text>

                <Text style={styles.subHeader}>Includes:</Text>
                {selectedPack.items.map((it, i) => (
                  <Text key={i} style={styles.itemText}>• {it}</Text>
                ))}

                <Text style={styles.subHeader}>Images:</Text>
                {selectedPack.images.map((img, i) => (
                  <Image
                    key={i}
                    source={{ uri: IMAGE_BASE_URL + img }}
                    style={styles.itemImage}
                  />
                ))}

                <Text style={styles.price}>₹ {selectedPack.price}</Text>
              </ScrollView>
            )}

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    backgroundColor: '#fff7f0',
    padding: 20,
    margin: 10,
    borderRadius: 16,
    elevation: 3,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#222',
    marginBottom: 16,
  },
  grid: {
    justifyContent: 'center',
  },
  card: {
    width: cardWidth,
    margin: spacing / 2,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
  },
  image: {
    width: '100%',
    height: 120,
  },
  name: {
    padding: 8,
    fontSize: 14,
    textAlign: 'center',
    color: '#222',
    fontWeight: '500',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    maxHeight: '80%',
  },
  modalImage: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 6,
  },
  modalDesc: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
  },
  subHeader: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 4,
  },
  itemText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
  itemImage: {
    width: '100%',
    height: 120,
    borderRadius: 6,
    marginVertical: 6,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ff6600',
    marginTop: 10,
  },
  closeButton: {
    marginTop: 10,
    padding: 12,
    backgroundColor: '#ff6600',
    borderRadius: 10,
    alignItems: 'center',
  },
  closeText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default GiftPacksGrid;
