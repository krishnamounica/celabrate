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
} from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';

const Resin = () => {
  const [imageUri, setImageUri] = useState(null);
  const [shape, setShape] = useState('Heart');
  const [color, setColor] = useState('Red');
  const [caption, setCaption] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [addFlowers, setAddFlowers] = useState(false);
  const [addGlitter, setAddGlitter] = useState(false);

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
    setQuantity((prev) =>
      type === 'inc' ? prev + 1 : prev > 1 ? prev - 1 : 1
    );
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
      caption,
      quantity,
      embeds: {
        flowers: addFlowers,
        glitter: addGlitter,
      },
    };

    Alert.alert('Saved!', JSON.stringify(order, null, 2));
  };

  // 🎨 Simulate frame color styles
  const colorStyles = {
    Red: '#ff4d4d',
    Glitter: '#ffc0cb',
    Pastel: '#b3e6ff',
    Black: '#222',
  };

  // 🖼 Shape styles (borderRadius simulation)
  const shapeStyles = {
    Rectangle: { borderRadius: 8 },
    Circle: { borderRadius: 90 },
    Heart: { borderRadius: 25 }, // symbolic for now
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>🎨 Resin Frame Creator</Text>

      <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
        <Text style={styles.uploadText}>
          {imageUri ? 'Change Photo' : 'Upload Photo'}
        </Text>
      </TouchableOpacity>

      {/* 👁 Live Preview */}
      <View style={styles.previewContainer}>
        <Text style={styles.previewLabel}>Live Preview</Text>
        <View
          style={[
            styles.previewBox,
            {
              backgroundColor: colorStyles[color] || '#ccc',
              ...shapeStyles[shape],
            },
          ]}
        >
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.image} />
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

      <Text style={styles.label}>Frame Shape:</Text>
      <View style={styles.row}>
        {['Heart', 'Rectangle', 'Circle'].map((item) => (
          <TouchableOpacity
            key={item}
            onPress={() => setShape(item)}
            style={[
              styles.optionBtn,
              shape === item && styles.selectedOption,
            ]}
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
            style={[
              styles.optionBtn,
              color === item && styles.selectedOption,
            ]}
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
    </View>
  );
};

export default Resin;

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
  previewContainer: {
    width: '100%',
    marginBottom: 15,
  },
  previewLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  previewBox: {
    width: 180,
    height: 180,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#FFD700',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    color: '#999',
    fontSize: 14,
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
    gap: 4,
  },
  addonText: {
    fontSize: 18,
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
  optionBtn: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    borderRadius: 8,
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
