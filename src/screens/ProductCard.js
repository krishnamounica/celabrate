// ProductCard.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Modal,
  Dimensions,
} from 'react-native';
import Slider from '@react-native-community/slider';

const { width } = Dimensions.get('window');

const ProductCard = ({
  imageSource,
  title,
  price,
  rating,
  description,
  onAddToCart,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [brightness, setBrightness] = useState(0.8);

  return (
    <View style={styles.card}>
      <Image source={imageSource} style={styles.image} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.price}>₹{price}</Text>
      <Text style={styles.rating}>⭐ {rating}</Text>

      <View style={styles.buttons}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.buttonText}>Preview</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={onAddToCart}>
          <Text style={styles.buttonText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>

      {/* Preview Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Lamp Preview</Text>
            <View
              style={[
                styles.lampPreview,
                { opacity: brightness, backgroundColor: '#FFF5E1' },
              ]}
            >
              <Text style={styles.previewText}>YOUR NAME</Text>
            </View>
            <Text style={styles.modalDesc}>{description}</Text>

            <Text style={styles.label}>Brightness</Text>
            <Slider
              style={{ width: width * 0.8, height: 40 }}
              minimumValue={0.2}
              maximumValue={1}
              step={0.01}
              value={brightness}
              onValueChange={setBrightness}
            />

            <TouchableOpacity
              style={[styles.button, { marginTop: 20 }]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.buttonText}>Close Preview</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ProductCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    margin: 10,
    width: width * 0.8,
    alignSelf: 'center',
    elevation: 4,
  },
  image: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
    color: '#333',
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 4,
    color: '#E91E63',
  },
  rating: {
    fontSize: 14,
    marginTop: 2,
    color: '#888',
  },
  buttons: {
    flexDirection: 'row',
    marginTop: 12,
    justifyContent: 'space-between',
  },
  button: {
    backgroundColor: '#FFD700',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  buttonText: {
    fontWeight: '600',
    color: '#000',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    width: width * 0.9,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  lampPreview: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  modalDesc: {
    fontSize: 14,
    marginTop: 12,
    textAlign: 'center',
    color: '#555',
  },
  label: {
    fontSize: 14,
    marginTop: 16,
    fontWeight: '600',
    color: '#333',
  },
});
