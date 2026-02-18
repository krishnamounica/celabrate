import React, { useEffect, useState } from 'react';
import { FlatList, ActivityIndicator } from 'react-native';
import styled from 'styled-components/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import withSplashScreen from '../navigation/withSplashScreen';

/* ---------- STYLED ---------- */

const Container = styled.View`
  flex: 1;
  padding: 16px;
  background-color: #fff;
`;

const Title = styled.Text`
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 16px;
`;

const Card = styled.View`
  padding: 14px;
  border-radius: 12px;
  border: 1px solid #eee;
  margin-bottom: 12px;
  background-color: #fafafa;
`;

const Name = styled.Text`
  font-size: 16px;
  font-weight: 600;
`;

const DateText = styled.Text`
  margin-top: 6px;
  color: #555;
`;

const EmptyText = styled.Text`
  margin-top: 40px;
  text-align: center;
  color: #999;
`;

/* ---------- COMPONENT ---------- */

const SavedSpecialDaysScreen = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_URL = 'https://wishandsurprise.com/backend';

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const stored = await AsyncStorage.getItem('userData');
    const parsed = JSON.parse(stored);
    const username = parsed?.user || parsed?.email;

    if (!username) return;

    const res = await fetch(
      `${API_URL}/get_special_days.php?username=${username}`
    );
    const json = await res.json();

    if (json.success) setData(json.data || []);
    setLoading(false);
  };

  const renderItem = ({ item }) => {
    const type = item.birthday ? '🎂 Birthday' : '💍 Anniversary';
    const date = item.birthday || item.anniversary;

    return (
      <Card>
        <Name>{item.name}</Name>
        <DateText>{type} • {date}</DateText>
      </Card>
    );
  };

  if (loading) {
    return <ActivityIndicator style={{ marginTop: 50 }} />;
  }

  return (
    <Container>
      <Title>📅 Saved Special Days</Title>

      {data.length === 0 ? (
        <EmptyText>No special days saved yet</EmptyText>
      ) : (
        <FlatList
          data={data}
          keyExtractor={i => i.id.toString()}
          renderItem={renderItem}
        />
      )}
    </Container>
  );
};

export default withSplashScreen(SavedSpecialDaysScreen);
