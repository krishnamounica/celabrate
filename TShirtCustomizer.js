import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ImageBackground, Image, StyleSheet, TextInput, Alert,
  ScrollView
} from 'react-native';
import Draggable from 'react-native-draggable';
import ImagePicker from 'react-native-image-crop-picker';
import Icon from 'react-native-vector-icons/FontAwesome5';

const COLORS = ['white', 'red', 'blue', 'black'];
const POCKET_TYPES = ['None', 'Left', 'Right', 'Double'];
const COLLAR_TYPES = ['round', 'v-neck'];

const TShirtCustomizer = () => {
  const [shirtColor, setShirtColor] = useState('white');
  const [shirtSize, setShirtSize] = useState('M');
  const [pocketType, setPocketType] = useState('Left');
  const [collarType, setCollarType] = useState('round');
  const [customText, setCustomText] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [viewSide, setViewSide] = useState('front'); // 'front' or 'back'

  const pickImage = () => {
    ImagePicker.openPicker({ width: 500, height: 500, cropping: true })
      .then(image => setImageUri(image.path))
      .catch(err => {
        if (err.code !== 'E_PICKER_CANCELLED') {
          Alert.alert('Image selection failed.');
        }
      });
  };

  const renderPocket = () => {
    if (pocketType === 'None' || viewSide === 'back') return null;
    const style = [styles.pocket];
    if (pocketType === 'Right') style.push({ left: 130 });
    if (pocketType === 'Double') style.push({ left: 50 });
    return <Image source={require('./src/assets/images/pocket_icon.png')} style={style} />;
  };

  return (
    <ScrollView>
         <View style={styles.container}>
      <Text style={styles.heading}>👕 T-Shirt Customizer</Text>

      {/* View Toggle */}
      <View style={styles.row}>
        <TouchableOpacity onPress={() => setViewSide('front')} style={styles.iconBtn}>
          <Icon name="tshirt" size={22} color={viewSide === 'front' ? '#FFD700' : '#888'} />
          <Text>Front</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setViewSide('back')} style={styles.iconBtn}>
          <Icon name="undo" size={22} color={viewSide === 'back' ? '#FFD700' : '#888'} />
          <Text>Back</Text>
        </TouchableOpacity>
      </View>

      {/* Preview */}
      <View style={styles.preview}>
        <ImageBackground
          source={
            shirtColor === 'red' ? require('./src/assets/images/tshirt_red.png')
              : shirtColor === 'blue' ? require('./src/assets/images/tshirt_blue.png')
              : shirtColor === 'black' ? require('./src/assets/images/tshirt_black.png')
              : require('./src/assets/images/tshirt_white.png')
          }
          style={styles.tshirt}
          resizeMode="contain"
        >
          {renderPocket()}

          {customText !== '' && (
            <Draggable x={60} y={90}>
              <Text style={styles.overlayText}>{customText}</Text>
            </Draggable>
          )}

          {imageUri && (
            <Draggable x={60} y={160}>
              <Image source={{ uri: imageUri }} style={styles.tshirtImage} resizeMode="contain" />
            </Draggable>
          )}
        </ImageBackground>
      </View>

      {/* Input Controls */}
      <Text style={styles.label}>Text:</Text>
      <TextInput
        placeholder="Enter T-Shirt Text"
        value={customText}
        onChangeText={setCustomText}
        style={styles.input}
      />

      <Text style={styles.label}>Color:</Text>
      <View style={styles.row}>
        {COLORS.map(c => (
          <TouchableOpacity key={c} onPress={() => setShirtColor(c)} style={[styles.option, shirtColor === c && styles.selected]}>
            <Text>{c}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Size:</Text>
      <View style={styles.row}>
        {['S', 'M', 'L', 'XL'].map(s => (
          <TouchableOpacity key={s} onPress={() => setShirtSize(s)} style={[styles.option, shirtSize === s && styles.selected]}>
            <Text>{s}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Pockets:</Text>
      <View style={styles.row}>
        {POCKET_TYPES.map(p => (
          <TouchableOpacity key={p} onPress={() => setPocketType(p)} style={[styles.option, pocketType === p && styles.selected]}>
            <Text>{p}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Collar Type:</Text>
      <View style={styles.row}>
        <TouchableOpacity onPress={() => setCollarType('round')} style={styles.iconBtn}>
          <Icon name="circle-notch" size={20} color={collarType === 'round' ? '#FFD700' : '#888'} />
          <Text>Round</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setCollarType('v-neck')} style={styles.iconBtn}>
          <Icon name="angle-down" size={20} color={collarType === 'v-neck' ? '#FFD700' : '#888'} />
          <Text>V-Neck</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.uploadBtn} onPress={pickImage}>
        <Text>{imageUri ? 'Change Image' : 'Upload Image'}</Text>
      </TouchableOpacity>
    </View>
    </ScrollView>
   
  );
};

export default TShirtCustomizer;

const styles = StyleSheet.create({
  container: { padding: 16 },
  heading: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 8, borderRadius: 6, marginBottom: 10 },
  label: { fontWeight: 'bold', marginTop: 10 },
  row: { flexDirection: 'row', gap: 10, marginVertical: 8, flexWrap: 'wrap' },
  option: { borderWidth: 1, borderColor: '#999', padding: 6, borderRadius: 6 },
  selected: { backgroundColor: '#FFD70050', borderColor: '#FFD700' },
  uploadBtn: { backgroundColor: '#eee', padding: 8, marginVertical: 8, borderRadius: 6 },
  preview: { alignItems: 'center', marginBottom: 16 },
  tshirt: {
    width: 200,
    height: 240,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  tshirtImage: {
    width: 60,
    height: 60,
  },
  pocket: {
    width: 40,
    height: 40,
    position: 'absolute',
    top: '30%',
    left: 85,
  },
  overlayText: {
    backgroundColor: '#ffffffcc',
    fontWeight: 'bold',
    padding: 4,
    borderRadius: 4,
  },
  iconBtn: {
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#999',
    padding: 6,
    borderRadius: 6,
  },
});
 