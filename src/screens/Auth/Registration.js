import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveUserData } from '../../redux/store';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';

const Registration = ({ navigation }) => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [signingUp, setSigningUp] = useState(false);
  const dispatch = useDispatch();

  const handleChange = (key, value) => {
    setFormData({ ...formData, [key]: value });
  };

  const handleRegister = async () => {
    setLoading(true);
    const url = `https://easyshop-7095.onrender.com/api/v1/users/register`;
    try {
      const response = await axios.post(url, formData, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.status === 200 || response.status === 201) {
        Alert.alert('Success', 'Registered successfully!');
        await AsyncStorage.setItem('userData', JSON.stringify(response.data));
        dispatch(saveUserData(response.data));
        navigation.replace('MyBottomTab');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', error.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    if (signingUp) return;

    try {
      setSigningUp(true);

      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

      const result = await GoogleSignin.signIn();
      console.log('Google Sign-In result:', result);

      const idToken = result?.idToken || result?.data?.idToken;

      if (!idToken) {
        throw new Error('Google Sign-In failed: idToken is missing');
      }

      const googleCredential = auth.GoogleAuthProvider.credential(idToken);

      const userCredential = await auth().signInWithCredential(googleCredential);

      const userData = {
        email: userCredential.user.email,
        name: userCredential.user.displayName,
        photo: userCredential.user.photoURL,
        uid: userCredential.user.uid,
        provider: 'google',
      };

      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      dispatch(saveUserData(userData));

      navigation.replace('MyBottomTab');
    } catch (error) {
      console.error('Google Sign-Up Error:', error);
      Alert.alert('Error', error?.message || 'Google Sign-Up Failed');
    } finally {
      setSigningUp(false);
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
        <Text style={styles.title}>Register</Text>

        <TextInput
          style={styles.input}
          placeholder="Name"
           placeholderTextColor="gray"
          value={formData.name}
          onChangeText={(text) => handleChange('name', text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
           placeholderTextColor="gray"
          value={formData.email}
          onChangeText={(text) => handleChange('email', text)}cv
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

        <Button title="Register with Email" onPress={handleRegister} />

        <View style={{ marginVertical: 10 }}>
          <Button
            title={signingUp ? 'Signing up...' : 'Sign up with Google'}
            onPress={handleGoogleSignUp}
            disabled={signingUp}
          />
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.registerText}>Already have an account? Login</Text>
        </TouchableOpacity>
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
    backgroundColor: '#f5f5f5',
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
    color:'black',
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

export default Registration;
