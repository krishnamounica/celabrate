// src/screens/Banner.js
import React, { useRef, useEffect, useState } from 'react';
import {
  Animated,
  Easing,
  TouchableOpacity,
  View,
  StyleSheet,
  Text,
} from 'react-native';
import styled from 'styled-components/native';
import LinearGradient from 'react-native-linear-gradient';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { theme } from '../../../theme';

const Wrapper = styled.View`
  width: 100%;
  height: ${theme.sizes.heroHeight - 10}px;
  border-radius: ${theme.radius.card}px;
  overflow: hidden;
  justify-content: center;
  align-items: center;
  background-color: #eef8ff;

  /* TIGHTEN HEADER → BANNER */
  margin-top: -2px;

  padding-horizontal: 6px;

  /* SOFTER, LOWER SHADOW */
  elevation: 5;
  shadow-color: #000;
  shadow-offset: 0px 6px;
  shadow-opacity: 0.10;
  shadow-radius: 14px;
`;


/* Animated LinearGradient */
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

/* Content container */
const Content = styled.View`
  position: absolute;
  width: 100%;
  align-items: center;
  padding-horizontal: 20px;
  padding-top: 6px;
  z-index: 5;
`;

/* Title / Subtitle */
const TitleText = styled.Text`
  color: #052034;
  font-size: ${theme.fonts.h1 - 2}px;
  font-weight: 900;
  text-align: center;
  font-family: Montserrat-SemiBold;
  letter-spacing: 0.5px;
  line-height: ${theme.fonts.h1 + 4}px;
  max-width: 88%;
  flex-wrap: wrap;
`;

/* Subtitle */
const Subtitle = styled.Text`
  color: rgba(6,36,52,0.95);
  font-size: ${theme.fonts.h2 - 2}px;
  font-weight: 700;
  text-align: center;
  margin-top: 8px;
  max-width: 88%;
`;

/* CTA */
const CTA = styled.TouchableOpacity`
  margin-top: 18px;
  padding-vertical: 12px;
  padding-horizontal: 28px;
  border-radius: 28px;
  background-color: ${theme.brand || '#FF6A00'};
  elevation: 8;
  shadow-color: #000;
  shadow-opacity: 0.16;
  shadow-radius: 8px;
  shadow-offset: 0px 4px;
  z-index: 6;
`;

const CTAText = styled.Text`
  color: #fff;
  font-weight: 900;
  font-size: 16px;
`;

const Glass = styled.View`
  position: absolute;
  width: 82%;
  height: 46%;
  border-radius: ${theme.radius.card}px;
  background-color: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.08);
  bottom: 12%;
  z-index: 1;
`;

const WatermarkWrap = styled(Animated.View)`
  position: absolute;
  width: 100%;
  align-items: center;
  justify-content: center;
  top: 6%;
  z-index: 0;
  pointer-events: none;
`;

const Particle = styled(Animated.View)`
  position: absolute;
  background-color: rgba(255,255,255,0.22);
  border-radius: 8px;
`;

/* ---------- Component ---------- */
export default function Banner() {
  const slides = [
    {
      colors: ['#E6F7FF', '#CBE9FF', '#91D8FF'],
      icon: 'gift',
      title: 'Love Beyond Words',
      subtitle: 'Express it Beautifully',
    },
    {
      colors: ['#FFF6EA', '#FFE5C2', '#FFD08A'],
      icon: 'heart',
      title: 'Celebrate Together',
      subtitle: 'Gifts for Every Occasion',
    },
    {
      colors: ['#F6F8FF', '#E5F0FF', '#C6E1FF'],
      icon: 'star',
      title: 'Make Moments Special',
      subtitle: 'Curated Gifts, Just for You',
    },
    {
      colors: ['#EAF9F3', '#CFF2E7', '#9EE5D0'],
      icon: 'hand-holding-heart',
      title: 'Spread Happiness',
      subtitle: 'Thoughtful Gifts for Loved Ones',
    },
  ];

  const SLIDE_COUNT = slides.length;
  const AUTO_DELAY = 3800;

  // background opacity
  const opacityVals = useRef(slides.map(() => new Animated.Value(0))).current;

  // shimmer & vignette
  const shimmerTranslate = useRef(new Animated.Value(-1)).current;
  const vignetteOpacity = useRef(new Animated.Value(0.55)).current;

  // watermark
  const watermarkOpacity = useRef(new Animated.Value(0.06)).current;

  // particles
  const particles = useRef(
    Array.from({ length: 6 }).map(() => ({
      x: Math.random() * 80 + '%',
      y: Math.random() * 70 + '%',
      scale: new Animated.Value(0.7 + Math.random() * 0.6),
      opacity: new Animated.Value(0.12 + Math.random() * 0.12),
    }))
  ).current;

  // subtitle + CTA animation (kept)
  const subtitleY = useRef(new Animated.Value(12)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const ctaY = useRef(new Animated.Value(14)).current;
  const ctaOpacity = useRef(new Animated.Value(0)).current;

  // title letters state + animated refs
  const [titleChars, setTitleChars] = useState(slides[0].title.split(''));
  const letterAnims = useRef([]); // will hold array of {translateY, opacity}

  const [index, setIndex] = useState(0);
  const intervalRef = useRef(null);

  // initialize background & title chars
  useEffect(() => {
    opacityVals.forEach((v, i) => v.setValue(i === 0 ? 1 : 0));
    setupLetterAnims(slides[0].title);
    // initial text entrance
    runTitleLetters();
    runSubtitleCTA();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    intervalRef.current = setInterval(() => goToNext(), AUTO_DELAY);
    return () => {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  useEffect(() => {
    // shimmer loop
    Animated.loop(
      Animated.timing(shimmerTranslate, {
        toValue: 1,
        duration: 2400,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // watermark loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(watermarkOpacity, {
          toValue: 0.10,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(watermarkOpacity, {
          toValue: 0.04,
          duration: 1400,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // vignette loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(vignetteOpacity, {
          toValue: 0.45,
          duration: 1800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(vignetteOpacity, {
          toValue: 0.60,
          duration: 1800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // particles
    particles.forEach((p, i) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(p.scale, {
            toValue: 1.0,
            duration: 2000 + i * 200,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(p.scale, {
            toValue: 0.8 + Math.random() * 0.6,
            duration: 2000 + i * 200,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ])
      ).start();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // build letterAnims for a given title
  function setupLetterAnims(title) {
    const chars = title.split('');
    setTitleChars(chars);
    letterAnims.current = chars.map(() => ({
      translateY: new Animated.Value(8),
      opacity: new Animated.Value(0),
    }));
  }

  // run letter-by-letter animation (staggered)
  function runTitleLetters() {
    if (!letterAnims.current || letterAnims.current.length === 0) return;

    // reset values
    letterAnims.current.forEach((a) => {
      a.translateY.setValue(8);
      a.opacity.setValue(0);
    });

    // build animations array (for each char animate translateY & opacity in parallel)
    const anims = letterAnims.current.map((a) =>
      Animated.parallel([
        Animated.timing(a.translateY, {
          toValue: 0,
          duration: 280,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(a.opacity, {
          toValue: 1,
          duration: 260,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ])
    );

    // stagger small amount so letters appear one by one
    Animated.stagger(40, anims).start();
  }

  // subtitle + CTA entrance
  function runSubtitleCTA() {
    subtitleY.setValue(12);
    subtitleOpacity.setValue(0);
    ctaY.setValue(14);
    ctaOpacity.setValue(0);

    Animated.stagger(120, [
      Animated.parallel([
        Animated.timing(subtitleY, { toValue: 0, duration: 360, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(subtitleOpacity, { toValue: 1, duration: 360, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(ctaY, { toValue: 0, duration: 380, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(ctaOpacity, { toValue: 1, duration: 380, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
    ]).start();
  }

  // go to next slide
  const goToNext = () => {
    const next = (index + 1) % SLIDE_COUNT;

    // fade out content container quickly by reducing vignette + scale small (keeps bg change crisp)
    Animated.parallel([
      Animated.timing(vignetteOpacity, { toValue: 0.45, duration: 140, useNativeDriver: true }),
    ]).start(() => {
      // background crossfade
      const animations = opacityVals.map((val, i) =>
        Animated.timing(val, { toValue: i === next ? 1 : 0, duration: 520, easing: Easing.inOut(Easing.cubic), useNativeDriver: true })
      );

      Animated.parallel(animations).start(() => {
        setIndex(next);

        // rebuild letter anims for next title, then run letter animation + subtitle/cta
        setupLetterAnims(slides[next].title);

        // small delay to ensure layout updated
        setTimeout(() => {
          runTitleLetters();
          runSubtitleCTA();
        }, 80);
      });
    });
  };

  const handlePress = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    goToNext();
  };

  const shimmerTranslateX = shimmerTranslate.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-120%', '120%'],
  });

  return (
    <Wrapper>
      {/* animated gradients */}
      {slides.map((s, i) => (
        <AnimatedLinearGradient
          key={`bg-${i}`}
          colors={s.colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            ...StyleSheetAbsoluteFill,
            opacity: opacityVals[i],
            transform: [{ scale: opacityVals[i].interpolate({ inputRange: [0, 1], outputRange: [1, 1.01] }) }],
          }}
        />
      ))}

      {/* vignette */}
      <Animated.View pointerEvents="none" style={[StyleSheetAbsoluteFill, { backgroundColor: 'rgba(0,12,24,0.06)', opacity: vignetteOpacity, zIndex: 1 }]} />

      {/* particles */}
      {particles.map((p, idx) => (
        <Particle
          key={`p-${idx}`}
          style={{
            left: p.x,
            top: p.y,
            width: 8 + (idx % 3) * 4,
            height: 8 + (idx % 3) * 4,
            transform: [{ scale: p.scale }],
            opacity: p.opacity,
            zIndex: 1,
          }}
          pointerEvents="none"
        />
      ))}

      {/* glass overlay */}
      <Glass pointerEvents="none" />

      {/* shimmer band */}
      <Animated.View style={{ transform: [{ translateX: shimmerTranslateX }], left: '-22%', zIndex: 2 }} pointerEvents="none">
        <LinearGradient colors={['rgba(255,255,255,0.04)', 'rgba(255,255,255,0.20)', 'rgba(255,255,255,0.04)']} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={{ height: '100%', width: '100%', borderRadius: 999, transform: [{ skewX: '-12deg' }] }} />
      </Animated.View>

      {/* watermark */}
      <WatermarkWrap style={{ opacity: watermarkOpacity }}>
        <View style={{ width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center', zIndex: 0 }}>
          <FontAwesome5 name={slides[index].icon} size={56} color={theme.brand ? `${theme.brand}CC` : 'rgba(255,106,0,0.8)'} style={{ opacity: 0.12 }} />
        </View>
      </WatermarkWrap>

      {/* content on top */}
      <Content>
        <Animated.View style={{ alignItems: 'center' }}>
          {/* Title: render each char as Animated.Text using per-letter anim values */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>
            {titleChars.map((ch, i) => {
              const anim = letterAnims.current[i] || { translateY: new Animated.Value(0), opacity: new Animated.Value(1) };
              return (
                <Animated.Text
                  key={`char-${i}-${ch}`}
                  style={{
                    transform: [{ translateY: anim.translateY }],
                    opacity: anim.opacity,
                    fontSize: theme.fonts.h1 - 2,
                    fontWeight: '900',
                    color: '#052034',
                    lineHeight: theme.fonts.h1 + 4,
                    textAlign: 'center',
                    includeFontPadding: false,
                  }}
                >
                  {ch}
                </Animated.Text>
              );
            })}
          </View>

          {/* Subtitle animated wrapper */}
          <Animated.View style={{ transform: [{ translateY: subtitleY }], opacity: subtitleOpacity }}>
            <Subtitle numberOfLines={1}>{slides[index].subtitle}</Subtitle>
          </Animated.View>

          {/* CTA animated wrapper */}
          <Animated.View style={{ transform: [{ translateY: ctaY }], opacity: ctaOpacity }}>
            <CTA onPress={handlePress} accessibilityRole="button" activeOpacity={0.85}>
              <CTAText>Shop Popular Combos</CTAText>
            </CTA>
          </Animated.View>
        </Animated.View>
      </Content>
    </Wrapper>
  );
}

/* helper */
const StyleSheetAbsoluteFill = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
};
