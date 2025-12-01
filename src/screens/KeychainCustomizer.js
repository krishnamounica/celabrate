import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import normalizeUri from '../utils/normalizeUri';

const KeychainCustomizer = ({ onConfirm }) => {
  const [shape, setShape] = useState('Round');
  const [color, setColor] = useState('Black');
  const [text, setText] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const pickImage = () => {
    ImagePicker.openPicker({
      cropping: true,
      compressImageQuality: 0.8,
    }).then(image => setImageUri(image.path));
  };

  const handleConfirm = () => {
    const order = {
      product: 'KEYCHAIN',
      shape,
      color,
      text,
      imageUri,
      quantity,
    };
    onConfirm(order);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>🔑 Keychain Customizer</Text>

      <View style={styles.preview}>
        <View style={[styles.keyMock, { borderRadius: shape === 'Round' ? 50 : 4, backgroundColor: color.toLowerCase() }]}>
          {imageUri && <Image source={{ uri: normalizeUri(imageUri) }} style={styles.keyImage} />}
          {text ? <Text style={styles.overlayText}>{text}</Text> : null}
        </View>
      </View>

      <Text style={styles.label}>Shape:</Text>
      <View style={styles.row}>
        {['Round', 'Square', 'Heart'].map(s => (
          <TouchableOpacity key={s} onPress={() => setShape(s)} style={[styles.option, shape === s && styles.selected]}>
            <Text>{s}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Color:</Text>
      <View style={styles.row}>
        {['Black', 'Red', 'White'].map(c => (
          <TouchableOpacity key={c} onPress={() => setColor(c)} style={[styles.option, color === c && styles.selected]}>
            <Text>{c}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Text:</Text>
      <TextInput style={styles.input} value={text} onChangeText={setText} placeholder="Your message" />

      <TouchableOpacity style={styles.uploadBtn} onPress={pickImage}>
        <Text>{imageUri ? 'Change Image' : 'Upload Image'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
        <Text style={{ fontWeight: 'bold' }}>Add to Cart</Text>
      </TouchableOpacity>
    </View>
  );
};

export default KeychainCustomizer;

const styles = StyleSheet.create({
  container: { padding: 16 },
  heading: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 8, borderRadius: 6, marginBottom: 10 },
  label: { fontWeight: 'bold', marginTop: 10 },
  row: { flexDirection: 'row', gap: 10, marginVertical: 8 },
  option: { borderWidth: 1, borderColor: '#999', padding: 6, borderRadius: 6 },
  selected: { backgroundColor: '#FFD70050' },
  uploadBtn: { backgroundColor: '#eee', padding: 8, marginVertical: 8, borderRadius: 6 },
  preview: { alignItems: 'center', marginBottom: 16 },
  keyMock: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyImage: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
  },
  overlayText: {
    position: 'absolute',
    bottom: 8,
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },
  confirmBtn: {
    backgroundColor: '#FFD700',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },
});
