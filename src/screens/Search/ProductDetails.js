// src/screens/Search/ProductDetails.js
import React, { useEffect, useState } from "react";
import { ScrollView, View, Text, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import normalizeUri from "../../utils/normalizeUri";
import axios from "axios";
import BuyModal from "../BuyModal";
import { useNavigation } from "@react-navigation/native";
import GiftRequestModal from "../GiftRequestModal";

const ProductDetails = ({ route }) => {
  const { product: initialProduct, id } = route?.params || {};
  const [product, setProduct] = useState(initialProduct || null);
  const [loading, setLoading] = useState(false);

  const [giftModalVisible, setGiftModalVisible] = useState(false);
  const [buyModalVisible, setBuyModalVisible] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    let mounted = true;
    const fetchProduct = async (prodId) => {
      try {
        setLoading(true);
        const url = `https://wishandsurprise.com/backend/get_product.php?id=${encodeURIComponent(prodId)}`;
        const res = await axios.get(url, { timeout: 15000 });
        const data = res?.data;
        const prod = data?.data || data?.product || data;
        if (mounted) setProduct(prod);
      } catch (err) {
        console.warn("[ProductDetails] fetch error", err?.response?.data || err.message || err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    if (!initialProduct && id) fetchProduct(id);
    return () => { mounted = false; };
  }, [id, initialProduct]);

  if (loading) return <View style={styles.centered}><ActivityIndicator size="large" color="#FF9F1C" /></View>;
  if (!product) return <View style={styles.container}><Text style={{color:'#333'}}>No product data</Text></View>;

  const mainImage = product.feature_image || product.image || (product.images && product.images[0]) || null;

  return (
    <ScrollView style={styles.container}>
      {mainImage ? <Image source={{ uri: normalizeUri(mainImage) }} style={styles.productImage} /> : <View style={[styles.productImage, styles.placeholder]}><Text>No image</Text></View>}
      <Text style={styles.productName}>{product.name}</Text>
      <Text style={styles.price}>₹ {product.price}</Text>

      <View style={{ flexDirection: 'row', marginTop: 12 }}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => { console.log('[ProductDetails] Gift pressed for', product.id); setGiftModalVisible(true); }}>
          <Text style={styles.actionText}>Gift</Text>
        </TouchableOpacity>
        {/* <TouchableOpacity style={[styles.actionBtn, { marginLeft: 10 }]} onPress={() => { console.log('[ProductDetails] Buy pressed for', product.id); setBuyModalVisible(true); }}>
          <Text style={styles.actionText}>Buy Now</Text>
        </TouchableOpacity> */}
        <TouchableOpacity
 style={[styles.actionBtn, { marginLeft: 10 }]}
  onPress={() => {
    // console.log('[GiftPacksGrid] modal Buy pressed -> navigate to BillingAddress', selectedPack?.id);
    setBuyModalVisible(false); // close details modal (optional)
    navigation.navigate('BillingAddress', { product });
  }}
>
   <Text style={styles.actionText}>Buy Now</Text>
</TouchableOpacity>

      </View>

      <Text style={{ marginTop: 14 }}>{product.description}</Text>

      {/* adapters */}
      <GiftRequestModal visible={giftModalVisible} onClose={() => setGiftModalVisible(false)} product={product} />
      <BuyModal visible={buyModalVisible} onClose={() => setBuyModalVisible(false)} product={product} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  productImage: { width: '100%', height: 260, borderRadius: 8, backgroundColor: '#fafafa' },
  placeholder: { justifyContent: 'center', alignItems: 'center' },
  productName: { fontSize: 22, fontWeight: '700', marginTop: 10 },
  price: { fontSize: 20, fontWeight: '800', color: '#ff6600', marginTop: 6 },
  actionBtn: { backgroundColor: '#FF9F1C', padding: 10, borderRadius: 8 },
  actionText: { color: '#fff', fontWeight: '700' },
});

export default ProductDetails;
