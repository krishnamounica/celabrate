import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient'; // Import LinearGradient
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'; // Correct import

const { width } = Dimensions.get('window');

const slides = [
  { 
    id: 1, 
    icon: 'gift', 
    text1: 'Every Gift Tells a Story', 
    text2: 'Wrap it with Love 🎁', 
    bgColor: ['#B2EBF2', '#80DEEA'] // Gradient Colors
  },
  { 
    id: 2, 
    icon: 'heart', 
    text1: 'Love Beyond Words', 
    text2: 'Express it Beautifully 💖', 
    bgColor: ['#FFCCBC', '#FFAB91']
  },
  { 
    id: 3, 
    icon: 'shopping-bag', 
    text1: 'Find the Perfect Gift', 
    text2: 'Cherish Every Moment 🎊', 
    bgColor: ['#D1C4E9', '#B39DDB']
  },
  { 
    id: 4, 
    icon: 'star', 
    text1: 'Shine in Every Moment', 
    text2: 'You Deserve the Best ✨', 
    bgColor: ['#C8E6C9', '#A5D6A7']
  }
];

const Banner = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(fadeAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
          Animated.timing(scaleAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(fadeAnim, { toValue: 0.5, duration: 1200, useNativeDriver: true }),
          Animated.timing(scaleAnim, { toValue: 0.9, duration: 1200, useNativeDriver: true }),
        ]),
      ])
    );

    animation.start();

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => {
      clearInterval(interval);
      animation.stop();
    };
  }, []);

  return (
    <LinearGradient
      colors={slides[currentSlide].bgColor} // Use gradient colors
      style={styles.bannerContainer}
    >
      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <FontAwesome5 name={slides[currentSlide].icon} size={50} color="white" />
        <Text style={styles.bannerText}>{slides[currentSlide].text1}</Text>
        <Text style={styles.bannerHighlight}>{slides[currentSlide].text2}</Text>
      </Animated.View>
    </LinearGradient>
  );
};

export default Banner;

const styles = StyleSheet.create({
  bannerContainer: {
    width: width * 0.96,
    height: 180,
    borderRadius: 16,
    alignSelf: 'center',
    marginVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    overflow: 'hidden', // To apply gradient properly
  },

  content: {
    alignItems: 'center',
  },

  bannerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 10,
  },

  bannerHighlight: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
    marginTop: 5,
  },
});
