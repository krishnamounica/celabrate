import React, { useState, useEffect, useRef } from 'react';
import { Linking } from 'react-native';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveUserData } from '../../redux/store';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import auth, { firebase } from '@react-native-firebase/auth';


const Login = ({ navigation, route }) => {
  const [fallbackRedirect, setFallbackRedirect] = React.useState(null);

  useEffect(() => {
    (async () => {
      try {
        const url = await Linking.getInitialURL().catch(() => null);
        if (url) {
          try {
            const u = new URL(url);
            const parts = u.pathname.split('/').filter(Boolean);
            const idx = parts.findIndex(p => p.toLowerCase().includes('giftdetails'));
            if (idx >= 0 && parts.length > idx + 1) {
              setFallbackRedirect({ name: 'GiftDetails', params: { id: parts[idx + 1] } });
            } else if (u.searchParams && u.searchParams.get('id')) {
              setFallbackRedirect({ name: 'GiftDetails', params: { id: u.searchParams.get('id') } });
            }
          } catch (e) { /* ignore */ }
        }
      } catch (e) {}
    })();
  }, []);

  const [redirected, setRedirected] = useState(false);
  const redirectInProgress = useRef(false);

  const performRedirect = (targetName, targetParams) => {
    try {
      if (redirectInProgress.current) {
        console.log('[Login] performRedirect called but redirect already in progress');
        return false;
      }
      redirectInProgress.current = true;
      console.log('[Login] performRedirect -> resetting navigation to', targetName, targetParams);
      // Use reset to ensure the target screen becomes the root and avoid race conditions
      navigation.reset({
        index: 0,
        routes: [{ name: targetName, params: targetParams || {} }],
      });
      return true;
    } catch (err) {
      console.error('[Login] performRedirect error', err);
      return false;
    }
  };

  console.log('[Login] mount. route.params =', route?.params);

  console.log('[Login] mounted with route.params:', route?.params);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(true);
  const [signingIn, setSigningIn] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    const checkUserData = async () => {
      console.log('[Login] checkUserData start. route.params =', route?.params);
      try {
        const storedUserData = await AsyncStorage.getItem('userData');
        if (storedUserData) {
          // If the Login screen was opened with a redirect target, honor it.
          const redirect = route?.params?.redirectTo || fallbackRedirect;
        console.log('[Login] checkUserData redirectTo =', redirect); console.log('[Login] computed redirectTo from route:', redirect);
          if (redirect && redirect.name) {
            // If redirect expects an id but it's missing, try to parse it from the initial URL
            if (!redirect.params || !redirect.params.id) {
              try {
                const url = await Linking.getInitialURL();
                if (url) {
                  try {
                    const u = new URL(url);
                    const parts = u.pathname.split('/').filter(Boolean);
                    const idx = parts.findIndex(p => p.toLowerCase().includes('giftdetails'));
                    if (idx >= 0 && parts.length > idx + 1) redirect.params = { ...(redirect.params||{}), id: parts[idx + 1] };
                    if ((!redirect.params || !redirect.params.id) && u.searchParams.has('id')) redirect.params = { ...(redirect.params||{}), id: u.searchParams.get('id') };
                  } catch (e) {
                    const m = url.match(/giftdetails\/?(\d+)/i);
                    if (m && m[1]) redirect.params = { ...(redirect.params||{}), id: m[1] };
                  }
                }
              } catch (_) {
                // ignore
              }
            }

            if (!redirect.params || !redirect.params.id) {
              try {
                const url = await Linking.getInitialURL().catch(() => null);
                console.warn('[Login] redirect missing id after parse attempt, url:', url);
                try {
                  fetch('https://wishandsurprise.com/backend/log_deeplink.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ url: url || null, screen: 'Login.redirect', reason: 'missing-id-after-parse', timestamp: Date.now() }),
                  }).catch(() => {});
                } catch (_) {}
              } catch (_) {}
            }
            if (!redirect.params || !redirect.params.id) {
              try {
                const raw = await Linking.getInitialURL().catch(() => null);
                console.warn('[Login] missing id after parse on login, url:', raw);
                try {
                  fetch('https://wishandsurprise.com/backend/log_deeplink.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ url: raw || null, screen: 'Login.afterLogin', reason: 'missing-id-after-login-parse', timestamp: Date.now() }),
                  }).catch(() => {});
                } catch (_) {}
              } catch (_) {}
            }
            console.log('[Login] navigating to redirect:', redirect); 
              console.log('[Login] checkUserData navigating to redirect route:', redirect.name, 'with params:', redirect.params);
            if (performRedirect(redirect.name, redirect.params || {})) return;
          } else {
            console.log('[Login] no redirect provided — going to MyBottomTab');
            console.log('[Login] checkUserData no redirectTo. Navigating to MyBottomTab as default.');
            if (performRedirect('MyBottomTab', {})) return;
          }
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

  // Show redirect message if present (e.g. "Please sign in to view this gift")
  useEffect(() => {
    try {
      const msg = route?.params?.message;
      if (msg) {
        Alert.alert('Sign in required', msg);
      }
    } catch (e) {
      // ignore
    }
  }, [route?.params?.message]);

  const handleChange = (key, value) => {
    setFormData({ ...formData, [key]: value });
  };

  const handleLogin = async () => {
    console.log('[Login] handleLogin called. route.params =', route?.params);
    setLoading(true);
    
    const url = `https://wishandsurprise.com/backend/login.php`;
    try {
      const response = await axios.post(url, formData, {
        headers: { 'Content-Type': 'application/json' },
      });
      console.log(`https://wishandsurprise.com/backend/login.php`,formData,"=====",response)

        if (response.status === 200 || response.status === 201) {
          console.log('[Login] login success response:', response?.data);
        Alert.alert('Success', 'Logged in successfully!');
        await AsyncStorage.setItem('userData', JSON.stringify(response.data));
        // dispatch(saveUserData(response.data));
          const redirect = route?.params?.redirectTo || fallbackRedirect;
        console.log('[Login] handleLogin redirectTo =', redirect); console.log('[Login] computed redirectTo from route:', redirect);
          if (redirect && redirect.name) {
            // If redirect has no id, try parsing it from incoming deep link
            if (!redirect.params || !redirect.params.id) {
              try {
                const url = await Linking.getInitialURL();
                if (url) {
                  try {
                    const u = new URL(url);
                    const parts = u.pathname.split('/').filter(Boolean);
                    const idx = parts.findIndex(p => p.toLowerCase().includes('giftdetails'));
                    if (idx >= 0 && parts.length > idx + 1) redirect.params = { ...(redirect.params||{}), id: parts[idx + 1] };
                    if ((!redirect.params || !redirect.params.id) && u.searchParams.has('id')) redirect.params = { ...(redirect.params||{}), id: u.searchParams.get('id') };
                  } catch (e) {
                    const m = url.match(/giftdetails\/?(\d+)/i);
                    if (m && m[1]) redirect.params = { ...(redirect.params||{}), id: m[1] };
                  }
                }
              } catch (_) {}
            }

            console.log('[Login] navigating to redirect:', redirect); 
              if (performRedirect(redirect.name, redirect.params || {})) return;
          } else {
            console.log('[Login] no redirect provided — going to MyBottomTab');
            if (performRedirect('MyBottomTab', {})) return;
          }
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
      const { email, name, photo, id } = result.data.user;

      let rr = {
  email,
  name,
  token: result.data.idToken
};
      const url = `https://wishandsurprise.com/backend/guser.php`;
      try {
        const response = await axios.post(url, rr, {
          headers: { 'Content-Type': 'application/json' },
        });

      // if (response.status === 200 || response.status === 201) {
          console.log('[Login] login success response:', response?.data);
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
        const redirect = route?.params?.redirectTo || fallbackRedirect; console.log('[Login] computed redirectTo from route:', redirect);
        if (redirect && redirect.name) {
          if (!redirect.params || !redirect.params.id) {
            try {
              const url = await Linking.getInitialURL();
              if (url) {
                try {
                  const u = new URL(url);
                  const parts = u.pathname.split('/').filter(Boolean);
                  const idx = parts.findIndex(p => p.toLowerCase().includes('giftdetails'));
                  if (idx >= 0 && parts.length > idx + 1) redirect.params = { ...(redirect.params||{}), id: parts[idx + 1] };
                  if ((!redirect.params || !redirect.params.id) && u.searchParams.has('id')) redirect.params = { ...(redirect.params||{}), id: u.searchParams.get('id') };
                } catch (e) {
                  const m = url.match(/giftdetails\/?(\d+)/i);
                  if (m && m[1]) redirect.params = { ...(redirect.params||{}), id: m[1] };
                }
              }
            } catch (_) {}
          }

          if (!redirect.params || !redirect.params.id) {
            const raw = await Linking.getInitialURL().catch(() => null);
            console.warn('[Login][Google] missing id after parse attempt, url:', raw);
            try {
              fetch('https://wishandsurprise.com/backend/log_deeplink.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: raw || null, screen: 'Login.google', reason: 'missing-id-after-google', timestamp: Date.now() }),
              }).catch(() => {});
            } catch (_) {}
          }

          console.log('[Login] navigating to redirect:', redirect); 
              if (performRedirect(redirect.name, redirect.params || {})) return;
        } else {
          console.log('[Login] no redirect provided — going to MyBottomTab');
            if (performRedirect('MyBottomTab', {})) return;
        }
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
      console.log('[Login] no redirect provided — going to MyBottomTab');
            if (performRedirect('MyBottomTab', {})) return;
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
