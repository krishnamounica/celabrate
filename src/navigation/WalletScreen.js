import React, { useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styled from 'styled-components/native';
import withSplashScreen from '../navigation/withSplashScreen';

const Container = styled.ScrollView`
  flex: 1;
  padding: 16px;
  background-color: #fff;
`;

const BalanceCard = styled.View`
  background-color: #e3f2fd;
  padding: 20px;
  border-radius: 16px;
  margin-bottom: 20px;
`;

const BalanceText = styled.Text`
  font-size: 14px;
  color: #555;
`;

const BalanceAmount = styled.Text`
  font-size: 32px;
  font-weight: bold;
  color: #2196f3;
  margin-top: 6px;
`;

const RewardCard = styled.View`
  padding: 14px;
  border-radius: 12px;
  border: 1px solid #eee;
  margin-bottom: 12px;
`;

const RewardTitle = styled.Text`
  font-size: 15px;
  font-weight: 600;
`;

const RewardMeta = styled.Text`
  font-size: 12px;
  color: #666;
  margin-top: 4px;
`;

const EmptyText = styled.Text`
  text-align: center;
  color: #999;
  margin-top: 40px;
`;

const WalletScreen = () => {
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [rewards, setRewards] = useState([]);

  const API_URL = 'https://wishandsurprise.com/backend';

  useEffect(() => {
    loadWallet();
  }, []);

  const loadWallet = async () => {
    try {
      const stored = await AsyncStorage.getItem('userData');
      const parsed = JSON.parse(stored);
      const username = parsed?.user || parsed?.email;

      const res = await fetch(
        `${API_URL}/get_wallet.php?username=${username}`
      );
      const data = await res.json();

      if (data.success) {
        setBalance(data.total_balance);
        setRewards(data.rewards);
      }
    } catch (e) {
      console.log(e);
    }
    setLoading(false);
  };

  if (loading) {
    return <ActivityIndicator style={{ marginTop: 50 }} />;
  }

  return (
    <Container>
      <BalanceCard>
        <BalanceText>Your Reward Balance</BalanceText>
        <BalanceAmount>₹{balance}</BalanceAmount>
      </BalanceCard>

      {rewards.length === 0 ? (
        <EmptyText>No rewards earned yet</EmptyText>
      ) : (
        rewards.map((r, idx) => (
          <RewardCard key={idx}>
            <RewardTitle>
              {r.invite_type === 'DATES'
                ? '📅 Saved Special Day'
                : '📲 App Referral'}
              {' '}— ₹{r.reward_amount}
            </RewardTitle>

            <RewardMeta>
              Earned on {new Date(r.rewarded_at).toDateString()}
            </RewardMeta>
          </RewardCard>
        ))
      )}
    </Container>
  );
};

export default withSplashScreen(WalletScreen);
