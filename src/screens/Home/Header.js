// src/screens/Header.js
import React, { useEffect, useState } from 'react';
import styled from 'styled-components/native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';
import { theme } from '../../../theme';

const Wrapper = styled.View`
  background-color: #fff;
  padding-vertical: 14px;
  padding-horizontal: 16px;

  border-radius: ${theme.radius.card}px;
  margin-top: 8px;
  margin-bottom: 4px;

  /* full width alignment */
  width: 100%;

  border-width: 1px;
  border-color: #f1f1f1;
`;


const Row = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const BrandBox = styled.View`
  align-items: center;
`;

const BrandTitle = styled.Text`
  font-size: 20px;
  font-weight: 800;
  color: ${theme.colors.brand};
  letter-spacing: 0.6px;
`;

const BrandSubtitle = styled.Text`
  font-size: 11px;
  color: #8a8a8a;
  margin-top: -2px;
`;
const IconRing = styled.View`
  width: 34px;
  height: 34px;
  border-radius: 17px;
  border-width: 1.5px;
  border-color: ${theme.colors.brand};
  align-items: center;
  justify-content: center;
  background-color: #fff;
`;

const IconButton = styled.TouchableOpacity`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  align-items: center;
  justify-content: center;
  background-color: #fafafa;
`;

const AvatarCircle = styled.View`
  width: 34px;
  height: 34px;
  border-radius: 17px;
  overflow: hidden;
  border-width: 1.5px;
  border-color: ${theme.colors.brand};
  align-items: center;
  justify-content: center;
`;
const RingBase = styled.View`
  width: 34px;
  height: 34px;
  border-radius: 17px;
  border-width: 1.5px;
  border-color: ${theme.colors.brand};
  align-items: center;
  justify-content: center;
  background-color: #fff;
`;

const AvatarRing = styled(RingBase)`
  overflow: hidden;
`;

const AvatarImage = styled.Image`
  width: 100%;
  height: 100%;
`;

export default function Header() {
  const navigation = useNavigation();
  const [userPhoto, setUserPhoto] = useState(null);

  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem('userData');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.photo) setUserPhoto(parsed.photo);
      }
    })();
  }, []);

  return (
    <Wrapper>
      <Row>
    <IconButton onPress={() => navigation.navigate('Profile')}>
  <AvatarRing>
    {userPhoto ? (
      <AvatarImage source={{ uri: userPhoto }} />
    ) : (
      <Icon name="user" size={14} color={theme.colors.brand} />
    )}
  </AvatarRing>
</IconButton>



        <BrandBox>
          <BrandTitle>Wish &amp; Surprise</BrandTitle>
          <BrandSubtitle>Gifts made special</BrandSubtitle>
        </BrandBox>
<IconButton onPress={() => navigation.navigate('Notifications')}>
  <RingBase style={{ backgroundColor: theme.colors.brand }}>
    <Icon name="bell-o" size={16} color="#fff" />
  </RingBase>
</IconButton>



      </Row>
    </Wrapper>
  );
}
