// KeychainPreview.js
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import normalizeUri from '../utils/normalizeUri';

const KeychainPreview = ({ shape, imageUri, customText }) => {
  const getShapeStyle = () => {
    switch (shape) {
      case 'Round':
        return { borderRadius: 60 };
      case 'Square':
        return { borderRadius: 6 };
      case 'Heart':
        return {
          borderRadius: 20,
          transform: [{ rotate: '-45deg' }],
          backgroundColor: '#ffccd5',
        };
      default:
        return {};
    }
  };

  return (
    <View style={[styles.keychainShape, getShapeStyle()]}>
      {imageUri && <Image source={{ uri: normalizeUri(imageUri) }} style={styles.previewImage} />}
      {customText !== '' && <Text style={styles.previewText}>{customText}</Text>}
    </View>
  );
};

export default KeychainPreview;

const styles = StyleSheet.create({
  keychainShape: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#aaa',
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  previewImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    zIndex: -1,
    opacity: 0.8,
    resizeMode: 'cover',
  },
  previewText: {
    color: '#000',
    fontWeight: 'bold',
    textAlign: 'center',
    backgroundColor: '#ffffff80',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
});
