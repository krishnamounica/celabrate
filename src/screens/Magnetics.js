import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
} from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';

const tileSizes = ['6x6', '8x8', '12x12'];

const Magnetics = () => {
  const [imageUri, setImageUri] = useState(null);
  const [tileSize, setTileSize] = useState('6x6');
  const [caption, setCaption] = useState('');
  const [quantity, setQuantity] = useState(1);

  const pickImage = () => {
    ImagePicker.openPicker({
      width: 600,
      height: 600,
      cropping: true,
      compressImageQuality: 0.8,
      mediaType: 'photo',
    })
      .then((image) => {
        setImageUri(image.path);
      })
      .catch((err) => {
        if (err.code !== 'E_PICKER_CANCELLED') {
          Alert.alert('Image selection failed.');
        }
      });
  };

  const handleQuantityChange = (type) => {
    setQuantity((prev) =>
      type === 'inc' ? prev + 1 : prev > 1 ? prev - 1 : 1
    );
  };

  const handleConfirm = () => {
    if (!imageUri) {
      Alert.alert('Please upload an image.');
      return;
    }

    const order = {
      product: 'MAGNETIC TILE',
      imageUri,
      tileSize,
      caption,
      quantity,
    };

    Alert.alert('Saved!', JSON.stringify(order, null, 2));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>🧲 Magnetic Tile Creator</Text>

      <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
        <Text style={styles.uploadText}>
          {imageUri ? 'Change Image' : 'Upload Image'}
        </Text>
      </TouchableOpacity>

      {imageUri && (
        <View style={styles.previewTile}>
          <Image source={{ uri: imageUri }} style={styles.image} />
          {caption ? (
            <View style={styles.captionOverlay}>
              <Text style={styles.captionText}>{caption}</Text>
            </View>
          ) : null}
        </View>
      )}

      <Text style={styles.label}>Tile Size:</Text>
      <View style={styles.row}>
        {tileSizes.map((size) => (
          <TouchableOpacity
            key={size}
            style={[
              styles.sizeButton,
              tileSize === size && styles.selectedSize,
            ]}
            onPress={() => setTileSize(size)}
          >
            <Text style={styles.sizeText}>{size}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Caption (optional):</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Family Love"
        value={caption}
        onChangeText={setCaption}
        placeholderTextColor="#999"
      />

      <Text style={styles.label}>Quantity:</Text>
      <View style={styles.row}>
        <TouchableOpacity
          style={styles.qtyButton}
          onPress={() => handleQuantityChange('dec')}
        >
          <Text style={styles.qtyText}>-</Text>
        </TouchableOpacity>
        <Text style={styles.qtyCount}>{quantity}</Text>
        <TouchableOpacity
          style={styles.qtyButton}
          onPress={() => handleQuantityChange('inc')}
        >
          <Text style={styles.qtyText}>+</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
        <Text style={styles.confirmText}>Add to Cart</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Magnetics;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
  },
  heading: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 10,
    textAlign: 'center',
  },
  uploadButton: {
    backgroundColor: '#FFD700',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  uploadText: {
    color: '#000',
    fontWeight: 'bold',
  },
  previewTile: {
    width: 180,
    height: 180,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  captionOverlay: {
    position: 'absolute',
    bottom: 0,
    backgroundColor: '#00000070',
    padding: 4,
    width: '100%',
  },
  captionText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 14,
  },
  label: {
    alignSelf: 'flex-start',
    marginBottom: 4,
    fontWeight: '600',
    color: '#444',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  sizeButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    borderRadius: 8,
  },
  selectedSize: {
    backgroundColor: '#FFD70050',
    borderColor: '#FFD700',
  },
  sizeText: {
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#FFD700',
    padding: 8,
    borderRadius: 8,
    width: '100%',
    marginBottom: 10,
    color: '#000',
  },
  qtyButton: {
    borderWidth: 1,
    borderColor: '#FFD700',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  qtyText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  qtyCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginHorizontal: 10,
  },
  confirmButton: {
    backgroundColor: '#FFD700',
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
  },
  confirmText: {
    fontWeight: 'bold',
    color: '#000',
  },
});
