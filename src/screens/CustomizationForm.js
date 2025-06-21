import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Alert, ScrollView, Switch
} from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';

const CustomizationForm = () => {
  const [productType, setProductType] = useState('Keychain');
  const [color, setColor] = useState('White');
  const [customText, setCustomText] = useState('');
  const [imageUri, setImageUri] = useState(null);

  // Specific Inputs
  const [shape, setShape] = useState('Round'); // For keychain
  const [mugSize, setMugSize] = useState('Medium');
  const [handleSide, setHandleSide] = useState('Right');
  const [tshirtSize, setTshirtSize] = useState('M');
  const [sleeveType, setSleeveType] = useState('Half');
  const [fitType, setFitType] = useState('Regular');

  const pickImage = () => {
    ImagePicker.openPicker({
      width: 500,
      height: 500,
      cropping: true,
    }).then(image => setImageUri(image.path))
      .catch(err => {
        if (err.code !== 'E_PICKER_CANCELLED') {
          Alert.alert('Image selection failed.');
        }
      });
  };

  const handleSubmit = () => {
    const order = {
      product: productType,
      color,
      customText,
      imageUri,
      ...(productType === 'Keychain' && { shape }),
      ...(productType === 'Mug' && { mugSize, handleSide }),
      ...(productType === 'T-shirt' && { tshirtSize, sleeveType, fitType }),
    };
    Alert.alert('Saved!', JSON.stringify(order, null, 2));
  };

  return (

  <ScrollView contentContainerStyle={styles.container}>
    <Text style={styles.title}>🛠 Customize Your Product</Text>

    {/* 🖼 Live Preview */}
    <Text style={styles.label}>Live Preview:</Text>
    <View style={[styles.previewBox, { backgroundColor: color.toLowerCase() }]}>
      {productType === 'Keychain' && (
        <View style={[
          styles.keychainShape,
          shape === 'Round' && { borderRadius: 60 },
          shape === 'Square' && { borderRadius: 6 },
          shape === 'Heart' && { borderRadius: 20, transform: [{ rotate: '-45deg' }] }
        ]}>
          {imageUri && <Image source={{ uri: imageUri }} style={styles.previewImage} />}
          {customText !== '' && <Text style={styles.previewText}>{customText}</Text>}
        </View>
      )}

      {productType === 'Mug' && (
        <View style={styles.mugShape}>
          {imageUri && <Image source={{ uri: imageUri }} style={styles.previewImage} />}
          {customText !== '' && <Text style={styles.previewText}>{customText}</Text>}
          <View style={[styles.handle, handleSide === 'Left' ? { left: -20 } : { right: -20 }]} />
        </View>
      )}

      {productType === 'T-shirt' && (
        <View style={styles.tshirtShape}>
          {imageUri && <Image source={{ uri: imageUri }} style={styles.previewImage} />}
          {customText !== '' && <Text style={styles.previewText}>{customText}</Text>}
        </View>
      )}
    </View>

    {/* 👇 Insert rest of the existing UI (product selection, inputs, etc.) here */}

      <Text style={styles.title}>🛠 Customize Your Product</Text>

      {/* Product Type */}
      <Text style={styles.label}>Select Product:</Text>
      <View style={styles.row}>
        {['Keychain', 'Mug', 'T-shirt'].map(type => (
          <TouchableOpacity
            key={type}
            onPress={() => setProductType(type)}
            style={[styles.optionBtn, productType === type && styles.selected]}
          >
            <Text>{type}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Color Theme */}
      <Text style={styles.label}>Color Theme:</Text>
      <View style={styles.row}>
        {['White', 'Black', 'Red', 'Blue'].map(c => (
          <TouchableOpacity
            key={c}
            onPress={() => setColor(c)}
            style={[styles.optionBtn, color === c && styles.selected]}
          >
            <Text>{c}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Custom Text */}
      <Text style={styles.label}>Custom Text:</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your text"
        value={customText}
        onChangeText={setCustomText}
      />

      {/* Upload Image */}
      <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
        <Text>{imageUri ? 'Change Image' : 'Upload Image'}</Text>
      </TouchableOpacity>
      {imageUri && <Image source={{ uri: imageUri }} style={styles.imagePreview} />}

      {/* Conditional Inputs */}
      {productType === 'Keychain' && (
        <>
          <Text style={styles.label}>Keychain Shape:</Text>
          <View style={styles.row}>
            {['Round', 'Square', 'Heart'].map(s => (
              <TouchableOpacity
                key={s}
                onPress={() => setShape(s)}
                style={[styles.optionBtn, shape === s && styles.selected]}
              >
                <Text>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      {productType === 'Mug' && (
        <>
          <Text style={styles.label}>Mug Size:</Text>
          <View style={styles.row}>
            {['Small', 'Medium', 'Large'].map(s => (
              <TouchableOpacity
                key={s}
                onPress={() => setMugSize(s)}
                style={[styles.optionBtn, mugSize === s && styles.selected]}
              >
                <Text>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.label}>Handle Side:</Text>
          <View style={styles.row}>
            {['Left', 'Right'].map(s => (
              <TouchableOpacity
                key={s}
                onPress={() => setHandleSide(s)}
                style={[styles.optionBtn, handleSide === s && styles.selected]}
              >
                <Text>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      {productType === 'T-shirt' && (
        <>
          <Text style={styles.label}>T-Shirt Size:</Text>
          <View style={styles.row}>
            {['S', 'M', 'L', 'XL'].map(s => (
              <TouchableOpacity
                key={s}
                onPress={() => setTshirtSize(s)}
                style={[styles.optionBtn, tshirtSize === s && styles.selected]}
              >
                <Text>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.label}>Sleeve Type:</Text>
          <View style={styles.row}>
            {['Half', 'Full'].map(s => (
              <TouchableOpacity
                key={s}
                onPress={() => setSleeveType(s)}
                style={[styles.optionBtn, sleeveType === s && styles.selected]}
              >
                <Text>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.label}>Fit Type:</Text>
          <View style={styles.row}>
            {['Regular', 'Slim'].map(s => (
              <TouchableOpacity
                key={s}
                onPress={() => setFitType(s)}
                style={[styles.optionBtn, fitType === s && styles.selected]}
              >
                <Text>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
        <Text style={styles.submitText}>Add to Cart</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default CustomizationForm;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 60,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#222',
  },
  label: {
    fontWeight: '600',
    marginBottom: 4,
    marginTop: 12,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 10,
  },
  optionBtn: {
    padding: 8,
    borderWidth: 1,
    borderRadius: 6,
    marginRight: 8,
    borderColor: '#999',
  },
  selected: {
    backgroundColor: '#FFD70040',
    borderColor: '#FFD700',
  },
  input: {
    borderWidth: 1,
    borderRadius: 6,
    borderColor: '#ccc',
    padding: 8,
    color: '#000',
  },
  uploadButton: {
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#888',
    marginTop: 10,
    marginBottom: 10,
  },
  imagePreview: {
    width: 120,
    height: 120,
    borderRadius: 8,
    marginBottom: 10,
  },
  submitBtn: {
    backgroundColor: '#FFD700',
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  submitText: {
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#000',
  },
  previewBox: {
  width: '100%',
  height: 200,
  marginBottom: 20,
  justifyContent: 'center',
  alignItems: 'center',
  borderWidth: 1,
  borderColor: '#ddd',
  borderRadius: 10,
  padding: 10,
},
keychainShape: {
  width: 120,
  height: 120,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: '#fff',
  overflow: 'hidden',
},
mugShape: {
  width: 140,
  height: 100,
  backgroundColor: '#fff',
  justifyContent: 'center',
  alignItems: 'center',
  position: 'relative',
  borderRadius: 10,
},
handle: {
  width: 20,
  height: 40,
  backgroundColor: '#fff',
  position: 'absolute',
  top: 30,
  borderRadius: 10,
},
tshirtShape: {
  width: 140,
  height: 140,
  backgroundColor: '#fff',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: 8,
},
previewImage: {
  width: '100%',
  height: '100%',
  position: 'absolute',
  zIndex: -1,
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
