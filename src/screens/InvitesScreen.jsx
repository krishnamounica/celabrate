import React, { useEffect, useState } from 'react';
import {
  Alert,
  Share,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styled from 'styled-components/native';
import withSplashScreen from '../navigation/withSplashScreen';

/* ===================== STYLED COMPONENTS ===================== */

const Container = styled.ScrollView`
  flex: 1;
  padding: 16px;
  background-color: #fff;
`;

const Title = styled.Text`
  font-size: 22px;
  font-weight: bold;
  margin-bottom: 12px;
`;

const Description = styled.Text`
  font-size: 14px;
  color: #555;
  margin-bottom: 20px;
  line-height: 20px;
`;

const Section = styled.View`
  margin-bottom: 24px;
`;

const Card = styled.View`
  border-radius: 14px;
  border: 1px solid #eee;
  padding: 16px;
  margin-bottom: 14px;
`;

const CardTitle = styled.Text`
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 6px;
`;

const CardDesc = styled.Text`
  font-size: 13px;
  color: #666;
  margin-bottom: 12px;
`;

const SendButton = styled.TouchableOpacity`
  background-color: #2196f3;
  padding: 12px;
  border-radius: 10px;
  align-items: center;
  flex-direction: row;
  justify-content: center;
  gap: 6px;
`;

const SendText = styled.Text`
  color: #fff;
  font-weight: 600;
`;

const Divider = styled.View`
  height: 1px;
  background-color: #eee;
  margin: 24px 0;
`;

/* ===================== COMPONENT ===================== */

const InvitesScreen = () => {
  const [username, setUsername] = useState('');
  const API_URL = 'https://wishandsurprise.com/backend';

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const stored = await AsyncStorage.getItem('userData');
      const parsed = JSON.parse(stored);
      setUsername(parsed?.user || parsed?.email || '');
    } catch {
      Alert.alert('Error', 'Please login again');
    }
  };

  const generateReferralCode = (len = 10) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return Array.from({ length: len }, () =>
      chars[Math.floor(Math.random() * chars.length)]
    ).join('');
  };
const handleShare = async (type) => {
  if (!username) {
    Alert.alert('Error', 'User not found');
    return;
  }

  const ref = generateReferralCode();

  // 1️⃣ Save invite intent
  await fetch(`${API_URL}/create_invite.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phone: null,
      username,
      ref,
      invite_type: type,
    }),
  });

  // 2️⃣ Message based on invite type
  const message =
    type === 'DATES'
      ? `Hey ❤️

Can you please share your birthday or anniversary here?
I want to remember your special days 😊

👉 https://wishandsurprise.com/savespecialdays?ref=${ref}`
      : `Hey 👋

Join me on *Wish & Surprise* 🎁
Personalized gifts for every special moment.

👉 https://play.google.com/store/apps/details?id=com.Wishandsurprise`;

  // 3️⃣ Share via system share (WhatsApp / Messages / Insta etc.)
  try {
    await Share.share({ message });
  } catch {
    Alert.alert('Error', 'Sharing failed');
  }
};


  return (
    <Container>
      <Title>🎉 Invite Friends & Family</Title>

      <Description>
        Remember birthdays, anniversaries and surprise your loved ones
        with the perfect gift — right on time 🎁
      </Description>

      {/* ================= SAVE DATES ================= */}
      <Section>
        <Card>
          <CardTitle>📅 Save Special Days</CardTitle>
          <CardDesc>
            Ask your friends or family to share their birthdays or anniversaries.
            We’ll remind you before the date and suggest perfect gifts.
          </CardDesc>

          <SendButton onPress={() => handleShare('DATES')}>
            <Ionicons name="calendar-outline" size={18} color="#fff" />
            <SendText>Send Date Form</SendText>
          </SendButton>
        </Card>
      </Section>

      <Divider />

      {/* ================= APP INVITE ================= */}
      <Section>
        <Card>
          <CardTitle>📲 Invite to Install App</CardTitle>
          <CardDesc>
            Invite friends to install the Wish & Surprise app
            and explore personalized gifting experiences.
          </CardDesc>

          <SendButton onPress={() => handleShare('APP')}>
            <Ionicons name="download-outline" size={18} color="#fff" />
            <SendText>Send App Invite</SendText>
          </SendButton>
        </Card>
      </Section>
    </Container>
  );
};

export default withSplashScreen(InvitesScreen);
