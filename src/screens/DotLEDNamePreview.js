// DotLEDNamePreview.js
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Linking,
  Dimensions,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Animated } from 'react-native';

const { width } = Dimensions.get('window');

const dotMap = {
  A: [[0,1],[1,0],[2,1],[0,2],[1,2],[2,2],[0,3],[2,3],[0,4],[2,4]],
  B: [[0,0],[1,0],[0,1],[1,1],[0,2],[1,2],[0,3],[1,3],[0,4],[1,4]],
  C: [[1,0],[0,1],[0,2],[0,3],[1,4]],
  D: [[0,0],[1,0],[2,1],[2,2],[2,3],[1,4],[0,4],[0,1],[0,3]],
  E: [[0,0],[1,0],[0,1],[0,2],[1,2],[0,3],[0,4],[1,4]],
  F: [[0,0],[1,0],[0,1],[0,2],[1,2],[0,3],[0,4]],
  G: [[1,0],[0,1],[0,2],[1,2],[2,2],[2,3],[1,4]],
  H: [[0,0],[0,1],[0,2],[1,2],[2,0],[2,1],[2,2],[2,3],[2,4],[0,3],[0,4]],
  I: [[1,0],[1,1],[1,2],[1,3],[1,4]],
  J: [[2,0],[2,1],[2,2],[0,4],[1,4],[2,4]],
  K: [[0,0],[0,1],[0,2],[1,2],[2,0],[1,3],[2,4]],
  L: [[0,0],[0,1],[0,2],[0,3],[0,4],[1,4],[2,4]],
  M: [[0,0],[0,1],[1,1],[1,2],[2,0],[2,1],[2,2],[2,3],[2,4],[0,4]],
  N: [[0,0],[0,1],[1,1],[1,2],[2,0],[2,1],[2,2],[2,3],[2,4],[0,4]],
  O: [[1,0],[0,1],[0,2],[0,3],[1,4],[2,1],[2,2],[2,3]],
  P: [[0,0],[1,0],[0,1],[1,1],[0,2],[1,2],[0,3],[0,4]],
  Q: [[1,0],[0,1],[0,2],[0,3],[1,4],[2,1],[2,2],[2,3],[1,2],[2,4]],
  R: [[0,0],[1,0],[0,1],[1,1],[0,2],[1,2],[0,3],[1,3],[0,4],[2,4]],
  S: [[1,0],[0,1],[1,2],[2,2],[1,3],[0,4],[1,4]],
  T: [[0,0],[1,0],[2,0],[1,1],[1,2],[1,3],[1,4]],
  U: [[0,0],[0,1],[0,2],[0,3],[1,4],[2,0],[2,1],[2,2],[2,3]],
  V: [[0,0],[0,1],[1,2],[2,0],[2,1],[1,4]],
  W: [[0,0],[0,1],[1,2],[1,3],[2,0],[2,1],[2,2],[2,3],[2,4],[0,4]],
  X: [[0,0],[2,0],[1,1],[1,2],[1,3],[0,4],[2,4]],
  Y: [[0,0],[2,0],[1,1],[1,2],[1,3],[1,4]],
  Z: [[0,0],[1,0],[2,0],[1,1],[1,2],[1,3],[0,4],[1,4],[2,4]],
  ' ': [],
  _: [[1,2]],
};

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const DotLEDCharacter = ({ char, color, animatedOpacity }) => {
  const grid = dotMap[char.toUpperCase()] || dotMap._;
  return (
    <Svg height={50} width={28}>
      {grid.map(([x, y], i) => (
        <AnimatedCircle
          key={i}
          cx={x * 10 + 10}
          cy={y * 10 + 10}
          r={4}
          fill={color}
          opacity={animatedOpacity}
        />
      ))}
    </Svg>
  );
};

export default function DotLEDNamePreview({ text = '' }) {
  const amazonUrl =
    'https://www.amazon.in/dp/B0DQ5Y7TLJ';
  const animatedOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedOpacity, {
          toValue: 0.5,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(animatedOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.wrap}>
      {/* Amazon Product Card */}
      <TouchableOpacity
        onPress={() => Linking.openURL(amazonUrl)}
        activeOpacity={0.8}
      >
        <Image
          source={{ uri: 'https://m.media-amazon.com/images/I/71L+eYs45XL._SL1500_.jpg' }}
          style={styles.image}
        />
      </TouchableOpacity>

      <Text style={styles.title}>
        Personalized Name LED Night Table Lamp Customized Gifts for Christmas…
      </Text>
      <Text style={styles.price}>₹393  <Text style={styles.old}>₹999</Text></Text>
      <Text style={styles.rating}>★ 4.2 (17 ratings)</Text>
      <Text style={styles.desc}>
        Warm white LED glow through an etched acrylic panel on a USB base.
      </Text>

      {/* Your Dot-Matrix Preview */}
      <View style={styles.preview}>
        {text.split('').map((c, i) => (
          <DotLEDCharacter
            key={i}
            char={c}
            color="#FFD700"
            animatedOpacity={animatedOpacity}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    margin: 12,
    elevation: 3,
  },
  image: {
    width: width - 48,
    height: (width - 48) * 0.6,
    borderRadius: 8,
    alignSelf: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
    color: '#333',
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 6,
    color: '#E91E63',
  },
  old: {
    fontWeight: '400',
    textDecorationLine: 'line-through',
    color: '#888',
    marginLeft: 8,
  },
  rating: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
  desc: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  preview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#000',
    padding: 10,
    borderRadius: 8,
    marginTop: 12,
    justifyContent: 'center',
  },
});
