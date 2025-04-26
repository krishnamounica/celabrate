import React, { useEffect, useState } from 'react';
import { View, Text, Button, ActivityIndicator, StyleSheet } from 'react-native';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth'; // <-- You missed this
import { useNavigation } from '@react-navigation/native';

const Gsignin = () => {
  const [signingIn, setSigningIn] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const navigation = useNavigation();


  useEffect(() => {
    GoogleSignin.configure({
      webClientId: '1062172501798-ho34oecubhlu6sp9l8mjsehd0rbnqllt.apps.googleusercontent.com',
      offlineAccess: true,
      forceCodeForRefreshToken: true,
    });
  }, []);

  const handleGoogleSignIn = async () => {
    if (signingIn) return;
  
    try {
      setSigningIn(true);
  
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  
      const result = await GoogleSignin.signIn();
      console.log('Google Sign-In result:', result);
  
      const idToken = result?.idToken || result?.data?.idToken;
  
      if (!idToken) {
        throw new Error('Google Sign-In failed: idToken is missing');
      }
  
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
  
      const userCredential = await auth().signInWithCredential(googleCredential);
  
      setUserInfo(userCredential.user);
      console.log('User Info:', userCredential.user);
  
      // navigation.reset({
      //   index: 0,
      //   routes: [{ name: 'Categories' }],
      // });
  
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      console.error('Full error:', JSON.stringify(error, null, 2));
  
      const errorCode = (error && typeof error === 'object') ? error.code : undefined;
      console.log('Error code:', errorCode);
  
      if (errorCode === statusCodes?.SIGN_IN_CANCELLED) {
        console.warn('User cancelled the login flow');
      } else if (errorCode === statusCodes?.IN_PROGRESS) {
        console.warn('Sign-in already in progress');
      } else if (errorCode === statusCodes?.PLAY_SERVICES_NOT_AVAILABLE) {
        console.warn('Play services not available or outdated');
      } else {
        console.warn('Some other error happened:', error?.message || JSON.stringify(error) || error);
      }
  
    } finally {
      setSigningIn(false);
    }
  };
  
   
  

  const handleSignOut = async () => {
    try {
      await GoogleSignin.signOut();
      await auth().signOut(); // <-- Sign out from Firebase too
      setUserInfo(null);
    } catch (error) {
      console.error('Sign out error', error);
    }
  };

  return (
    <View style={styles.container}>
      {userInfo ? (
        <View>
          <Text style={styles.welcome}>Welcome, {userInfo.displayName}!</Text>
          <Text>Email: {userInfo.email}</Text>
          <Button title="Sign Out" onPress={handleSignOut} />
        </View>
      ) : (
        <View>
          <Button
            title={signingIn ? 'Signing in...' : 'Sign in with Google'}
            onPress={handleGoogleSignIn}
            disabled={signingIn}
          />
          {signingIn && <ActivityIndicator style={styles.loader} />}
        </View>
      )}
    </View>
  );
};

export default Gsignin;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  welcome: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  loader: {
    marginTop: 10,
  },
});
