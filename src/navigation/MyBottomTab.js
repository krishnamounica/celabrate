import {Image, StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Cart, Categories, Home, Profile, Search} from '../screens';
import imagePath from '../constants/imagePath';
import {moderateScale} from '../styles/scaling';
import colors from '../styles/colors';

const Tab = createBottomTabNavigator();

const MyBottomTab = () => {
  return (
    <Tab.Navigator screenOptions={{headerShown: false}}>
      <Tab.Screen
        options={() => ({
          tabBarLabel: ({focused}) => {
            return (
              <View>
                <Text
                  style={{
                    color: focused ? colors.backgorundColor : colors.black,
                  }}>
                  Home
                </Text>
              </View>
            );
          },
          tabBarIcon: ({focused}) => {
            return (
              <Image
                tintColor={focused ? colors.backgorundColor : colors.black}
                style={{width: moderateScale(24), height: moderateScale(24)}}
                source={imagePath.home_agreement}
              />
            );
          },
        })}
        name="Home"
        component={Home}
      />
      <Tab.Screen
        options={() => ({
          tabBarLabel: ({focused}) => {
            return (
              <View>
                <Text
                  style={{
                    color: focused ? colors.backgorundColor : colors.black,
                  }}>
                  Search
                </Text>
              </View>
            );
          },
          tabBarIcon: ({focused}) => {
            return (
              <Image
                tintColor={focused ? colors.backgorundColor : colors.black}
                style={{width: moderateScale(24), height: moderateScale(24)}}
                source={imagePath.search}
              />
            );
          },
        })}
        name="Search"
        component={Search}
      />
      <Tab.Screen
        options={() => ({
          tabBarLabel: ({focused}) => {
            return (
              <View>
                <Text
                  numberOfLines={1}
                  style={{
                    color: focused ? colors.backgorundColor : colors.black,
                  }}>
                  Categories
                </Text>
              </View>
            );
          },
          tabBarIcon: ({focused}) => {
            return (
              <Image
                tintColor={focused ? colors.backgorundColor : colors.black}
                style={{width: moderateScale(24), height: moderateScale(24)}}
                source={imagePath.categories}
              />
            );
          },
        })}
        name="Categories"
        component={Categories}
      />
      <Tab.Screen
        options={() => ({
          tabBarLabel: ({focused}) => {
            return (
              <View>
                <Text
                  numberOfLines={1}
                  style={{
                    color: focused ? colors.backgorundColor : colors.black,
                  }}>
                  Cart
                </Text>
              </View>
            );
          },
          tabBarIcon: ({focused}) => {
            return (
              <Image
                tintColor={focused ? colors.backgorundColor : colors.black}
                style={{width: moderateScale(24), height: moderateScale(24)}}
                source={imagePath.onlineshopping}
              />
            );
          },
        })}
        name="Cart"
        component={Cart}
      />
      <Tab.Screen
        options={() => ({
          tabBarLabel: ({focused}) => {
            return (
              <View>
                <Text
                  numberOfLines={1}
                  style={{
                    color: focused ? colors.backgorundColor : colors.black,
                  }}>
                  Profile
                </Text>
              </View>
            );
          },
          tabBarIcon: ({focused}) => {
            return (
              <Image
                tintColor={focused ? colors.backgorundColor : colors.black}
                style={{width: moderateScale(24), height: moderateScale(24)}}
                source={imagePath.user}
              />
            );
          },
        })}
        name="Profile"
        component={Profile}
      />
    </Tab.Navigator>
  );
};

export default MyBottomTab;

const styles = StyleSheet.create({});
