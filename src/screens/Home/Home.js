import { SafeAreaView, StyleSheet, ScrollView, View, Text } from 'react-native';
import React from 'react';
import ProductListScreen from '../ProductListScreen';
import BestOffers from '../BestOffers';
import RelationshipScreen from '../RelationshipScreen';
import Categories from '../Categories';
import Banner from './Banner';
import Header from './Header';
import CelebrationsCalendar from '../CelebrationsCalendar';
import Gsignin from '../Gsignin';
import TShirtCustomizer from '../../../TShirtCustomizer';
import withSplashScreen from '../../navigation/withSplashScreen';
import GiftPacksGrid from '../../navigation/GiftPacksGrid';


const Home = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>

        {/* Best Offers Section - Now has proper top spacing */}
        <View style={styles.firstSection}>
        <Header />
      </View>

        <View style={styles.firstSection}>
        <Banner />
      </View>

       <View style={styles.section}>
        <GiftPacksGrid />
          {/* <BestOffers /> */}
        </View>
        {/* <View style={styles.section}>
          <TShirtCustomizer />
        </View> */}

        <View style={styles.section}>
          <RelationshipScreen />
        </View>

        <View style={styles.section}>
          <ProductListScreen />
        </View>
        <View style={styles.lastsection}>
          <CelebrationsCalendar />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

export default withSplashScreen(Home);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 5, // Ensures spacing from top edge
  },
  scrollContainer: {
    paddingBottom: 5,
  },
  section: {
    marginBottom: 5,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  firstSection: {
    flex:1
    // marginTop: 10, // Pushes Best Offers down to ensure visibility
  },
  lastsection: {
    flex:1,
    // backgroundColor: 'red',
    marginBottom:40,
    justifyContent:"center",
    fontStyle:'bold'
  }
});
