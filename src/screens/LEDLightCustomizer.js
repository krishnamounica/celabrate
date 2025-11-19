import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  FlatList,
  Alert,
} from 'react-native';

import Icon from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// Step options
const COLORS = ['Warm White', 'Red', 'Blue', 'Green'];
const SIZES = ['Small', 'Medium', 'Large'];
const FRAME_COLS = ['Black', 'White', 'Natural', 'Gold', 'Silver'];
const FONT_STYLES = ['Default', 'Cursive', 'Serif', 'Monospace', 'Bold'];
const FRAME_OPTIONS = [
  { key: 'Rectangle', lib: Icon, name: 'square-o' },
  { key: 'FreeForm', lib: MaterialCommunityIcons, name: 'shape-outline' },
  { key: 'Circle', lib: Icon, name: 'circle-o' },
  { key: 'Oval', lib: MaterialCommunityIcons, name: 'ellipse-outline' },
  { key: 'Star', lib: Icon, name: 'star-o' },
  { key: 'Hexagon', lib: MaterialCommunityIcons, name: 'hexagon-outline' },
  { key: 'Cloud', lib: Icon, name: 'cloud-o' },
];
const MAX_STEP = 7;

export default function LEDLightCustomizer({ onSubmit }) {
  const [step, setStep] = useState(1);
  const [text, setText] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [size, setSize] = useState(SIZES[1]);
  const [frame, setFrame] = useState(FRAME_OPTIONS[0].key);
  const [frameColor, setFrameColor] = useState(FRAME_COLS[0]);
  const [fontStyle, setFontStyle] = useState(FONT_STYLES[0]);
  const [standType, setStandType] = useState('wall');

  const previewDims = { Small: 120, Medium: 180, Large: 240 };
  const chosenShape = FRAME_OPTIONS.find(f => f.key === frame);
  const ShapeLib = chosenShape.lib;
  const FRAME_ICON_COLOR = frameColor.toLowerCase();

  const next = () => setStep(s => Math.min(s + 1, MAX_STEP));
  const back = () => setStep(s => Math.max(s - 1, 1));

  const handleSubmit = () => {
    const order = {
      text,
      color,
      size,
      frame,
      frameColor,
      fontStyle,
      standType,
    };
    if (typeof onSubmit === 'function') {
      onSubmit(order);
    } else {
      Alert.alert('Added to Cart', JSON.stringify(order, null, 2));
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>✨ Live Preview</Text>
      <View
        style={[styles.previewContainer, { width: previewDims[size], height: previewDims[size] }]}
      >
        <ShapeLib
          name={chosenShape.name}
          size={previewDims[size]}
          color={FRAME_ICON_COLOR}
          style={styles.previewIcon}
        />
        <Text
          numberOfLines={4}
          adjustsFontSizeToFit
          style={[styles.previewText, {
            color: color.toLowerCase(),
            maxWidth: previewDims[size] * 0.9,
            fontFamily:
              fontStyle === 'Cursive' ? 'Cochin' :
              fontStyle === 'Serif' ? 'Times New Roman' :
              fontStyle === 'Monospace' ? 'Courier New' :
              undefined,
            fontWeight: fontStyle === 'Bold' ? '900' : 'normal',
          }]}
        >
          {text || 'YOUR TEXT'}
        </Text>
        {standType === 'wall' ? (
          <MaterialCommunityIcons
            name="hook"
            size={30}
            color="#444"
            style={styles.standIconWall}
          />
        ) : (
          <View style={styles.standBar} />
        )}
      </View>

      {step === 1 && (
        <>
          <Text style={styles.label}>Step 1: Enter Text</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. ANITHA"
            value={text}
            onChangeText={setText}
            autoCapitalize="characters"
          />
        </>
      )}

      {step === 2 && (
        <>
          <Text style={styles.label}>Step 2: Pick LED Color</Text>
          <View style={styles.optionsRow}>
            {COLORS.map(c => (
              <TouchableOpacity
                key={c}
                style={[styles.optionBtn, color === c && styles.selectedBtn]}
                onPress={() => setColor(c)}
              >
                <Text>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      {step === 3 && (
        <>
          <Text style={styles.label}>Step 3: Choose Size</Text>
          <View style={styles.optionsRow}>
            {SIZES.map(s => (
              <TouchableOpacity
                key={s}
                style={[styles.optionBtn, size === s && styles.selectedBtn]}
                onPress={() => setSize(s)}
              >
                <Text>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      {step === 4 && (
        <>
          <Text style={styles.label}>Step 4: Pick Frame Style</Text>
          <FlatList
            data={FRAME_OPTIONS}
            horizontal
            keyExtractor={item => item.key}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: 10 }}
            renderItem={({ item }) => {
              const IconLib2 = item.lib;
              return (
                <TouchableOpacity
                  onPress={() => setFrame(item.key)}
                  style={[styles.frameThumbContainer, frame === item.key && styles.frameThumbSelected]}
                >
                  <IconLib2 name={item.name} size={40} color={frame === item.key ? '#FFA500' : '#555'} />
                  <Text style={styles.frameThumbLabel}>{item.key}</Text>
                </TouchableOpacity>
              );
            }}
          />
        </>
      )}

      {step === 5 && (
        <>
          <Text style={styles.label}>Step 5: Frame Color</Text>
          <View style={styles.optionsRow}>
            {FRAME_COLS.map(fc => (
              <TouchableOpacity
                key={fc}
                style={[styles.optionBtn, frameColor === fc && styles.selectedBtn]}
                onPress={() => setFrameColor(fc)}
              >
                <Text>{fc}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      {step === 6 && (
        <>
          <Text style={styles.label}>Step 6: Font Style</Text>
          <View style={styles.optionsRow}>
            {FONT_STYLES.map(fs => (
              <TouchableOpacity
                key={fs}
                style={[styles.optionBtn, fontStyle === fs && styles.selectedBtn]}
                onPress={() => setFontStyle(fs)}
              >
                <Text>{fs}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      {step === 7 && (
        <>
          <Text style={styles.label}>Step 7: How to Display</Text>
          <View style={styles.optionsRow}>
            <TouchableOpacity
              style={[styles.optionBtn, standType === 'wall' && styles.selectedBtn]}
              onPress={() => setStandType('wall')}
            >
              <Text>Wall Hang</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.optionBtn, standType === 'table' && styles.selectedBtn]}
              onPress={() => setStandType('table')}
            >
              <Text>Table Stand</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
            <Text style={styles.submitText}>Add to Cart</Text>
          </TouchableOpacity>
        </>
      )}

      <View style={styles.navRow}>
        {step > 1 && (
          <TouchableOpacity style={styles.navBtn} onPress={back}>
            <Icon name="arrow-left" size={24} color="#333" />
          </TouchableOpacity>
        )}
        {step < MAX_STEP && (
          <TouchableOpacity style={styles.navBtn} onPress={next}>
            <Icon name="arrow-right" size={24} color="#333" />
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, alignItems: 'center' },
  heading: { fontSize: 20, fontWeight: 'bold', marginBottom: 16, color: '#444' },
  previewContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 10,
    marginBottom: 30,
    backgroundColor: '#f9f9f9',
  },
  previewIcon: { position: 'absolute', top: 0, left: 0, zIndex: 0 },
  previewText: {
    zIndex: 1,
    textAlign: 'center',
    letterSpacing: 2,
    fontSize: 20,
    fontWeight: 'bold',
    lineHeight: 24,
    textTransform: 'uppercase',
    textShadowColor: '#fff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
    includeFontPadding: false,
    allowFontScaling: false,
    maxFontSizeMultiplier: 1.2,
    alignSelf: 'flex-start',
    margin: 20,
  },
  standIconWall: { position: 'absolute', top: -15, zIndex: 2 },
  standBar: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 8,
    backgroundColor: '#888',
    borderRadius: 4,
    zIndex: 2,
  },
  label: { alignSelf: 'flex-start', marginBottom: 8, fontWeight: '600', fontSize: 16 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    width: '100%',
    padding: 10,
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
    justifyContent: 'center',
  },
  optionBtn: {
    borderWidth: 1,
    borderColor: '#aaa',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 6,
    backgroundColor: '#fff',
  },
  selectedBtn: {
    backgroundColor: '#FFD70050',
    borderColor: '#FFD700',
  },
  frameThumbContainer: { alignItems: 'center', marginHorizontal: 8 },
  frameThumbLabel: { marginTop: 4, fontSize: 12, color: '#333' },
  frameThumbSelected: {
    borderWidth: 2,
    borderColor: '#FFA500',
    borderRadius: 8,
    padding: 2,
    backgroundColor: '#fff8e1',
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  navBtn: {
    padding: 10,
    borderRadius: 6,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 10,
  },
  submitBtn: {
    backgroundColor: '#FFA500',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    width: '100%',
  },
  submitText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
