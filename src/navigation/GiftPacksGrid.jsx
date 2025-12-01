// src/navigation/GiftPacksGrid.jsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  StyleSheet,
  Dimensions,
  Animated,
  Easing,
  Pressable,
  ActivityIndicator,
  Modal,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import axios from "axios";
import normalizeUri from "../utils/normalizeUri";
import BuyModal from "../screens/BuyModal";
import GiftRequestModal from "../screens/GiftRequestModal";
import { useNavigation } from "@react-navigation/native";

const numColumns = 2;
const screenWidth = Dimensions.get("window").width;
const spacing = 12;
const cardWidth = (screenWidth - spacing * (numColumns + 1)) / numColumns;

const API_URL = "https://wishandsurprise.com/backend/get_gift_packs.php";
const IMAGE_BASE_URL = "https://wishandsurprise.com/backend/images/";

const GiftPacksGrid = () => {
  const [giftPacks, setGiftPacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [animations, setAnimations] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null);

  // in-place modals
  const [giftRequestVisible, setGiftRequestVisible] = useState(false);
  const [buyModalVisible, setBuyModalVisible] = useState(false);
 const navigation = useNavigation();
  useEffect(() => {
    let mounted = true;
    axios
      .get(API_URL)
      .then((res) => {
        if (!mounted) return;
        const data = res?.data?.data ?? res?.data ?? [];
        setGiftPacks(Array.isArray(data) ? data : []);
        const anims = Array.isArray(data) ? data.map(() => new Animated.Value(0)) : [];
        setAnimations(anims);
        animateCards(anims);
      })
      .catch((err) => console.error("Failed to load gift packs:", err))
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const animateCards = (anims) => {
    if (!Array.isArray(anims) || anims.length === 0) return;
    const animatedSequence = anims.map((anim, index) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 300,
        delay: index * 80,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      })
    );
    Animated.stagger(80, animatedSequence).start();
  };

  const openModal = (index) => {
    console.log('[GiftPacksGrid] openModal index=', index);
    setSelectedIndex(index);
    setModalVisible(true);
  };

  const renderItem = ({ item, index }) => {
    const scaleValue = animations[index] || new Animated.Value(1);
    const scale = scaleValue.interpolate ? scaleValue.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1] }) : scaleValue;

    return (
      <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
        <Pressable
          onPress={() => {
            console.log("[GiftPacksGrid] thumbnail pressed:", item?.id ?? item?.name);
            openModal(index);
          }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          android_ripple={{ color: "#eee" }}
        >
          <Image
            source={{ uri: normalizeUri(IMAGE_BASE_URL + (item.feature_image || item.image || "")) }}
            style={styles.image}
            resizeMode="cover"
          />
          <Text style={styles.name}>{item.name}</Text>
        </Pressable>
      </Animated.View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#444" />
      </View>
    );
  }

  const selectedPack = selectedIndex !== null && giftPacks[selectedIndex] ? giftPacks[selectedIndex] : null;

  return (
    <View style={styles.section}>
      <Text style={styles.header}>🎁 Our Combo Packs</Text>

      <FlatList
        data={giftPacks}
        numColumns={2}
        renderItem={renderItem}
        keyExtractor={(item) => (String(item?.id ?? Math.random()))}
        contentContainerStyle={{ paddingBottom: 80 }}
        nestedScrollEnabled
        keyboardShouldPersistTaps="handled"
      />

      {/* DETAILS MODAL */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedPack ? (
              <ScrollView>
                <Image source={{ uri: normalizeUri(IMAGE_BASE_URL + (selectedPack.feature_image || selectedPack.image || "")) }} style={styles.modalImage} />
                <Text style={styles.modalTitle}>{selectedPack.name}</Text>
                <Text style={styles.modalDesc}>{selectedPack.description}</Text>

                <Text style={styles.subHeader}>Includes:</Text>
                {Array.isArray(selectedPack.items) && selectedPack.items.length > 0 ? (
                  selectedPack.items.map((it, i) => (
                    <Text key={i} style={styles.itemText}>
                      • {it}
                    </Text>
                  ))
                ) : (
                  <Text style={styles.itemText}>No items listed.</Text>
                )}

                <Text style={styles.subHeader}>Images:</Text>
                {Array.isArray(selectedPack.images) && selectedPack.images.length > 0 ? (
                  selectedPack.images.map((img, i) => <Image key={i} source={{ uri: normalizeUri(IMAGE_BASE_URL + img) }} style={styles.itemImage} />)
                ) : (
                  <Text style={styles.itemText}>No extra images.</Text>
                )}

                <Text style={styles.price}>₹ {selectedPack.price}</Text>

                <View style={styles.actionRow}>
                  <TouchableOpacity style={[styles.btn, styles.giftBtn]} onPress={() => { console.log('[GiftPacksGrid] modal Gift pressed'); setGiftRequestVisible(true); }}>
                    <Text style={styles.btnText}>Gift</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={[styles.btn, styles.buyBtn]}
                  onPress={() => {
                    setBuyModalVisible(false); // close details modal (optional)
                    navigation.navigate('BillingAddress', { product: selectedPack });
                  }}
                   >
                    <Text style={styles.btnText}>Buy Now</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            ) : (
              <Text>No pack selected.</Text>
            )}

            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Adapters that map to real modals */}
      <GiftRequestModal visible={giftRequestVisible} onClose={() => setGiftRequestVisible(false)} product={selectedPack} />
      <BuyModal visible={buyModalVisible} onClose={() => setBuyModalVisible(false)} product={selectedPack} />
    </View>
  );
};

const styles = StyleSheet.create({
  section: { padding: 20, backgroundColor: "#fff7f0", borderRadius: 16, margin: 10 },
  header: { fontSize: 22, fontWeight: "bold", textAlign: "center", marginBottom: 16 },
  card: { width: cardWidth, margin: spacing / 2, backgroundColor: "#fff", borderRadius: 12, padding: 10, elevation: 2 },
  image: { width: "100%", height: 120, borderRadius: 8 },
  name: { marginTop: 8, fontSize: 14, fontWeight: "600", textAlign: "center" },
  loaderContainer: { flex: 1, justifyContent: "center" },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", padding: 20 },
  modalContent: { backgroundColor: "#fff", borderRadius: 16, padding: 16, maxHeight: "85%" },
  modalImage: { width: "100%", height: 180, borderRadius: 10 },
  modalTitle: { fontSize: 20, fontWeight: "700", marginTop: 10 },
  modalDesc: { marginTop: 6, color: "#555" },
  subHeader: { marginTop: 12, fontWeight: "700" },
  itemText: { marginLeft: 6, marginTop: 4 },
  itemImage: { width: "100%", height: 120, marginVertical: 6, borderRadius: 8 },
  price: { marginTop: 10, fontSize: 18, fontWeight: "700", color: "#ff6600" },
  actionRow: { flexDirection: "row", marginTop: 12, justifyContent: "space-between" },
  btn: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: "center", marginHorizontal: 4 },
  giftBtn: { backgroundColor: "#FF9F1C" },
  buyBtn: { backgroundColor: "#333" },
  btnText: { color: "#fff", fontWeight: "700" },
  closeButton: { marginTop: 12, padding: 12, backgroundColor: "#ff6600", borderRadius: 8, alignItems: "center" },
  closeText: { color: "#fff", fontWeight: "700" },
});

export default GiftPacksGrid;
