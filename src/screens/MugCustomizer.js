import React, { useState } from 'react';
import { View, Text, TextInput, Image, StyleSheet, TouchableOpacity } from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import normalizeUri from '../utils/normalizeUri';

const MugCustomizer = ({ onConfirm }) => {
  const [text, setText] = useState('');
  const [color, setColor] = useState('White');
  const [imageUri, setImageUri] = useState(null);
  const [size, setSize] = useState('Medium');
  const [quantity, setQuantity] = useState(1);

  const pickImage = () => {
    ImagePicker.openPicker({
      cropping: true,
      compressImageQuality: 0.8,
    }).then(image => setImageUri(image.path));
  };

  const handleConfirm = () => {
    const order = {
      product: 'MUG',
      text,
      color,
      imageUri,
      size,
      quantity,
    };
    onConfirm(order);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>🧉 Mug Customizer</Text>

      <View style={styles.preview}>
        <View style={[styles.mugMock, { backgroundColor: color.toLowerCase() }]}>
          {imageUri && <Image source={{ uri: normalizeUri(imageUri) }} style={styles.mugImage} />}
          {text ? <Text style={styles.overlayText}>{text}</Text> : null}
        </View>
      </View>

      <Text style={styles.label}>Text:</Text>
      <TextInput style={styles.input} value={text} onChangeText={setText} placeholder="Enter Mug Text" />

      <Text style={styles.label}>Color:</Text>
      <View style={styles.row}>
        {['White', 'Black', 'Red', 'Blue'].map(c => (
          <TouchableOpacity key={c} onPress={() => setColor(c)} style={[styles.option, color === c && styles.selected]}>
            <Text>{c}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Size:</Text>
      <View style={styles.row}>
        {['Small', 'Medium', 'Large'].map(s => (
          <TouchableOpacity key={s} onPress={() => setSize(s)} style={[styles.option, size === s && styles.selected]}>
            <Text>{s}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Image:</Text>
      <TouchableOpacity onPress={pickImage} style={styles.uploadBtn}>
        <Text>{imageUri ? 'Change Image' : 'Upload Image'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
        <Text style={{ fontWeight: 'bold' }}>Add to Cart</Text>
      </TouchableOpacity>
    </View>
  );
};

export default MugCustomizer;

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
  mugMock: {
    width: 120,
    height: 140,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  mugImage: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
  },
  overlayText: {
    position: 'absolute',
    bottom: 8,
    fontSize: 14,
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
