import React, {useEffect} from 'react';
import {View, ActivityIndicator, StyleSheet} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthLoading = ({navigation}) => {
  useEffect(() => {
    const checkLogin = async () => {
      const userEmail = await AsyncStorage.getItem('userEmail');
      if (userEmail) {
        navigation.reset({
          index: 0,
          routes: [{name: 'MyBottomTab'}],
        });
      } else {
        navigation.reset({
          index: 0,
          routes: [{name: 'Login'}],
        });
      }
    };

    checkLogin();
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" />
    </View>
  );
};

export default AuthLoading;

const styles = StyleSheet.create({
  container: {flex: 1, justifyContent: 'center', alignItems: 'center'},
});
