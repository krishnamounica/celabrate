import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useWindowDimensions } from 'react-native';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Animated,
  Easing,
  Pressable,
  View,
  Text,
  Image,
} from 'react-native';
import styled from 'styled-components/native';
import axios from 'axios';
import normalizeUri from '../utils/normalizeUri';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../theme';

const BASE_URL = 'https://wishandsurprise.com/backend';

/* ---------- Styled ---------- */
const Container = styled.View`
  background-color: #f6f9f8;
  padding: 18px;
  border-radius: 16px;
  margin-bottom: 18px;
  elevation: 6;
  shadow-color: #000;
  shadow-offset: 0px 6px;
  shadow-opacity: 0.06;
  shadow-radius: 14px;
`;

const Title = styled.Text`
  font-size: ${theme.fonts.h2 + 4}px;
  font-weight: 800;
  color: ${theme.colors.brandDark || theme.colors.accent};
  text-align: center;
  margin-bottom: 12px;
`;

const Centered = styled.View`
  padding-vertical: 18px;
  align-items: center;
  justify-content: center;
`;

const EmptyText = styled.Text`
  color: #6b7280;
  font-size: 14px;
  text-align: center;
  margin-bottom: 12px;
`;

const ErrorText = styled.Text`
  color: #b91c1c;
  font-size: 14px;
  text-align: center;
`;

const FooterRow = styled.View`
  margin-top: 12px;
  align-items: center;
`;

const PrimaryButton = styled.Pressable`
  background-color: ${theme.colors.brand};
  padding-vertical: 10px;
  padding-horizontal: 18px;
  border-radius: 10px;
  min-width: 220px;
  align-items: center;
  elevation: 4;
`;

const PrimaryText = styled.Text`
  color: #fff;
  font-weight: 800;
`;

const ChipTouchable = styled(Pressable)`
  align-items: center;
  justify-content: center;
`;

const ChipLabel = styled.Text`
  margin-top: 8px;
  font-size: ${theme.fonts.label}px;
  font-weight: 700;
  color: ${theme.colors.brandDark || theme.colors.accent};
  text-transform: capitalize;
`;

function colorFromString(s) {
  if (!s) return '#6b7280';
  let hash = 0;
  for (let i = 0; i < s.length; i++) hash = s.charCodeAt(i) + ((hash << 5) - hash);
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue} 68% 45%)`;
}

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

export default function OccasionsChipsSliding() {
  const navigation = useNavigation();
  const { width: windowWidth } = useWindowDimensions();

  // Layout tuning
  const horizontalPadding = 18 * 2; // same as Container padding
  const chipWidth = Math.min(Math.max((windowWidth - horizontalPadding) * 0.28, 84), 140); // responsive
  const chipHeight = Math.round(chipWidth * 0.9);
  const snapInterval = chipWidth + 12; // spacing between chips

  const [relationships, setRelationships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const scrollX = useRef(new Animated.Value(0)).current;
  const animsRef = useRef([]);

  const fetchRelationships = useCallback(async () => {
    setError(null);
    try {
      const res = await axios.get(`${BASE_URL}/get-categories.php`);
      const raw = res?.data ?? [];
      const filtered = (Array.isArray(raw) ? raw : [])
        .filter((item) => item.block === 'occasions')
        .map((item) => ({
          ...item,
          id: String(item.id ?? item._id ?? item.name),
          name: item.name ?? 'Unknown',
          image: item.image ? `${BASE_URL}/${item.image}` : null,
        }));

      setRelationships(filtered);
      animsRef.current = filtered.map((_, i) =>
        animsRef.current[i] || {
          pressScale: new Animated.Value(1),
        }
      );
    } catch (err) {
      console.error('Relationship fetch error', err);
      setError('Unable to load categories. Please try again.');
      setRelationships([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchRelationships();
  }, [fetchRelationships]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchRelationships();
  }, [fetchRelationships]);

  const handleCategoryPress = (item) => {
    if (item?.id) navigation.navigate('ProductsScreen', { categoryId: item.id });
  };

  const renderItem = useCallback(({ item, index }) => {
    // create an input range around each item for interpolation
    const inputRange = [(index - 1) * snapInterval, index * snapInterval, (index + 1) * snapInterval];

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.92, 1, 0.92],
      extrapolate: 'clamp',
    });

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.7, 1, 0.7],
      extrapolate: 'clamp',
    });

    const initials = (item.name || '')
      .split(' ')
      .map((p) => p[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();

    const bg = colorFromString(item.id || item.name || initials);

    const anim = animsRef.current[index] || { pressScale: new Animated.Value(1) };

    const onPressIn = () => {
      Animated.spring(anim.pressScale, {
        toValue: 0.96,
        friction: 8,
        useNativeDriver: true,
      }).start();
    };
    const onPressOut = () => {
      Animated.spring(anim.pressScale, {
        toValue: 1,
        friction: 8,
        useNativeDriver: true,
      }).start();
    };

    const combined = {
      transform: [{ scale: Animated.multiply(scale, anim.pressScale) }],
      opacity,
    };

    return (
      <Animated.View style={{ width: chipWidth, paddingHorizontal: 6, alignItems: 'center' }}>
        <ChipTouchable
          onPress={() => handleCategoryPress(item)}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          accessibilityRole="button"
          accessibilityLabel={`Open ${item.name} gifts`}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Animated.View
            style={{
              width: chipWidth,
              height: chipHeight * 0.72,
              borderRadius: Math.round(chipWidth * 0.16),
              backgroundColor: '#fff',
              alignItems: 'center',
              justifyContent: 'center',
              elevation: 6,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.08,
              shadowRadius: 8,
              borderWidth: 1,
              borderColor: 'rgba(0,0,0,0.03)',
              overflow: 'hidden',
              ...combined,
            }}
          >
            {item.image ? (
              <Image
                source={{ uri: normalizeUri(item.image) }}
                style={{ width: '100%', height: '100%', resizeMode: 'cover' }}
              />
            ) : (
              <Animated.View style={{
                width: Math.round(chipHeight * 0.5),
                height: Math.round(chipHeight * 0.5),
                borderRadius: Math.round(chipHeight * 0.25),
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: bg,
              }}>
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>{initials || '?'}</Text>
              </Animated.View>
            )}
          </Animated.View>

          <ChipLabel numberOfLines={2} ellipsizeMode="tail">
            {item.name}
          </ChipLabel>
        </ChipTouchable>
      </Animated.View>
    );
  }, [chipWidth, chipHeight, snapInterval, handleCategoryPress]);

  const keyExtractor = useCallback((item) => item.id, []);

  return (
    <Container>
      <Title>Shop by occasions</Title>

      {loading ? (
        <Centered>
          <ActivityIndicator size="large" color={theme.colors.accent} />
        </Centered>
      ) : error ? (
        <Centered>
          <ErrorText>{error}</ErrorText>
          <View style={{ height: 12 }} />
          <PrimaryButton onPress={fetchRelationships} accessibilityRole="button">
            <PrimaryText>Retry</PrimaryText>
          </PrimaryButton>
        </Centered>
      ) : relationships.length === 0 ? (
        <Centered>
          <EmptyText>No relationships found right now. Try again later.</EmptyText>
          <PrimaryButton onPress={fetchRelationships}>
            <PrimaryText>Refresh</PrimaryText>
          </PrimaryButton>
        </Centered>
      ) : (
        <>
          <AnimatedFlatList
            data={relationships}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            contentContainerStyle={{ paddingHorizontal: 12, alignItems: 'center' }}
            snapToInterval={snapInterval}
            decelerationRate="fast"
            snapToAlignment="start"
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: true }
            )}
            scrollEventThrottle={16}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[theme.colors.accent]}
              />
            }
          />

          <FooterRow>
            <PrimaryButton
              onPress={() => navigation.navigate('Categories')}
              style={{ minWidth: 260, marginTop: 8 }}
              accessibilityRole="button"
              accessibilityLabel="See all categories"
            >
              <PrimaryText>See all categories</PrimaryText>
            </PrimaryButton>
          </FooterRow>
        </>
      )}
    </Container>
  );
}
