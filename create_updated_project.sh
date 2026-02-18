#!/bin/bash
set -e

echo "Creating updated project files..."
ROOT="$(pwd)/updated_celabrate_local"
rm -rf "$ROOT"
mkdir -p "$ROOT/src/screens" "$ROOT/src/components" "$ROOT/src/utils"

cat > "$ROOT/src/theme.js" <<'EOF'
export const theme = {
  colors: {
    brand: '#ff7a00',
    bg: '#f6f7f8',
    card: '#ffffff',
    muted: '#8b98a6',
    accent: '#166534',
    text: '#111827',
  },
  spacing: {
    page: 16,
    section: 12,
    card: 14,
  },
  radius: {
    card: 12,
    pill: 24,
  },
  sizes: {
    heroHeight: 140,
    avatarSmall: 72,
    avatarMedium: 88,
    navOverlap: 72,
  },
  fonts: {
    h1: 20,
    h2: 16,
    body: 14,
    label: 13,
  },
};
EOF

cat > "$ROOT/src/components/Card.js" <<'EOF'

EOF

cat > "$ROOT/src/utils/normalizeUri.js" <<'EOF'
export default function normalizeUri(u) {
  if (!u) return '';
  let out = String(u).trim();
  out = out.replace('wishandsurprise.combackend', 'wishandsurprise.com/backend');
  if (!/^https?:\/\//i.test(out)) {
    out = 'https://' + out.replace(/^\/+/, '');
  }
  return out;
}
EOF

cat > "$ROOT/src/screens/Header.js" <<'EOF'
import React, { useState } from 'react';
import styled from 'styled-components/native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faSearch, faBell } from '@fortawesome/free-solid-svg-icons';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../theme';

const Wrapper = styled.View`
  background-color: rgba(255,122,0,0.08);
  padding: 12px;
  border-radius: ${theme.radius.card}px;
  margin-bottom: 8px;
`;

const TopBar = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const SearchContainer = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  background-color: #fff;
  border-radius: 24px;
  padding: 8px 12px;
  flex: 1;
  margin-right: 10px;
`;

const SearchInput = styled.TextInput`
  flex: 1;
  font-size: 16px;
  color: #333;
  padding-vertical: 6px;
`;

const NotificationButton = styled.TouchableOpacity`
  padding: 8px;
`;

export default function Header() {
  const [searchText, setSearchText] = useState('');
  const navigation = useNavigation();

  return (
    <Wrapper>
      <TopBar>
        <SearchContainer onPress={() => navigation.navigate('Search')} activeOpacity={0.9}>
          <SearchInput
            placeholder="Search gifts..."
            placeholderTextColor="#6e7a8a"
            value={searchText}
            onChangeText={setSearchText}
            editable={true}
          />
          <FontAwesomeIcon icon={faSearch} size={16} color="#6e7a8a" />
        </SearchContainer>

        <NotificationButton onPress={() => navigation.navigate('Notifications')}>
          <FontAwesomeIcon icon={faBell} size={20} color="#6e7a8a" />
        </NotificationButton>
      </TopBar>
    </Wrapper>
  );
}
EOF

cat > "$ROOT/src/screens/Banner.js" <<'EOF'
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions } from 'react-native';
import styled from 'styled-components/native';
import LinearGradient from 'react-native-linear-gradient';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { theme } from '../../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HEIGHT = theme.sizes.heroHeight;

const Gradient = styled(LinearGradient)`
  width: ${Math.round(SCREEN_WIDTH * 0.96)}px;
  height: ${HEIGHT}px;
  border-radius: ${theme.radius.card}px;
  align-self: center;
  margin-vertical: 10px;
  overflow: hidden;
  elevation: 6;
`;

const Content = styled(Animated.View)`
  flex: 1;
  align-items: center;
  justify-content: center;
  padding-horizontal: 18px;
`;

const Title = styled.Text`
  color: #ffffff;
  font-size: 18px;
  font-weight: 700;
  text-align: center;
  margin-top: 8px;
`;

const Subtitle = styled.Text`
  color: #fff6b8;
  font-size: 16px;
  font-weight: 800;
  text-align: center;
  margin-top: 6px;
`;

const slides = [
  { id: '1', icon: 'gift', title: 'Every Gift Tells a Story', subtitle: 'Wrap it with Love 🎁', colors: ['#B2EBF2', '#80DEEA'] },
  { id: '2', icon: 'heart', title: 'Love Beyond Words', subtitle: 'Express it Beautifully 💖', colors: ['#FFCCBC', '#FFAB91'] },
  { id: '3', icon: 'shopping-bag', title: 'Find the Perfect Gift', subtitle: 'Cherish Every Moment 🎊', colors: ['#D1C4E9', '#B39DDB'] },
];

export default function Banner({ autoPlay = true, interval = 5000 }) {
  const [index, setIndex] = useState(0);
  const fade = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.98)).current;

  useEffect(() => {
    animateIn();
    let id;
    if (autoPlay) {
      id = setInterval(() => setIndex(i => (i + 1) % slides.length), interval);
    }
    return () => { clearInterval(id); };
  }, [index]);

  const animateIn = () => {
    fade.setValue(0);
    scale.setValue(0.98);
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 8, useNativeDriver: true }),
    ]).start();
  };

  const cur = slides[index];

  return (
    <Gradient colors={cur.colors} start={{x:0,y:0}} end={{x:1,y:1}}>
      <Content style={{ opacity: fade, transform: [{ scale }] }}>
        <FontAwesome5 name={cur.icon} size={44} color="rgba(255,255,255,0.95)" />
        <Title numberOfLines={2}>{cur.title}</Title>
        <Subtitle numberOfLines={2}>{cur.subtitle}</Subtitle>
      </Content>
    </Gradient>
  );
}
EOF

cat > "$ROOT/src/screens/GiftPacksGrid.jsx" <<'EOF'
import React, { useEffect, useState, useRef } from 'react';
import { Animated, Easing, Dimensions, Modal, ScrollView, ActivityIndicator, FlatList, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';
import axios from 'axios';
import normalizeUri from '../utils/normalizeUri';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const NUM_COLUMNS = 2;
const GAP = 12;
const CARD_WIDTH = Math.floor((SCREEN_WIDTH - GAP * (NUM_COLUMNS + 1)) / NUM_COLUMNS);
const API_URL = 'https://wishandsurprise.com/backend/get_gift_packs.php';
const IMAGE_BASE_URL = 'https://wishandsurprise.com/backend/images/';

const Section = styled.View`
  padding: ${theme.spacing.card}px;
  background-color: #fff7f0;
  border-radius: ${theme.radius.card}px;
  margin-bottom: ${theme.spacing.section}px;
`;
const Header = styled.Text`
  font-size: ${theme.fonts.h1}px;
  font-weight: 800;
  color: ${theme.colors.text};
  text-align: left;
  margin-bottom: 12px;
`;
const CardWrap = styled(Animated.View)`
  width: ${CARD_WIDTH}px;
  margin: ${GAP/2}px;
`;
const Card = styled.View`
  background-color: ${theme.colors.card};
  border-radius: ${theme.radius.card}px;
  padding: 8px;
  elevation: 3;
`;
const Thumb = styled.Image`
  width: 100%;
  height: 110px;
  border-radius: 8px;
  background-color: #f0f0f0;
`;
const Name = styled.Text`
  margin-top: 8px;
  font-size: 14px;
  font-weight: 700;
  color: ${theme.colors.text};
  text-align: center;
`;

export default function GiftPacksGrid() {
  const [giftPacks, setGiftPacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const animsRef = useRef([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    let mounted = true;
    axios.get(API_URL).then(res => {
      if (!mounted) return;
      const data = res?.data?.data ?? res?.data ?? [];
      const list = Array.isArray(data) ? data : [];
      setGiftPacks(list);
      animsRef.current = list.map(() => new Animated.Value(0));
      animateCards(animsRef.current);
    }).catch(err => console.error(err)).finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const animateCards = (anims) => {
    if (!anims || anims.length === 0) return;
    const seq = anims.map((a,i)=>Animated.timing(a,{ toValue:1, duration:320, delay:i*80, useNativeDriver:true, easing:Easing.out(Easing.ease)}));
    Animated.stagger(80, seq).start();
  };

  const openModal = (index) => { setSelectedIndex(index); setModalVisible(true); };

  const renderItem = ({item, index}) => {
    const anim = animsRef.current[index] || new Animated.Value(1);
    const scale = anim.interpolate ? anim.interpolate({ inputRange:[0,1], outputRange:[0.98,1] }) : anim;
    return (
      <CardWrap style={{ transform:[{ scale }] }}>
        <TouchableOpacity onPress={() => openModal(index)} activeOpacity={0.9}>
          <Card>
            <Thumb source={{ uri: normalizeUri(IMAGE_BASE_URL + (item.feature_image || item.image || '')) }} />
            <Name numberOfLines={2}>{item.name}</Name>
          </Card>
        </TouchableOpacity>
      </CardWrap>
    );
  };

  if (loading) return <ActivityIndicator size="large" color={theme.colors.brand} />;

  const selectedPack = selectedIndex !== null && giftPacks[selectedIndex] ? giftPacks[selectedIndex] : null;

  return (
    <Section>
      <Header>Our Combo Packs</Header>
      {giftPacks.length === 0 ? <Name>No combo packs available right now.</Name> : (
        <FlatList
          data={giftPacks}
          numColumns={NUM_COLUMNS}
          renderItem={renderItem}
          keyExtractor={(i)=>String(i.id)}
          contentContainerStyle={{ paddingBottom: 20 }}
          initialNumToRender={4}
          windowSize={5}
        />
      )}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={()=>setModalVisible(false)}>
        <Animated.View style={{ flex:1, backgroundColor:'rgba(0,0,0,0.45)', justifyContent:'center', padding:20 }}>
          <Card>
            {selectedPack ? (
              <ScrollView>
                <Thumb source={{ uri: normalizeUri(IMAGE_BASE_URL + (selectedPack.feature_image || selectedPack.image || '')) }} />
                <Header style={{ marginTop:12 }}>{selectedPack.name}</Header>
                <Name style={{ marginTop:8, color:'#555', fontWeight:'400' }}>{selectedPack.description}</Name>
                <Name style={{ marginTop:12, color:theme.colors.brand, fontWeight:'800' }}>₹ {selectedPack.price}</Name>
              </ScrollView>
            ) : <Name>No pack selected.</Name>}
            <TouchableOpacity onPress={()=>setModalVisible(false)} style={{ marginTop:12, padding:12, backgroundColor:theme.colors.brand, borderRadius:10, alignItems:'center' }}>
              <Name style={{ color:'#fff' }}>Close</Name>
            </TouchableOpacity>
          </Card>
        </Animated.View>
      </Modal>
    </Section>
  );
}
EOF

cat > "$ROOT/src/screens/RelationshipScreen.jsx" <<'EOF'
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, Animated, Easing } from 'react-native';
import styled from 'styled-components/native';
import axios from 'axios';
import normalizeUri from '../utils/normalizeUri';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../theme';

const BASE_URL = 'https://wishandsurprise.com/backend';

const Container = styled.View`
  background-color: #f3fbf6;
  padding-vertical: 18px;
  padding-horizontal: 14px;
  border-radius: 12px;
  margin-bottom: 16px;
`;

const Title = styled.Text`
  font-size: ${theme.fonts.h2}px;
  font-weight: 800;
  color: ${theme.colors.accent};
  text-align: center;
  margin-bottom: 14px;
`;

const ITEM_SIZE = theme.sizes.avatarSmall;
const ITEM_WIDTH = 100;

const ItemTouchable = styled.TouchableOpacity`
  width: ${ITEM_WIDTH}px;
  align-items: center;
  margin-vertical: 8px;
  margin-horizontal: 6px;
  padding-vertical: 4px;
`;

const AvatarWrap = styled.View`
  width: ${ITEM_SIZE}px;
  height: ${ITEM_SIZE}px;
  border-radius: ${ITEM_SIZE / 2}px;
  overflow: hidden;
  align-items: center;
  justify-content: center;
  elevation: 4;
  background-color: #fff;
`;

const AvatarImage = styled.Image`
  width: 100%;
  height: 100%;
`;

const InitialsCircle = styled(Animated.View)`
  width: ${ITEM_SIZE}px;
  height: ${ITEM_SIZE}px;
  border-radius: ${ITEM_SIZE / 2}px;
  align-items: center;
  justify-content: center;
`;

const InitialsText = styled.Text`
  color: white;
  font-weight: 700;
  font-size: 26px;
`;

const Label = styled.Text`
  margin-top: 8px;
  font-size: ${theme.fonts.label}px;
  font-weight: 700;
  color: ${theme.colors.accent};
  text-align: center;
  text-transform: capitalize;
`;

const Centered = styled.View`
  padding-vertical: 18px;
  align-items: center;
  justify-content: center;
`;

const EmptyText = styled.Text`
  color: #64748b;
  font-size: 14px;
  text-align: center;
`;

export default function RelationshipScreen() {
  const [relationships, setRelationships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const navigation = useNavigation();
  const animsRef = useRef([]);

  const fetchRelationships = useCallback(async () => {
    setError(null);
    try {
      const res = await axios.get(`${BASE_URL}/get-categories.php`);
      const raw = res?.data ?? [];
      const filtered = (Array.isArray(raw) ? raw : []).filter(i=>i.block==='relation').map(item=>({ ...item, id: String(item.id ?? item._id ?? item.name), image: item.image ? `${BASE_URL}/${item.image}` : null }));
      setRelationships(filtered);
      animsRef.current = filtered.map(()=>({ opacity: new Animated.Value(0), scale: new Animated.Value(0.96) }));
      requestAnimationFrame(()=>playEntranceAnimation());
    } catch(err){ console.error(err); setError('Unable to load'); setRelationships([]); }
    finally{ setLoading(false); setRefreshing(false); }
  },[]);

  useEffect(()=>{ fetchRelationships(); },[fetchRelationships]);

  const playEntranceAnimation = () => {
    const anims = animsRef.current;
    if(!anims || anims.length===0) return;
    const seq = anims.map((a,i)=>Animated.parallel([ Animated.timing(a.opacity,{ toValue:1, duration:360, delay:i*80, easing:Easing.out(Easing.ease), useNativeDriver:true }), Animated.timing(a.scale,{ toValue:1, duration:360, delay:i*80, easing:Easing.out(Easing.ease), useNativeDriver:true }) ]));
    Animated.stagger(60, seq).start();
  };

  const onRefresh = () => { setRefreshing(true); fetchRelationships(); };
  const handleCategoryPress = (item) => { if(item?.id) navigation.navigate('ProductsScreen', { categoryId: item.id }); };

  const renderItem = ({ item, index }) => {
    const anim = animsRef.current[index] || { opacity: new Animated.Value(1), scale: new Animated.Value(1) };
    const animatedStyle = { opacity: anim.opacity, transform: [{ scale: anim.scale }] };
    const initials = (item.name||'').split(' ').map(p=>p[0]).slice(0,2).join('').toUpperCase();
    const hue = Math.abs(item.id?.split('').reduce((h,c)=>h*31+c.charCodeAt(0),0) || 1) % 360;
    const bg = `hsl(${hue} 68% 45%)`;
    return (
      <ItemTouchable activeOpacity={0.85} onPress={()=>handleCategoryPress(item)} style={[animatedStyle, { width: ITEM_WIDTH }]}>
        <AvatarWrap>
          {item.image ? <AvatarImage source={{ uri: normalizeUri(item.image) }} /> : <InitialsCircle style={{ backgroundColor: bg }}><InitialsText>{initials||'?'}</InitialsText></InitialsCircle>}
        </AvatarWrap>
        <Label numberOfLines={2}>{item.name}</Label>
      </ItemTouchable>
    );
  };

  return (
    <Container>
      <Title>For Every Relationship</Title>
      {loading ? <Centered><ActivityIndicator size="large" color={theme.colors.accent} /></Centered> :
        error ? <Centered><EmptyText>{error}</EmptyText></Centered> :
        relationships.length===0 ? <Centered><EmptyText>No relationships</EmptyText></Centered> : (
          <FlatList data={relationships} renderItem={renderItem} keyExtractor={(i)=>i.id} numColumns={3} showsVerticalScrollIndicator={false} contentContainerStyle={{ alignItems:'center', paddingBottom:6 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.accent]} />} initialNumToRender={9} windowSize={7} removeClippedSubviews />
        )
      }
    </Container>
  );
}
EOF

cat > "$ROOT/src/screens/Home.js" <<'EOF'
import React from 'react';
import styled from 'styled-components/native';
import { ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../theme';
import Header from './Header';
import Banner from './Banner';
import RelationshipScreen from './RelationshipScreen';
import GiftPacksGrid from './GiftPacksGrid';

const Container = styled.SafeAreaView`
  flex: 1;
  background-color: ${theme.colors.bg};
`;

const Body = styled(ScrollView).attrs({ contentContainerStyle: { paddingHorizontal: theme.spacing.page, paddingTop: 12 } })``;

export default function Home() {
  const insets = useSafeAreaInsets();
  return (
    <Container>
      <Body contentContainerStyle={{ paddingBottom: insets.bottom + theme.sizes.navOverlap }}>
        <Header />
        <Banner />
        <RelationshipScreen />
        <GiftPacksGrid />
      </Body>
    </Container>
  );
}
EOF

echo "Files created at: $ROOT"
echo "Creating zip..."
cd "$(dirname "$ROOT")"
ZIPNAME="updated_celabrate_final_local.zip"
rm -f "$ZIPNAME"
zip -r "$ZIPNAME" "$(basename "$ROOT")" > /dev/null
echo "Zip created: $(pwd)/$ZIPNAME"
echo "Done."
