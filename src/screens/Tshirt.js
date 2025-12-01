// tshirt.js
import React, { useState } from 'react';
import { View, Text, TextInput, Image, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import normalizeUri from '../utils/normalizeUri';

const TShirt = () => {
  const [color, setColor] = useState('White');
  const [size, setSize] = useState('M');
  const [text, setText] = useState('');
  const [imageUri, setImageUri] = useState(null);

  const pickImage = () => {
    ImagePicker.openPicker({
      width: 500,
      height: 500,
      cropping: true,
    }).then((image) => {
      setImageUri(image.path);
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Customize T-Shirt</Text>

      <Text style={styles.label}>Color:</Text>
      <View style={styles.row}>
        {['White', 'Black', 'Red', 'Blue'].map((item) => (
          <TouchableOpacity
            key={item}
            style={[styles.optionBtn, color === item && styles.selected]}
            onPress={() => setColor(item)}
          >
            <Text>{item}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Size:</Text>
      <View style={styles.row}>
        {['S', 'M', 'L', 'XL'].map((item) => (
          <TouchableOpacity
            key={item}
            style={[styles.optionBtn, size === item && styles.selected]}
            onPress={() => setSize(item)}
          >
            <Text>{item}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Custom Text:</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your message"
        value={text}
        onChangeText={setText}
      />

      <TouchableOpacity style={styles.uploadBtn} onPress={pickImage}>
        <Text>{imageUri ? 'Change Image' : 'Upload Image'}</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Preview:</Text>
      <View style={[styles.preview, { backgroundColor: color.toLowerCase() }]}>
        <Text style={styles.previewText}>{text}</Text>
        {imageUri && <Image source={{ uri: normalizeUri(imageUri) }} style={styles.image} />}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  label: {
    marginBottom: 4,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  optionBtn: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginRight: 10,
    borderRadius: 6,
  },
  selected: {
    backgroundColor: '#FFD70050',
    borderColor: '#FFD700',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginBottom: 12,
    borderRadius: 6,
  },
  uploadBtn: {
    padding: 10,
    backgroundColor: '#ddd',
    marginBottom: 12,
    borderRadius: 6,
  },
  preview: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  previewText: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 10,
  },
  image: {
    width: 100,
    height: 100,
  },
});

export default TShirt;

// mug.js, keychains.js will follow similar structure customized to each product
