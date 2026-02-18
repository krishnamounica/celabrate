// src/screens/Home.js
import React, { useRef } from 'react';
import { FlatList, View } from 'react-native';
import styled from 'styled-components/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../../theme';
import Header from './Header';
import Banner from './Banner';
import RelationshipScreen from '../RelationshipScreen';
import GiftPacksGrid from '../../navigation/GiftPacksGrid';
import LinearGradient from 'react-native-linear-gradient';
import ProductListScreen from '../ProductListScreen';
import OccasionsChipsSliding from '../occasionsChipsSliding';

const Container = styled.View`
  flex: 1;
  background-color: ${theme.colors.bg};
`;

const GradientBackground = styled(LinearGradient).attrs({
//  colors: ['#FFF8E7', '#FFE6A8', '#FFB947']
// colors: ['#FFF6EF', '#FFE1CC', '#FFC299']
// colors: ['#FFF5EB', '#FFD7B5', '#FF6600']
// colors: ['#FFF5EB', '#FFD7B5', '#FF9340']
colors: ['#FFF5EB', '#FFD7B5', '#FF6600']



,

  start: { x: 0, y: 0 },
  end: { x: 0, y: 1 },
})`
  flex: 1;
`;

export default function Home({ navigation }) {
  const insets = useSafeAreaInsets();
  const flatRef = useRef(null);

  // If you want a small data set to enable FlatList rendering, supply an empty array.
  // The important part is using ListHeaderComponent to host the content with internal FlatList(s) avoided.
  const dummy = [];

  const ListHeader = () => (
    <View style={{ paddingHorizontal: theme.spacing.page, paddingTop: 12 }}>
      {/* Header */}
      <View style={{ marginBottom: theme.spacing.section }}>
        <Header />
      </View>

      {/* Hero */}
      <View style={{ marginBottom: theme.spacing.section }}>
        <Banner />
      </View>

     
          <View style={{ marginBottom: theme.spacing.section }}>
        <RelationshipScreen />
      </View>
          <View style={{ marginBottom: theme.spacing.section }}>
        <OccasionsChipsSliding />
      </View>

       <View style={{ marginBottom: theme.spacing.section }}>
        <ProductListScreen />
      </View>
      <View style={{ marginBottom: theme.spacing.section }}>
        <GiftPacksGrid previewOnly />
      </View>

      {/* Relationships */}
      
       

      {/* spacer */}
      <View style={{ height: 10 }} />
    </View>
  );

  return (
    <GradientBackground>
      <FlatList
        ref={flatRef}
        data={dummy}
        keyExtractor={(_, i) => String(i)}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={{ paddingBottom: insets.bottom + theme.sizes.navOverlap }}
        renderItem={null}
      />
    </GradientBackground>
  );
}
