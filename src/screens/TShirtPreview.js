// TShirtPreview.js
import React from 'react';
import { Text, ImageBackground, StyleSheet } from 'react-native';

const TShirtPreview = ({ customText }) => {
  return (
    <ImageBackground
      source={require('../assets/images/tshirt_mockup.png')} 
      style={styles.mockup}
      resizeMode="contain"
    >
      {/* Overlay only the text */}
      {customText !== '' && (
        <Text style={styles.customText}>{customText}</Text>
      )}
    </ImageBackground>
  );
};

export default TShirtPreview;

const styles = StyleSheet.create({
  mockup: {
    width: 200,
    height: 240,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  customText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    backgroundColor: '#ffffffcc',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    position: 'absolute',
    top: '60%', // Adjust this to position over the print area
    textAlign: 'center',
  },
});
