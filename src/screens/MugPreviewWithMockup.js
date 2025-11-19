import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';

const MugPreviewWithMockup = ({ imageUri, customText }) => {
  return (
    <View style={styles.container}>
      {/* 🏞 Background Mockup Image */}
      <Image
        source={require('../assets/images/mug_mock_up.png')} // Replace with your mug mockup image
        style={styles.mugImage}
        resizeMode="contain"
      />

      {/* 🖼 User Image Overlay */}
      {imageUri && (
        <Image
          source={{ uri: imageUri }}
          style={styles.overlayImage}
          resizeMode="cover"
        />
      )}

      {/* 🔤 User Text Overlay */}
      {customText !== '' && (
        <Text style={styles.overlayText}>{customText}</Text>
      )}
    </View>
  );
};

export default MugPreviewWithMockup;

const styles = StyleSheet.create({
  container: {
    width: 250,
    height: 180,
    position: 'relative',
    alignSelf: 'center',
  },
  mockup: {
    width: '100%',
    height: '100%',
  },
  overlayImage: {
    position: 'absolute',
    top: 60, // Adjust this based on the PNG's printable area
    left: 80,
    width: 80,
    height: 60,
    borderRadius: 4,
    opacity: 0.9,
  },
  overlayText: {
    position: 'absolute',
    top: 125, // Adjust this too
    left: 80,
    width: 90,
    textAlign: 'center',
    fontWeight: 'bold',
    backgroundColor: 'rgba(255,255,255,0.7)',
    padding: 4,
    borderRadius: 4,
    color: '#000',
  },
});
