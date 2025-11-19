import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  Alert,
  Linking,
} from 'react-native';
import Contacts from 'react-native-contacts';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { InstallReferrer } from 'react-native-play-install-referrer';
import withSplashScreen from '../navigation/withSplashScreen';

const InvitesScreen = () => {
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [sentInvites, setSentInvites] = useState([]);
  const [username, setUsername] = useState('');
  const API_URL = 'https://wishandsurprise.com/backend';
  const inputRef = useRef();

  useEffect(() => {
    getUsernameFromStorage();
    requestContactsPermission();
    fetchReferrer();

    // Optional: Auto-focus on search field
    setTimeout(() => {
      inputRef.current?.focus();
    }, 500);
  }, []);

  const getUsernameFromStorage = async () => {
    try {
      const storedUsername = await AsyncStorage.getItem('userData');
      const parsedData = JSON.parse(storedUsername);
      const userName = parsedData?.user || parsedData?.email;
      if (userName) {
        setUsername(userName);
        fetchSentInvites(userName);
      } else {
        Alert.alert('Error', 'Username not found. Please login again.');
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to load user data.');
    }
  };

  const fetchSentInvites = async (userName) => {
    try {
      const response = await fetch(`${API_URL}/get_invites.php?username=${userName}`);
      const data = await response.json();
      if (data.success) {
        setSentInvites(data.data || []);
      }
    } catch (error) {
      console.log('Fetch Invites Error:', error);
    }
  };

  const fetchReferrer = async () => {
    try {
      const response = await InstallReferrer.getReferrer();
      if (response?.installReferrer) {
        const urlParams = new URLSearchParams(response.installReferrer);
        const refCode = urlParams.get('ref');
        if (refCode) {
          await AsyncStorage.setItem('referral_code_from_referrer', refCode);
        }
      }
    } catch (err) {
      console.warn('InstallReferrer error:', err);
    }
  };

  const requestContactsPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_CONTACTS
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        loadContacts();
      }
    } else {
      loadContacts(); // iOS
    }
  };

  const loadContacts = () => {
    Contacts.getAll()
      .then(contacts => setContacts(contacts))
      .catch(err => console.log('Contacts error:', err));
  };

  const getContactName = (phoneNumber) => {
  const cleanedNumber = phoneNumber.replace(/\D/g, '');
  const matched = contacts.find(contact =>
    contact.phoneNumbers.some(p =>
      (p.number || '').replace(/\D/g, '').endsWith(cleanedNumber)
    )
  );
  return matched?.displayName || phoneNumber; // fallback to number if name not found
};

 const handleSearchChange = (text) => {
  setSearchText(text);

  const filtered = contacts.filter(contact => {
    const name = contact.displayName || ''; // Default to empty string
    const nameMatch = name.toLowerCase().includes(text.toLowerCase());

    const phoneMatch = contact.phoneNumbers.some(num =>
      (num.number || '').replace(/\s|\+91/g, '').includes(text.replace(/\s|\+91/g, ''))
    );

    return nameMatch || phoneMatch;
  });

  setFilteredContacts(filtered);
};
const pendingInvites = sentInvites.filter(invite => invite.status === 'Pending');
const joinedInvites = sentInvites.filter(invite => invite.status === 'Joined');


  const generateReferralCode = (length = 10) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleSendInvite = async () => {
    if (!searchText || !username) return;

    const cleaned = searchText.replace(/\D/g, '');
    const normalizedNumber = cleaned.length === 10 ? `91${cleaned}` : cleaned;
    const referralCode = generateReferralCode();

    try {
      const response = await fetch(`${API_URL}/create_invite.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: normalizedNumber, username, ref: referralCode }),
      });

      const rawText = await response.text();
      let result;

      try {
        result = JSON.parse(rawText);
      } catch {
        Alert.alert('Error', 'Server returned invalid JSON.');
        return;
      }

      if (result.success) {
        setSentInvites(prev => [
          ...prev,
          { id: Date.now().toString(), phone: normalizedNumber, status: 'Pending' },
        ]);

        const message = encodeURIComponent(
          `Hey! I'm inviting you to join our app *Wish and Surprise*. 🎁\nCheck this out: https://wishandsurprise.com/share-special-days?ref=${referralCode}`
        );

        const whatsappUrl = `whatsapp://send?phone=${normalizedNumber}&text=${message}`;
        const canOpen = await Linking.canOpenURL(whatsappUrl);

        if (canOpen) {
          await Linking.openURL(whatsappUrl);
        } else {
          Alert.alert('Error', 'WhatsApp is not installed.');
        }
      } else {
        Alert.alert('Error', result.message || 'Invite failed');
      }
    } catch (err) {
      console.log('Send Invite Error:', err);
      Alert.alert('Error', 'Something went wrong while sending the invite.');
    }

    setSearchText('');
    setFilteredContacts([]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎉 Invite Your Close Ones</Text>

      <Text style={styles.description}>
        Help us remember the special moments of your close friends and family.
        Send them a personal invite — they can easily share birthdays, anniversaries, and more!
      </Text>

      <View style={styles.inputRow}>
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder="Search name or phone number"
          keyboardType="default"
          value={searchText}
          onChangeText={handleSearchChange}
        />
        <TouchableOpacity onPress={handleSendInvite} style={styles.sendButton}>
          <Ionicons name="send" size={20} color="white" />
        </TouchableOpacity>
      </View>

      {filteredContacts.length > 0 && (
        <FlatList
          data={filteredContacts}
          keyExtractor={item => item.recordID}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() =>
                setSearchText(item.phoneNumbers[0]?.number.replace(/\s/g, '') || '')
              }
              style={styles.contactItem}
            >
              <Text>{item.displayName}</Text>
              <Text style={{ color: 'gray', fontSize: 12 }}>
                {item.phoneNumbers[0]?.number}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}

     <Text style={styles.subTitle}>Pending Invites</Text>
{pendingInvites.length === 0 ? (
  <Text style={styles.emptyText}>No pending invites</Text>
) : (
  <FlatList
    data={pendingInvites}
    keyExtractor={item => item.id.toString()}
    renderItem={({ item }) => (
      <View style={styles.inviteItem}>
        <Text>{getContactName(item.phone)}</Text>
        <Text style={{ color: 'gray' }}>{item.status}</Text>
      </View>
    )}
  />
)}

<Text style={styles.subTitle}>Joined Friends</Text>
{joinedInvites.length === 0 ? (
  <Text style={styles.emptyText}>No friends have joined yet</Text>
) : (
  <FlatList
    data={joinedInvites}
    keyExtractor={item => item.id.toString()}
    renderItem={({ item }) => (
      <View style={styles.inviteItem}>
       <Text>{getContactName(item.phone)}</Text>
       <Text style={{ color: 'green' }}>{item.status}</Text>
      </View>
    )}
  />
)}

    </View>
  );
};

export default withSplashScreen(InvitesScreen);

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  description: {
    fontSize: 14,
    color: '#555',
    marginBottom: 16,
    lineHeight: 20,
  },
  inputRow: { flexDirection: 'row', alignItems: 'center' },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 8,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 8,
  },
  subTitle: { marginTop: 24, fontSize: 18, fontWeight: '600' },
  inviteItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  contactItem: {
    paddingVertical: 8,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  emptyText: {
  fontStyle: 'italic',
  color: '#999',
  marginBottom: 12,
},

});
