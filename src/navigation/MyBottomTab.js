import { Text, View } from 'react-native';
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Cart, Categories, Home, Profile, Search } from '../screens';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { moderateScale } from '../styles/scaling';
import colors from '../styles/colors';
import CategoryList from '../screens/Categories/Categories';
import RequestsScreen from '../screens/Search/RequestsScreen';
import GiftOrderCard from '../screens/GiftOrderCard';
import GiftDetailsScreen from '../screens/GiftDetailsScreen';
import InvitesScreen from '../screens/InvitesScreen';
import GroupsScreen from '../screens/GroupsScreen';
import withSplashScreen from './withSplashScreen';


const Tab = createBottomTabNavigator();

const MyBottomTab = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#E3F2FD', // 💙 Pleasant Background Color
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          position: 'absolute',
          elevation: 5,
          height: moderateScale(60),
        },
        tabBarLabel: ({ focused }) => (
          <Text style={{ color: focused ? colors.backgorundColor : colors.black }}>
            {route.name}
          </Text>
        ),
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Request':
              iconName = focused ? 'search' : 'search-outline';
              break;
            case 'Categories':
              iconName = focused ? 'grid' : 'grid-outline';
              break;
              case 'Invites':
          iconName = focused ? 'mail' : 'mail-outline';
          break;
        case 'Groups':
          iconName = focused ? 'people' : 'people-outline';
          break;
            case 'Cart':
              iconName = focused ? 'cart' : 'cart-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
          }

          return <Ionicons name={iconName} size={moderateScale(24)} color={color} />;
        },
        tabBarActiveTintColor: colors.backgorundColor,
        tabBarInactiveTintColor: colors.black,
      })}
    >
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Request" component={GiftOrderCard} />
      <Tab.Screen name="Categories" component={CategoryList} />
      <Tab.Screen name="Invites" component={InvitesScreen} />
  {/* <Tab.Screen name="Groups" component={GroupsScreen} /> */}
      {/* <Tab.Screen name="Cart" component={Cart} /> */}
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
};

export default withSplashScreen(MyBottomTab);
