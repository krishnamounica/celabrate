// src/navigation/MyBottomTab.js
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Easing,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { useSelector } from 'react-redux';

import { moderateScale } from '../styles/scaling';
import colors from '../styles/colors';
import { Home, Cart } from '../screens';
import GiftOrderCard from '../screens/GiftOrderCard';
import CategoryList from '../screens/Categories/Categories';
import InvitesScreen from '../screens/InvitesScreen';
import withSplashScreen from './withSplashScreen';

const Tab = createBottomTabNavigator();
const ICON_SIZE = moderateScale(22);
const TAB_BAR_HEIGHT = moderateScale(78);
const { width: SCREEN_WIDTH } = Dimensions.get('window');

/* ---------- Icon Mapping ---------- */
function iconNameFor(route, focused) {
  switch (route) {
    case 'Home':
      return focused ? 'home' : 'home-outline';
    case 'Request':
      return focused ? 'gift' : 'gift-outline';
    case 'Categories':
      return focused ? 'grid' : 'grid-outline';
    case 'Invites':
      return focused ? 'mail' : 'mail-outline';
    case 'Cart':
      return focused ? 'cart' : 'cart-outline';
    default:
      return 'ellipse-outline';
  }
}

/* ---------- Custom Tab Bar ---------- */
const CustomTabBar = ({ state, navigation }) => {
  /* 🔥 CART COUNT FROM REDUX */
  const cartItems = useSelector(state => state.cart.items || []);

  const cartCount = cartItems.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0
  );

  const indicator = useRef(new Animated.Value(state.index)).current;
  const badgeScale = useRef(new Animated.Value(1)).current;

  /* 🔔 Badge bounce animation */
  useEffect(() => {
    if (cartCount <= 0) return;

    badgeScale.setValue(0.7);
    Animated.sequence([
      Animated.spring(badgeScale, {
        toValue: 1.2,
        friction: 3,
        useNativeDriver: true,
      }),
      Animated.spring(badgeScale, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
  }, [cartCount]);

  /* 🔄 Indicator animation */
  useEffect(() => {
    Animated.timing(indicator, {
      toValue: state.index,
      duration: 250,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [state.index]);

  const tabWidth = SCREEN_WIDTH / state.routes.length;

  return (
    <SafeAreaView edges={['bottom']} style={styles.safeArea}>
      <View style={styles.pillBackground}>
        <View style={styles.row}>
          {state.routes.map((route, index) => {
            const focused = state.index === index;
            const showBadge = route.name === 'Cart' && cartCount > 0;

            return (
              <TouchableOpacity
                key={route.key}
                onPress={() => navigation.navigate(route.name)}
                style={[styles.tabItem, { width: tabWidth }]}
                activeOpacity={0.85}
              >
                <View style={styles.iconContainer}>
                  <LinearGradient
                    colors={
                      focused
                        ? ['#FFB88C', '#FF6A00']
                        : ['transparent', 'transparent']
                    }
                    style={styles.iconWrap}
                  >
                    <Ionicons
                      name={iconNameFor(route.name, focused)}
                      size={ICON_SIZE}
                      color={focused ? '#fff' : colors.grayDark}
                    />
                  </LinearGradient>

                  {showBadge && (
                    <Animated.View
                      style={[
                        styles.badge,
                        { transform: [{ scale: badgeScale }] },
                      ]}
                    >
                      <Text style={styles.badgeText}>
                        {cartCount > 99 ? '99+' : cartCount}
                      </Text>
                    </Animated.View>
                  )}
                </View>

                <Text style={[styles.label, focused && styles.labelActive]}>
                  {route.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Animated.View
          style={[
            styles.indicator,
            {
              width: tabWidth * 0.4,
              transform: [
                {
                  translateX: indicator.interpolate({
                    inputRange: [0, state.routes.length - 1],
                    outputRange: [
                      tabWidth * 0.3,
                      tabWidth * (state.routes.length - 1) +
                        tabWidth * 0.3,
                    ],
                  }),
                },
              ],
            },
          ]}
        />
      </View>
    </SafeAreaView>
  );
};

/* ---------- Navigator ---------- */
const MyBottomTab = () => (
  <Tab.Navigator
    screenOptions={{ headerShown: false }}
    tabBar={props => <CustomTabBar {...props} />}
  >
    <Tab.Screen name="Home" component={Home} />
    <Tab.Screen name="Request" component={GiftOrderCard} />
    <Tab.Screen name="Categories" component={CategoryList} />
    <Tab.Screen name="Invites" component={InvitesScreen} />
    <Tab.Screen name="Cart" component={Cart} />
  </Tab.Navigator>
);

export default withSplashScreen(MyBottomTab);

/* ---------- Styles ---------- */
const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: 'transparent',
  },

  pillBackground: {
    height: TAB_BAR_HEIGHT,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    elevation: 12,
    justifyContent: 'center',
  },

  row: {
    flexDirection: 'row',
  },

  tabItem: {
    height: TAB_BAR_HEIGHT,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 2,
  },

  iconContainer: {
    position: 'relative',
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },

  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },

  label: {
    fontSize: 11,
    marginTop: 4,
    color: colors.grayDark,
    fontWeight: '600',
  },

  labelActive: {
    color: '#FF6A00',
  },

  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    backgroundColor: '#FF3B30',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    elevation: 20,
  },

  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
  },

  indicator: {
    position: 'absolute',
    bottom: 10,
    height: 4,
    borderRadius: 4,
    backgroundColor: '#FF6A00',
  },
});
