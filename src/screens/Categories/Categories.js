// src/screens/CategoryList.jsx
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Animated,
  Easing,
  View as RNView,
  TouchableOpacity,
  FlatList,
  Text,
} from 'react-native';
import Header from '../Home/Header';
import normalizeUri from '../../utils/normalizeUri';
import withSplashScreen from '../../navigation/withSplashScreen';
import styled from 'styled-components/native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { theme } from '../../../theme';

const BASE = 'https://wishandsurprise.com/backend';
const screenWidth = Dimensions.get('window').width;

const CARD_MARGIN = 12;
const COLUMNS = 2;
const containerPadding = 20;
const cardWidth = Math.floor(
  (screenWidth - containerPadding * 2 - CARD_MARGIN * (COLUMNS - 1)) / COLUMNS
);

/* ---------------- Styled components ---------------- */

const Safe = styled.SafeAreaView`
  flex: 1;
  background-color: #fff6f0;
`;

const OuterScroll = styled.ScrollView`
  flex: 1;
`;

const PagePad = styled.View`
  padding: ${containerPadding}px;
  padding-bottom: 36px;
`;

const ContentBlock = styled.View`
  background-color: #ffffff;
  border-radius: 18px;
  padding: 18px;
  margin-bottom: 18px;
  elevation: 8;
  shadow-color: #000;
  shadow-offset: 0px 8px;
  shadow-opacity: 0.08;
  shadow-radius: 20px;
`;

/* small container for icon background (non-animated styles) */
const SectionIconBg = styled(Animated.View)`
  width: 52px;
  height: 52px;
  border-radius: 12px;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
  elevation: 2;
`;

/* Title & description */
const SectionTitleText = styled(Animated.Text)`
  font-size: 18px;
  font-weight: 800;
  color: #111827;
  text-align: center;
`;

const SectionDescription = styled.Text`
  margin-top: 6px;
  font-size: 12px;
  color: #6b7280;
  text-align: center;
`;

/* Card styles (same as before) */
const CardWrap = styled.View`
  width: ${cardWidth}px;
  background-color: #fff;
  border-radius: 14px;
  padding: 10px;
  margin-bottom: 12px;
  elevation: 3;
  shadow-color: #000;
  shadow-offset: 0px 4px;
  shadow-opacity: 0.06;
  shadow-radius: 8px;
  align-items: center;
  border: 1px solid #f3f3f3;
`;

const CatImageWrap = styled.View`
  width: 100%;
  height: ${Math.round(cardWidth * 0.62)}px;
  border-radius: 12px;
  overflow: hidden;
  background-color: #fff7ec;
  justify-content: center;
  align-items: center;
`;

const CatImage = styled(Image)`
  width: 100%;
  height: 100%;
`;

const Placeholder = styled.View`
  width: 100%;
  height: 100%;
  background-color: #fff7ec;
  justify-content: center;
  align-items: center;
`;

const PlaceholderInitial = styled.Text`
  font-size: 30px;
  font-weight: 800;
  color: #ff7a00;
`;

const CatName = styled.Text`
  margin-top: 8px;
  font-size: 13px;
  font-weight: 700;
  color: #111827;
  text-align: center;
`;

const CatSubtitle = styled.Text`
  margin-top: 6px;
  font-size: 11px;
  color: #6b7280;
  text-align: center;
`;

const Badge = styled.View`
  position: absolute;
  top: 10px;
  left: 10px;
  background-color: #fff2ea;
  padding: 4px 8px;
  border-radius: 6px;
  z-index: 10;
`;

const BadgeText = styled.Text`
  color: #ff6a00;
  font-size: 10px;
  font-weight: 700;
`;

const SectionCaption = styled.Text`
  margin-top: 12px;
  font-size: 12px;
  color: #6b7280;
  text-align: center;
`;

const LoaderWrap = styled.View`
  margin-top: 40px;
  align-items: center;
`;

/* Empty screen state */
const EmptyWrap = styled.View`
  padding: 40px 20px;
  align-items: center;
  justify-content: center;
`;

const EmptyTitle = styled.Text`
  font-size: 18px;
  font-weight: 800;
  color: #111827;
  margin-top: 12px;
`;

const EmptyDesc = styled.Text`
  margin-top: 8px;
  font-size: 14px;
  color: #6b7280;
  text-align: center;
  max-width: 300px;
`;

const RetryButton = styled.TouchableOpacity`
  margin-top: 18px;
  padding-vertical: 10px;
  padding-horizontal: 18px;
  background-color: ${theme.brand || '#FF6A00'};
  border-radius: 10px;
`;

const RetryText = styled.Text`
  color: #fff;
  font-weight: 700;
`;

/* skeleton card for loading */
const SkeletonCard = styled.View`
  width: ${cardWidth}px;
  height: 220px;
  border-radius: 14px;
  background-color: #eee;
  margin-right: 12px;
`;

/* ---------------- helper utils ---------------- */

const groupByBlock = (arr) => {
  const groups = { relation: [], dates: [], occasions: [], others: [] };
  (arr || []).forEach((it) => {
    const block = String((it?.block ?? '')).toLowerCase();
    if (block === 'relation') groups.relation.push(it);
    else if (block === 'dates') groups.dates.push(it);
    else if (block === 'occasions') groups.occasions.push(it);
    else groups.others.push(it);
  });
  return groups;
};

const AnimatedTouchable = ({ children, onPress, style, activeScale = 0.97 }) => {
  const animRef = useRef(null);
  if (!animRef.current) animRef.current = new Animated.Value(1);
  const anim = animRef.current;

  const pressIn = () => {
    Animated.timing(anim, {
      toValue: activeScale,
      duration: 120,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  };
  const pressOut = () => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 160,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={[{ transform: [{ scale: anim }] }, style]}>
      <RNView style={{ borderRadius: 14, overflow: 'hidden' }}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPressIn={pressIn}
          onPressOut={pressOut}
          onPress={onPress}
        >
          {children}
        </TouchableOpacity>
      </RNView>
    </Animated.View>
  );
};

/* ---------------- Animated SectionHeader component ----------------
   Props:
   - iconName: FontAwesome5 icon name
   - title: string
   - description: string
   - color: background color for icon box
------------------------------------------------------------------*/
const SectionHeaderAnimated = ({ iconName, title, description, color }) => {
  const iconAnim = useRef(new Animated.Value(0)).current; // 0 -> 1
  const titleAnim = useRef(new Animated.Value(0)).current; // 0 -> 1

  useEffect(() => {
    // entrance: icon slides up + fades, then title fades+scale
    Animated.sequence([
      Animated.timing(iconAnim, {
        toValue: 1,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.delay(80),
      Animated.timing(titleAnim, {
        toValue: 1,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [iconAnim, titleAnim]);

  const iconTranslate = iconAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [6, 0],
  });

  const titleScale = titleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.98, 1],
  });

  const titleOpacity = titleAnim;

  return (
    <RNView style={{ width: '100%', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
      <SectionIconBg
        style={{
          backgroundColor: color || 'rgba(255,106,0,0.08)',
          opacity: iconAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] }),
          transform: [{ translateY: iconTranslate }],
        }}
      >
        <Icon name={iconName} size={20} color={theme.brand || '#FF6A00'} solid />
      </SectionIconBg>

      <SectionTitleText
        style={{
          transform: [{ scale: titleScale }],
          opacity: titleOpacity,
        }}
      >
        {title}
      </SectionTitleText>

      {description ? <SectionDescription>{description}</SectionDescription> : null}
    </RNView>
  );
};

/* ---------------- Component ---------------- */

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigation = useNavigation();

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BASE}/get-categories.php`);
      const data = await res.json();
      const normalized = Array.isArray(data)
        ? data.map((it) => ({
            id: it?.id != null ? String(it.id) : '',
            name: typeof it?.name === 'string' ? it.name : '',
            image: it?.image || null,
            block: it?.block != null ? String(it.block).toLowerCase() : '',
          }))
        : [];
      setCategories(normalized);
    } catch (err) {
      console.error('API error:', err);
      setError('Failed to load categories');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    // call the fetchCategories function
    if (mounted) fetchCategories();
    return () => {
      mounted = false;
    };
  }, [fetchCategories]);

  const groups = useMemo(() => groupByBlock(categories), [categories]);

  const handleCategoryPress = (item) => {
    if (item?.id) navigation.navigate('ProductsScreen', { categoryId: item.id });
  };

  const renderCard = (item) => {
    const displayName = item?.name?.trim() ? item.name.trim() : 'Unnamed';
    const imageUrl = item?.image ? normalizeUri(`${BASE}/${item.image}`) : null;

    return (
      <CardWrap>
        {item.block ? (
          <Badge>
            <BadgeText>{String(item.block).toUpperCase()}</BadgeText>
          </Badge>
        ) : null}

        <CatImageWrap>
          {imageUrl ? (
            <CatImage source={{ uri: imageUrl }} resizeMode="cover" />
          ) : (
            <Placeholder>
              <PlaceholderInitial>
                {(displayName || 'U').charAt(0).toUpperCase()}
              </PlaceholderInitial>
            </Placeholder>
          )}
        </CatImageWrap>

        <CatName numberOfLines={2}>{displayName}</CatName>
        <CatSubtitle numberOfLines={2}>Tap to explore gifts in this category</CatSubtitle>
      </CardWrap>
    );
  };

  const renderFlatItem = ({ item }) => (
    <AnimatedTouchable onPress={() => handleCategoryPress(item)} style={{ marginBottom: 12 }}>
      {renderCard(item)}
    </AnimatedTouchable>
  );

  // Per-flatlist empty component (returns a view to avoid layout quirks)
  const PerListEmpty = ({ message = 'No items here.' }) => (
    <RNView style={{ paddingVertical: 18, alignItems: 'center', width: '100%' }}>
      <SectionDescription>{message}</SectionDescription>
    </RNView>
  );

  if (loading) {
    return (
      <Safe>
        <Header />
        <PagePad>
          <LoaderWrap>
            <ActivityIndicator size="large" color="#ff7a00" />
          </LoaderWrap>

          <RNView style={{ height: 12 }} />

          <RNView style={{ flexDirection: 'row' }}>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </RNView>
        </PagePad>
      </Safe>
    );
  }

  // When loading is finished but no categories at all -> show friendly empty screen (single)
  if (!loading && categories.length === 0) {
    return (
      <Safe>
        <Header />
        <PagePad>
          <EmptyWrap>
            <Icon name="boxes" size={44} color="#d1d5db" />
            <EmptyTitle>No categories found</EmptyTitle>
            <EmptyDesc>We couldn't find any categories right now. Try again or check back later.</EmptyDesc>
            <RetryButton onPress={fetchCategories}>
              <RetryText>Retry</RetryText>
            </RetryButton>
            {error ? <SectionDescription style={{ marginTop: 12 }}>{error}</SectionDescription> : null}
          </EmptyWrap>
        </PagePad>
      </Safe>
    );
  }

  return (
    <Safe>
      <Header />

      <OuterScroll>
        <PagePad>
          {/* Relations */}
         
<ContentBlock>
  <SectionHeaderAnimated
    iconName="user-friends"
    title="Relations"
    description="For him, her, kids and everyone you love."
    color="rgba(99,102,241,0.10)"
  />

  {groups.relation && groups.relation.length > 0 ? (
    <FlatList
      data={groups.relation}
      renderItem={renderFlatItem}
      keyExtractor={(it, idx) => (it?.id ? String(it.id) : String(idx))}
      numColumns={2}
      columnWrapperStyle={{ justifyContent: 'space-between' }}
      scrollEnabled={false}
      showsVerticalScrollIndicator={false}
    />
  ) : (
    <PerListEmpty message="No products found in this category." />
  )}

  <SectionCaption>Handpicked collections for relationships.</SectionCaption>
</ContentBlock>

{/* Occasions */}
<ContentBlock>
  <SectionHeaderAnimated
    iconName="gift"
    title="Occasions"
    description="Celebrate every beautiful moment."
    color="rgba(16,185,129,0.08)"
  />

  {groups.occasions && groups.occasions.length > 0 ? (
    <FlatList
      data={groups.occasions}
      renderItem={renderFlatItem}
      keyExtractor={(it, idx) => (it?.id ? String(it.id) : String(idx))}
      numColumns={2}
      columnWrapperStyle={{ justifyContent: 'space-between' }}
      scrollEnabled={false}
      showsVerticalScrollIndicator={false}
    />
  ) : (
    <PerListEmpty message="No occasions found." />
  )}

  <SectionCaption>Special moments & celebrations.</SectionCaption>
</ContentBlock>


          {/* Special Days & Festivals */}
          <ContentBlock>
            <SectionHeaderAnimated
              iconName="calendar"
              title="Special Days & Festivals"
              description="Gifts curated for festivals and seasonal moments."
              color="rgba(249,115,22,0.06)"
            />

            <FlatList
              data={groups.dates}
              renderItem={renderFlatItem}
              keyExtractor={(it, idx) => (it?.id ? String(it.id) : String(idx))}
              numColumns={2}
              columnWrapperStyle={{ justifyContent: 'space-between' }}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={<PerListEmpty message="No festival items yet." />}
            />

            <SectionCaption>Gifts curated for festivals and occasions.</SectionCaption>
          </ContentBlock>

          {/* More Categories */}
          <ContentBlock>
            <SectionHeaderAnimated
              iconName="th-large"
              title="More Categories"
              description="Unique and meaningful gift ideas."
              color="rgba(99,102,241,0.06)"
            />

            <FlatList
              data={groups.others}
              renderItem={renderFlatItem}
              keyExtractor={(it, idx) => (it?.id ? String(it.id) : String(idx))}
              numColumns={2}
              columnWrapperStyle={{ justifyContent: 'space-between' }}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={<PerListEmpty message="No categories available." />}
            />

            <SectionCaption>Unique themes, styles and experiences.</SectionCaption>
          </ContentBlock>
        </PagePad>
      </OuterScroll>
    </Safe>
  );
};

export default withSplashScreen(CategoryList);
