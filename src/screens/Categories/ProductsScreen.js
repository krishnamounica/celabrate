// src/screens/ProductsScreenStyled.jsx
import React, { useEffect, useState, useCallback } from "react";
import {
  ScrollView as RNScrollView,
  Image as RNImage,
  TouchableOpacity as RNTouchableOpacity,
  ActivityIndicator,
  View,
} from "react-native";
import { useSelector } from "react-redux";
import RNPickerSelect from "react-native-picker-select";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import styled from "styled-components/native";
import normalizeUri from "../../utils/normalizeUri";
import { theme } from "../../../theme";
import { Modal, Text as RNText, TouchableOpacity } from "react-native";

const BASE_URL = "https://wishandsurprise.com/backend";

/* ---------- Styled components (theme-aware) ---------- */
/* ---------- Styled components (all CTAs unified to brand orange) ---------- */

/* Color constants (edit here if you want slightly different shades) */
const BRAND_ORANGE = '#FF6A00';
const ACCENT_ORANGE = '#FFB26A';
const SUCCESS_GREEN = '#0AA03A';
const MUTED_GRAY = '#6B7280';
const LIGHT_BG = '#FDF6F2';
const SURFACE_ALT = '#F6F0EC';
const BORDER_LIGHT = '#E6E6E6';
const DANGER_RED = '#E53935';

const Container = styled(RNScrollView)`
  flex: 1;
  padding: 16px;
  background-color: ${props => props.theme?.colors?.background || LIGHT_BG};
`;

/* Card */
const Card = styled.View`
  background-color: ${props => props.theme?.colors?.surfaceAlt || SURFACE_ALT};
  border-radius: 16px;
  padding: 16px;
  margin-vertical: 12px;
  elevation: 4;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.06;
  shadow-radius: 6px;
`;

/* Product image and thumbnails */
const ProductImage = styled(RNImage)`
  width: 100%;
  height: 250px;
  border-radius: 12px;
  overflow: hidden;
  background-color: ${BORDER_LIGHT};
`;

const ThumbnailContainer = styled.View`
  flex-direction: row;
  margin-top: 12px;
`;

const Thumbnail = styled(RNImage)`
  width: 60px;
  height: 60px;
  border-radius: 8px;
  margin-horizontal: 4px;
  border-width: 2px;
  border-color: ${props => props.theme?.colors?.muted || BORDER_LIGHT};
`;

/* Product details */
const Details = styled.View`
  padding-vertical: 12px;
`;

const NameText = styled.Text`
  font-size: ${props => (props.theme?.fonts?.h4 ? props.theme.fonts.h4 : 22)}px;
  font-weight: 700;
  color: ${props => props.theme?.colors?.text || '#111'};
`;

const MetaText = styled.Text`
  font-size: ${props => (props.theme?.fonts?.base ? props.theme.fonts.base : 16)}px;
  color: ${props => props.color || props.theme?.colors?.muted || MUTED_GRAY};
  margin-top: ${props => (props.mt ? props.mt : 4)}px;
`;

/* Price styled to use brand dark/orange */
const PriceText = styled.Text`
  font-size: ${props => (props.theme?.fonts?.h3 ? props.theme.fonts.h3 : 20)}px;
  font-weight: 800;
  color: ${BRAND_ORANGE};
  margin-top: 6px;
`;

/* Description uses softer muted color */
const DescriptionText = styled.Text`
  font-size: ${props => (props.theme?.fonts?.body ? props.theme.fonts.body : 15)}px;
  color: ${props => props.theme?.colors?.textSecondary || MUTED_GRAY};
  margin-top: 12px;
  line-height: 22px;
`;

/* Buttons row */
const ButtonsRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-top: 18px;
`;

const ButtonBase = styled(RNTouchableOpacity)`
  flex: 1;
  padding-vertical: 12px;
  padding-horizontal: 14px;
  border-radius: 10px;
  align-items: center;
  justify-content: center;
`;

/* Send gift uses lighter orange accent */
const SendGiftButton = styled(ButtonBase)`
  background-color: ${props => props.theme?.colors?.accent || ACCENT_ORANGE};
  margin-right: 8px;
`;

/* Buy now uses primary brand orange */
const BuyNowButton = styled(ButtonBase)`
  background-color: ${BRAND_ORANGE};
  margin-left: 8px;
`;

/* Make any other CTA-like nav/buttons use brand orange too */
const NavButtonCTA = styled.TouchableOpacity`
  background-color: ${BRAND_ORANGE};
  padding: 12px;
  border-radius: 8px;
  flex: 1;
  align-items: center;
  margin-left: 6px;
`;

/* Button text heavy and white for contrast */
const ButtonText = styled.Text`
  color: ${props => props.color || '#fff'};
  font-size: 16px;
  font-weight: 700;
`;

/* Empty / loader text color */
const EmptyText = styled.Text`
  text-align: center;
  margin-top: 30px;
  font-size: 16px;
  color: ${props => props.theme?.colors?.muted || MUTED_GRAY};
`;

/* Modal overlay and content */
const ModalOverlay = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: rgba(0,0,0,0.6);
`;

const ModalContent = styled.View`
  width: 92%;
  max-height: 90%;
  background-color: ${props => props.theme?.colors?.surface || '#fff'};
  border-radius: 14px;
  padding: 18px;
  align-items: center;
  elevation: 6;
`;

/* Progress and modal text */
const ProgressContainer = styled.View`
  width: 100%;
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const ProgressStep = styled.View`
  flex: 1;
  height: 6px;
  border-radius: 6px;
  margin-horizontal: 4px;
  background-color: ${props => (props.active ? BRAND_ORANGE : BORDER_LIGHT)};
`;

const ModalTitle = styled.Text`
  font-size: ${props => (props.theme?.fonts?.h5 ? props.theme.fonts.h5 : 18)}px;
  font-weight: 700;
  color: ${props => props.theme?.colors?.text || '#222'};
  margin-vertical: 6px;
  text-align: center;
`;

const ModalText = styled.Text`
  color: ${props => props.theme?.colors?.textSecondary || MUTED_GRAY};
  margin-bottom: 8px;
  text-align: center;
`;

/* Form controls inside modal */
const Label = styled.Text`
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.theme?.colors?.text || '#444'};
  margin-bottom: 4px;
  align-self: flex-start;
`;

const Input = styled.TextInput`
  width: 100%;
  padding-vertical: 12px;
  padding-horizontal: 16px;
  border-radius: 8px;
  border-width: 1px;
  border-color: ${props => props.theme?.colors?.muted || BORDER_LIGHT};
  background-color: ${props => props.theme?.colors?.inputBg || '#fff'};
  font-size: 16px;
  color: ${props => props.theme?.colors?.text || '#333'};
  margin-bottom: 10px;
`;

/* Nav buttons inside modal (use brand for primary) */
const NavButtonsRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
  margin-top: 12px;
`;

const NavButton = styled.TouchableOpacity`
  background-color: ${BRAND_ORANGE};
  padding: 12px;
  border-radius: 8px;
  flex: 1;
  align-items: center;
  margin-left: 6px;
`;

/* small helper touchable used for opening date picker */
const TouchableOpacityStyled = styled.TouchableOpacity`
  width: 100%;
`;


const ProductsScreen = ({ route }) => {
  const params = route?.params || {};
  // Defensive: accept multiple possible param names
  const paramCategoryId = params.categoryId ?? params.category ?? params.catId ?? null;
  const categoryId = paramCategoryId != null ? String(paramCategoryId) : null;

  // Debug log
  console.log('[ProductsScreen] categoryId (string):', categoryId);

  const reduxProducts = useSelector((state) => (state.products ? state.products.items || state.products : []));
  const [products, setProducts] = useState(Array.isArray(reduxProducts) ? reduxProducts : []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // If reduxProducts changes, update local list
  useEffect(() => {
    if (Array.isArray(reduxProducts) && reduxProducts.length > 0) {
      setProducts(reduxProducts);
    }
  }, [reduxProducts]);

  // If no products from Redux or filtered list empty, try fetching from backend
  const fetchProductsFromServer = useCallback(async (catId) => {
    if (!catId) return;
    setLoading(true);
    setError(null);
    try {
      // NOTE: adjust endpoint if your backend uses different file/param names
      const url = `${BASE_URL}/get-products.php?category=${encodeURIComponent(catId)}`;
      console.log('[ProductsScreen] fetching products from', url);
      const res = await axios.get(url);
      const data = res?.data ?? [];
      // Expecting array — if backend returns object, tweak accordingly
      if (Array.isArray(data)) {
        setProducts(data);
      } else if (Array.isArray(data.products)) {
        setProducts(data.products);
      } else {
        console.warn('[ProductsScreen] unexpected products response', data);
        setProducts([]);
      }
    } catch (err) {
      console.error('[ProductsScreen] fetch error', err);
      setError('Unable to load products. Try again.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Try fetching when component mounts and categoryId present AND products don't contain matching items
  useEffect(() => {
    if (!categoryId) return;
    const hasMatch = (products || []).some(p => String(p?.category_id) === categoryId);
    if (!hasMatch) {
      fetchProductsFromServer(categoryId);
    }
  }, [categoryId, products, fetchProductsFromServer]);

  const filteredProducts = (products || []).filter(
    (product) => String(product?.category_id ?? product?.category) === (categoryId ?? '')
  );

  return (
    <Container>
      {loading ? (
        <View style={{ paddingVertical: 40 }}>
          <ActivityIndicator size="large" color={theme.colors?.accent || "#ffb74d"} />
        </View>
      ) : error ? (
        <View style={{ paddingVertical: 24, alignItems: 'center' }}>
          <EmptyText>{error}</EmptyText>
        </View>
      ) : filteredProducts.length > 0 ? (
        filteredProducts.map((product) => <ProductCard key={String(product?.id ?? product?._id ?? Math.random())} product={product} />)
      ) : (
        <EmptyText>No products found</EmptyText>
      )}
    </Container>
  );
};

const ProductCard = ({ product }) => {
  const [mainImage, setMainImage] = useState(product?.image);
  const [buyModalVisible, setBuyModalVisible] = useState(false);
  const [selectedProductForBuy, setSelectedProductForBuy] = useState(null);
  const [userData, setUserData] = useState(null);
  const [giftModalVisible, setGiftModalVisible] = useState(false);
  const [formStep, setFormStep] = useState(1);

  useEffect(() => {
    AsyncStorage.getItem("userData")
      .then((str) => {
        if (str) setUserData(JSON.parse(str));
      })
      .catch(console.error);
  }, []);

  const navigation = useNavigation();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    relation: "",
    occasion: "",
    date: "",
    flatNo: "",
    apartment: "",
    landmark: "",
    district: "",
    state: "",
    pincode: "",
  });
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleInputChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  // Open buy modal properly
  const openBuyModal = (prod) => {
    setSelectedProductForBuy(prod);
    setBuyModalVisible(true);
  };

  const closeBuyModal = () => {
    setSelectedProductForBuy(null);
    setBuyModalVisible(false);
  };

  // Open gift modal properly
  const openGiftModal = () => {
    setFormStep(1);
    setGiftModalVisible(true);
  };

  const closeGiftModal = () => {
    setGiftModalVisible(false);
    setFormStep(1);
  };
  
  const handleGiftSubmit = async () => {
    try {
      const userDataString = await AsyncStorage.getItem("userData");
      const userDataObj = userDataString ? JSON.parse(userDataString) : null;

      const payload = {
        name: formData.name,
        phone: formData.phone,
        relation: formData.relation,
        occasion: formData.occasion,
        date: formData.date,
        productId: product.id ?? product._id,
        flatNumber: formData.flatNo,
        building: formData.apartment,
        landmark: formData.landmark,
        district: formData.district,
        state: formData.state,
        pincode: formData.pincode,
        productName: product.name,
        productPrice: product.price,
        status: "pending",
        feedback: [],
        payment: false,
        sharable: false,
        userName: userDataObj?.id,
        paymentlink: "",
        sharablelink: "",
        totalAmount: product.price,
        remainingAmount: product.price,
        noOfPayments: 0,
      };

      const response = await axios.post(`${BASE_URL}/gift_submit.php`, payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userDataObj?.token}`,
        },
      });

      if (response.status === 200 || response.status === 201) {
        alert("Gift request submitted successfully!");
        closeGiftModal();
        navigation.navigate("Request");
      } else {
        alert("Failed to submit gift request. Try again.");
      }
    } catch (error) {
      console.error("Error submitting gift request:", error);
      alert("Error submitting gift request!");
    }
  };

  return (
    <Card>
      {/* Main Image */}
      {mainImage ? (
        <ProductImage source={{ uri: normalizeUri(mainImage) }} />
      ) : (
        <ProductImage source={null} style={{ justifyContent: "center", alignItems: "center" }} />
      )}

      <ThumbnailContainer />

      <Details>
        <NameText>{product?.name || "Unnamed Product"}</NameText>
        <MetaText mt={4}>Brand: {product?.brand || "Unknown"}</MetaText>
        <MetaText mt={2}>Category: {product?.category_id ?? product?.category ?? "Unknown"}</MetaText>
        <PriceText>Price: ₹{product?.price ?? "N/A"}</PriceText>
        <MetaText mt={4} color={(product?.countInStock ?? 0) > 0 ? theme.colors?.success || "#4caf50" : theme.colors?.danger || "#e53935"}>
          {(product?.countInStock ?? 0) > 0 ? "In Stock" : "Out of Stock"}
        </MetaText>
        <MetaText mt={4} color={theme.colors?.muted || "#ffa726"}>⭐ Rating: {product?.rating ?? "0"}/5</MetaText>
        <DescriptionText>{product?.description || "No description available."}</DescriptionText>
      </Details>

      <ButtonsRow>
        <SendGiftButton onPress={openGiftModal} accessibilityRole="button" accessibilityLabel="Open send gift modal">
          <ButtonText>Send Gift</ButtonText>
        </SendGiftButton>

        <BuyNowButton
  onPress={() => {
    // navigate to billing screen. pass minimal product data the billing screen will need
    navigation.navigate('BillingAddress', {
      productId: product?.id ?? product?._id,
      product: product,
      quantity: 1,
      price: Number(product?.price) || 0,
      from: 'ProductsScreen',
    });
  }}
  accessibilityRole="button"
  accessibilityLabel="Go to billing address"
>
  <ButtonText>Buy Now</ButtonText>
</BuyNowButton>

      </ButtonsRow>

      {/* Buy Modal (simple example) */}
      <Modal
        visible={buyModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeBuyModal}
      >
        <ModalOverlay>
          <ModalContent style={{ width: '92%' }}>
            <ModalTitle>Buy Now</ModalTitle>
            <ModalText>{selectedProductForBuy?.name || 'Product'}</ModalText>
            <ModalText>Price: ₹{selectedProductForBuy?.price ?? 'N/A'}</ModalText>

            {/* add quantity, payment flow UI here as needed */}
            <View style={{ flexDirection: 'row', marginTop: 12, width: '100%' }}>
              <NavButton onPress={closeBuyModal} style={{ flex: 1, marginRight: 6 }}>
                <ButtonText>Close</ButtonText>
              </NavButton>

              <NavButton
                onPress={() => {
                  // placeholder: navigate to checkout / create order
                  // ensure navigation target exists
                  closeBuyModal();
                  navigation.navigate("Checkout", { product: selectedProductForBuy });
                }}
                style={{ flex: 1, marginLeft: 6 }}
              >
                <ButtonText>Proceed</ButtonText>
              </NavButton>
            </View>
          </ModalContent>
        </ModalOverlay>
      </Modal>

      {/* Gift Modal (uses your form steps) */}
      <Modal
        visible={giftModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeGiftModal}
      >
        <ModalOverlay>
          <ModalContent>
            <ProgressContainer>
              {[1, 2, 3, 4].map((s) => (
                <ProgressStep key={s} active={formStep >= s} />
              ))}
            </ProgressContainer>

            <ModalTitle>Step {formStep}</ModalTitle>
            {formStep === 1 && <ModalText>Enter recipient's basic contact information.</ModalText>}
            {formStep === 2 && <ModalText>Specify your relationship and the occasion.</ModalText>}
            {formStep === 3 && <ModalText>Provide the building and location details.</ModalText>}
            {formStep === 4 && <ModalText>Finish with district, state, and pincode.</ModalText>}

            {formStep === 1 && (
              <>
                <Label>Name</Label>
                <Input
                  placeholder="Enter recipient's name"
                  value={formData.name}
                  onChangeText={(text) => handleInputChange("name", text)}
                />
                <Label>Phone</Label>
                <Input
                  placeholder="Enter phone number"
                  keyboardType="phone-pad"
                  value={formData.phone}
                  onChangeText={(text) => handleInputChange("phone", text)}
                />
              </>
            )}

            {formStep === 2 && (
              <>
                <Label>Relation</Label>
                <RNPickerSelect
                  onValueChange={(value) => handleInputChange("relation", value)}
                  value={formData.relation}
                  items={[
                    { label: "Friend", value: "Friend" },
                    { label: "Brother", value: "Brother" },
                    { label: "Sister", value: "Sister" },
                    { label: "Mother", value: "Mother" },
                    { label: "Father", value: "Father" },
                    { label: "Husband", value: "Husband" },
                    { label: "Wife", value: "Wife" },
                  ]}
                  placeholder={{ label: "Select a relation", value: null }}
                  style={pickerSelectStyles}
                />

                <Label>Occasion</Label>
                <RNPickerSelect
                  onValueChange={(value) => handleInputChange("occasion", value)}
                  value={formData.occasion}
                  items={[
                    { label: "Birthday", value: "Birthday" },
                    { label: "Anniversary", value: "Anniversary" },
                    { label: "Wedding", value: "Wedding" },
                    { label: "Graduation", value: "Graduation" },
                    { label: "Festival", value: "Festival" },
                  ]}
                  placeholder={{ label: "Select an occasion", value: null }}
                  style={pickerSelectStyles}
                />

                <Label>Date</Label>
                <TouchableOpacityStyled onPress={() => setShowDatePicker(true)}>
                  <Input placeholderTextColor={theme.colors?.muted || "#888"} editable={false} value={formData.date || "Select date"} />
                </TouchableOpacityStyled>

                {showDatePicker && (
                  <DateTimePicker
                    mode="date"
                    display="default"
                    value={new Date()}
                    onChange={(event, selectedDate) => {
                      setShowDatePicker(false);
                      if (selectedDate) {
                        const year = selectedDate.getFullYear();
                        const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
                        const day = String(selectedDate.getDate()).padStart(2, "0");
                        const formattedDate = `${year}-${month}-${day}`;
                        handleInputChange("date", formattedDate);
                      }
                    }}
                  />
                )}
              </>
            )}

            {formStep === 3 && (
              <>
                <Label>Flat No.</Label>
                <Input placeholder="Enter flat number" value={formData.flatNo} onChangeText={(text) => handleInputChange("flatNo", text)} />
                <Label>Apartment</Label>
                <Input placeholder="Apartment name" value={formData.apartment} onChangeText={(text) => handleInputChange("apartment", text)} />
                <Label>Landmark</Label>
                <Input placeholder="Nearby landmark" value={formData.landmark} onChangeText={(text) => handleInputChange("landmark", text)} />
              </>
            )}

            {formStep === 4 && (
              <>
                <Label>District</Label>
                <Input placeholder="Enter district" value={formData.district} onChangeText={(text) => handleInputChange("district", text)} />
                <Label>State</Label>
                <Input placeholder="Enter state" value={formData.state} onChangeText={(text) => handleInputChange("state", text)} />
                <Label>Pincode</Label>
                <Input placeholder="Enter pincode" keyboardType="numeric" value={formData.pincode} onChangeText={(text) => handleInputChange("pincode", text)} />
              </>
            )}

            <NavButtonsRow>
              {formStep > 1 && (
                <NavButton onPress={() => setFormStep(formStep - 1)}>
                  <ButtonText>Back</ButtonText>
                </NavButton>
              )}

              {formStep < 4 ? (
                <NavButton onPress={() => setFormStep(formStep + 1)}>
                  <ButtonText>Next</ButtonText>
                </NavButton>
              ) : (
                <NavButton onPress={handleGiftSubmit}>
                  <ButtonText>Submit</ButtonText>
                </NavButton>
              )}
            </NavButtonsRow>

            {/* Close modal small control */}
            <View style={{ width: '100%', marginTop: 8 }}>
              <NavButton onPress={closeGiftModal}>
                <ButtonText>Close</ButtonText>
              </NavButton>
            </View>
          </ModalContent>
        </ModalOverlay>
      </Modal>
    </Card>
  );
};

export default ProductsScreen;
