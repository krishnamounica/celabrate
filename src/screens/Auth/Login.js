import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveUserData } from '../../redux/store';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import auth, { firebase } from '@react-native-firebase/auth';


const Login = ({ navigation }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(true);
  const [signingIn, setSigningIn] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    const checkUserData = async () => {
      try {
        const storedUserData = await AsyncStorage.getItem('userData');
        if (storedUserData) {
          // dispatch(saveUserData(JSON.parse(storedUserData)));
          navigation.replace('MyBottomTab');
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Error reading AsyncStorage:', error);
        setLoading(false);
      }
    };

    checkUserData();
    // Google Sign-In configuration
    GoogleSignin.configure({
      webClientId: '1062172501798-ho34oecubhlu6sp9l8mjsehd0rbnqllt.apps.googleusercontent.com',
      offlineAccess: true,
      forceCodeForRefreshToken: true,
    });
  }, []);

  const handleChange = (key, value) => {
    setFormData({ ...formData, [key]: value });
  };

  const handleLogin = async () => {
    setLoading(true);
    const url = `https://easyshop-7095.onrender.com/api/v1/users/login`;
    try {
      const response = await axios.post(url, formData, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.status === 200 || response.status === 201) {
        Alert.alert('Success', 'Logged in successfully!');
        await AsyncStorage.setItem('userData', JSON.stringify(response.data));
        // dispatch(saveUserData(response.data));
        navigation.replace('MyBottomTab');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', error.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };
  const handleGoogleSignIn = async () => {
    if (signingIn) return;
    try {
      setSigningIn(true);
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const result = await GoogleSignin.signIn();
      console.log('Google Sign-In result:', result);
      const { email, name, photo, id } = result.data.user;

      let rr = {
  email,
  name,
  token: result.data.idToken
};
      const url = `https://easyshop-7095.onrender.com/api/v1/users/guser`;
      try {
        const response = await axios.post(url, rr, {
          headers: { 'Content-Type': 'application/json' },
        });
      console.log("==============",response.data,"==========")
      // if (response.status === 200 || response.status === 201) {
        const { email, token, id, requests, userName } = response.data;
        const userData = {
          // email: result.data.user.email,
          name: result.data.user.name,
          photo: result.data.user.photo,
          uid: result.data.user.uid,
          provider: 'google',
          email,
          token:response.data.token,
          id,
          requests,
          userName        };
        await AsyncStorage.setItem('userData', JSON.stringify(userData));
        const userDataString = await AsyncStorage.getItem('userData');
        const userDatas = JSON.parse(userDataString);
        // dispatch(saveUserData(userData));
        navigation.replace('MyBottomTab');
      // }
      } catch (error) {
        console.error(error);
        Alert.alert('Error', error.response?.data?.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
      const idToken = result?.idToken || result?.data?.idToken;

      if (!idToken) {
        throw new Error('Google Sign-In failed: idToken is missing');
      }
      const googleCredential = firebase.auth.GoogleAuthProvider.credential(idToken);
      const userCredential = await auth().signInWithCredential(googleCredential);
      const userData = {
        email: userCredential.user.email,
        name: userCredential.user.displayName,
        photo: userCredential.user.photoURL,
        uid: userCredential.user.uid,
        provider: 'google',
      };
      // await AsyncStorage.setItem('userData', JSON.stringify(userData));
      // dispatch(saveUserData(userData));
      navigation.replace('MyBottomTab');
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      Alert.alert('Error', error?.message || 'Google Sign-In Failed');
    } finally {
      setSigningIn(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#6200ea" />
      </View>
    );
  }
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.formWrapper}>
        <Text style={styles.title}>Login</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
           placeholderTextColor="gray"
          value={formData.email}
          onChangeText={(text) => handleChange('email', text)}
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
           placeholderTextColor="gray"
          value={formData.password}
          onChangeText={(text) => handleChange('password', text)}
          secureTextEntry
        />
        <Button title="Login with Email" onPress={handleLogin} />
        <View style={{ marginVertical: 10 }}>
          <Button
            title={signingIn ? 'Signing in...' : 'Sign in with Google'}
            onPress={handleGoogleSignIn}
            disabled={signingIn}
          />
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Registration')}>
          <Text style={styles.registerText}>Don't have an account? Register</Text>
        </TouchableOpacity>
        {/* <TouchableOpacity onPress={() => navigation.navigate('ProductForm')}>
          <Text style={styles.registerText}>Add product</Text>
        </TouchableOpacity> */}
      </View>
    </ScrollView>
  );
};
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5'
  },
  
  formWrapper: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },

  registerText: {
    marginTop: 15,
    textAlign: 'center',
    color: '#007bff',
    textDecorationLine: 'underline',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Login;
