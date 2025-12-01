import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  Switch,
  ScrollView,
} from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import normalizeUri from '../utils/normalizeUri';

const Resin = () => {
  const [imageUri, setImageUri] = useState(null);
  const [shape, setShape] = useState('Heart');
  const [color, setColor] = useState('Red');
  const [caption, setCaption] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [addFlowers, setAddFlowers] = useState(false);
  const [addGlitter, setAddGlitter] = useState(false);
  const [size, setSize] = useState('Medium');

  const priceMap = {
    Small: 299,
    Medium: 499,
    Large: 699,
  };

  const previewSizes = {
    Small: 120,
    Medium: 160,
    Large: 200,
  };

  const colorStyles = {
    Red: '#ff4d4d',
    Glitter: '#ffc0cb',
    Pastel: '#b3e6ff',
    Black: '#222',
  };

  const shapeStyles = {
    Rectangle: { borderRadius: 8 },
    Circle: { borderRadius: 90 },
    Heart: { borderRadius: 25 },
  };

  const pricePerUnit = priceMap[size];
  const totalPrice = pricePerUnit * quantity;

  const pickImage = () => {
    ImagePicker.openPicker({
      width: 600,
      height: 600,
      cropping: true,
      compressImageQuality: 0.8,
      mediaType: 'photo',
    })
      .then((image) => setImageUri(image.path))
      .catch((err) => {
        if (err.code !== 'E_PICKER_CANCELLED') {
          Alert.alert('Image selection failed.');
        }
      });
  };

  const handleQuantityChange = (type) => {
    setQuantity((prev) => (type === 'inc' ? prev + 1 : prev > 1 ? prev - 1 : 1));
  };

  const handleConfirm = () => {
    if (!imageUri) {
      Alert.alert('Please upload a photo.');
      return;
    }

    const order = {
      product: 'RESIN FRAME',
      imageUri,
      shape,
      color,
      size,
      caption,
      quantity,
      pricePerUnit,
      totalPrice,
      embeds: {
        flowers: addFlowers,
        glitter: addGlitter,
      },
    };

    Alert.alert('Saved!', JSON.stringify(order, null, 2));
  };

  return (
      <ScrollView contentContainerStyle={styles.container}>
    <View style={styles.container}>
      <Text style={styles.heading}>🎨 Resin Frame Creator</Text>

      <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
        <Text style={styles.uploadText}>
          {imageUri ? 'Change Photo' : 'Upload Photo'}
        </Text>
      </TouchableOpacity>

      {/* Live Preview */}
      <View style={styles.previewContainer}>
        <Text style={styles.previewLabel}>Live Preview</Text>
        <View
          style={[
            styles.previewFrame,
            {
              borderColor: colorStyles[color] || '#ccc',
              ...shapeStyles[shape],
            },
          ]}
        >
          <View
            style={[
              styles.imageInner,
              {
                width: previewSizes[size],
                height: previewSizes[size],
              },
            ]}
          >
            {imageUri ? (
              <Image
  source={{ uri: normalizeUri(imageUri) }}
  style={[
    styles.image,
    {
      borderRadius: shape === 'Circle' ? previewSizes[size] / 2 : 10,
    },
  ]}
/>

            ) : (
              <Text style={styles.placeholder}>No Image</Text>
            )}
            {caption ? (
              <View style={styles.captionOverlay}>
                <Text style={styles.captionText}>{caption}</Text>
              </View>
            ) : null}
            {(addFlowers || addGlitter) && (
              <View style={styles.addonOverlay}>
                {addFlowers && <Text style={styles.addonText}>🌸</Text>}
                {addGlitter && <Text style={styles.addonText}>✨</Text>}
              </View>
            )}
          </View>
        </View>
        <Text style={styles.colorLabel}>
          Theme: {color} | Size: {size}
        </Text>
      </View>

      <Text style={styles.label}>Frame Shape:</Text>
      <View style={styles.row}>
        {['Heart', 'Rectangle', 'Circle'].map((item) => (
          <TouchableOpacity
            key={item}
            onPress={() => setShape(item)}
            style={[styles.optionBtn, shape === item && styles.selectedOption]}
          >
            <Text>{item}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Color Theme:</Text>
      <View style={styles.row}>
        {['Red', 'Glitter', 'Pastel', 'Black'].map((item) => (
          <TouchableOpacity
            key={item}
            onPress={() => setColor(item)}
            style={[styles.optionBtn, color === item && styles.selectedOption]}
          >
            <Text>{item}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Mould Size:</Text>
      <View style={styles.row}>
        {['Small', 'Medium', 'Large'].map((item) => (
          <TouchableOpacity
            key={item}
            onPress={() => setSize(item)}
            style={[styles.optionBtn, size === item && styles.selectedOption]}
          >
            <Text>{item}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Add-ons:</Text>
      <View style={styles.row}>
        <Text>🌸 Flowers</Text>
        <Switch value={addFlowers} onValueChange={setAddFlowers} />
        <Text>✨ Glitter</Text>
        <Switch value={addGlitter} onValueChange={setAddGlitter} />
      </View>

      <Text style={styles.label}>Custom Text:</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Love You Forever"
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

      <View style={{ marginTop: 10 }}>
        <Text style={{ fontSize: 14, color: '#444' }}>
          Price per Unit: ₹{pricePerUnit}
        </Text>
        <Text style={{ fontWeight: 'bold', fontSize: 16 }}>
          Total: ₹{totalPrice}
        </Text>
      </View>
    </View>
    </ScrollView>
  );
};

export default Resin;

// 🎨 Styles remain the same as your original post



const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    padding: 16,
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFA500',
    marginBottom: 12,
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
  previewContainer: {
    width: '100%',
    marginBottom: 15,
    alignItems: 'center',
  },
  previewLabel: {
    fontSize: 14,
    color: '#444',
    marginBottom: 4,
  },
  previewFrame: {
    borderWidth: 6,
    padding: 4,
    borderRadius: 12,
  },
  imageInner: {
    width: 160,
    height: 160,
    overflow: 'hidden',
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    color: '#999',
    fontSize: 14,
    textAlign: 'center',
    paddingTop: 65,
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
  addonOverlay: {
    position: 'absolute',
    top: 4,
    right: 4,
    flexDirection: 'row',
  },
  addonText: {
    fontSize: 18,
    marginLeft: 4,
  },
  colorLabel: {
    marginTop: 5,
    fontSize: 12,
    color: '#444',
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
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 12,
  },
  optionBtn: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    borderRadius: 8,
    marginRight: 10,
    marginBottom: 6,
  },
  selectedOption: {
    backgroundColor: '#FFD70050',
    borderColor: '#FFD700',
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
