import React, { useEffect, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { launchImageLibrary } from "react-native-image-picker";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";

import normalizeUri from "../../utils/normalizeUri";
import GiftRequestModal from "../GiftRequestModal";
import BuyModal from "../BuyModal";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ProductDetails = ({ route }) => {
  const navigation = useNavigation();
  const { product: initialProduct, id } = route?.params || {};

  const [product, setProduct] = useState(initialProduct || null);
  const [loading, setLoading] = useState(false);

  const [giftModalVisible, setGiftModalVisible] = useState(false);
  const [buyModalVisible, setBuyModalVisible] = useState(false);

  /* CUSTOM PRODUCT */
  const [customFields, setCustomFields] = useState([]);
  const [customValues, setCustomValues] = useState({});

  /* COMBO PRODUCT */
  const [comboProducts, setComboProducts] = useState([]);
  const [selectedCombos, setSelectedCombos] = useState({});

  /* ================= FETCH PRODUCT ================= */
  useEffect(() => {
    if (initialProduct) return;

    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `https://wishandsurprise.com/backend/get_product.php?id=${id}`
        );
        setProduct(res.data?.data || res.data);
      } catch (e) {
        console.warn("Product fetch error", e);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, initialProduct]);

  /* ================= FETCH CUSTOM FIELDS ================= */
  useEffect(() => {
    if (!product || product.product_type !== "CUSTOMIZED") return;

    axios
      .get(
        `https://wishandsurprise.com/backend/get_product_custom_fields.php?product_id=${product.id}`
      )
      .then(res => {
        const fields =
          res.data?.fields || res.data?.data || [];
        setCustomFields(fields);
      })
      .catch(() => setCustomFields([]));
  }, [product]);

  /* ================= FETCH COMBO PRODUCTS ================= */
  useEffect(() => {
    if (!product || product.product_type !== "COMBO") return;

    axios
      .get(
        `https://wishandsurprise.com/backend/get_combo_products.php?product_id=${product.id}`
      )
      .then(res => {
        if (res.data?.status) {
          setComboProducts(res.data.data || []);
        }
      })
      .catch(() => setComboProducts([]));
  }, [product]);

  if (loading)
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#FF9F1C" />
      </View>
    );

  if (!product)
    return (
      <View style={styles.container}>
        <Text>No product found</Text>
      </View>
    );

  const mainImage =
    product.image ||
    (Array.isArray(product.images) && product.images[0]);

  /* ================= CUSTOM FIELD RENDER ================= */
  const renderCustomField = field => {
    const value = customValues[field.id];

    if (field.field_type === "TEXT") {
      return (
        <View key={field.id} style={styles.block}>
          <Text style={styles.label}>
            {field.field_label}
            {field.is_required ? " *" : ""}
          </Text>
          <TextInput
            style={styles.input}
            placeholder={field.field_label}
            value={value || ""}
            onChangeText={text =>
              setCustomValues(p => ({ ...p, [field.id]: text }))
            }
          />
        </View>
      );
    }

    if (field.field_type === "IMAGE") {
      return (
        <View key={field.id} style={styles.block}>
          <Text style={styles.label}>
            {field.field_label}
            {field.is_required ? " *" : ""}
          </Text>

          <TouchableOpacity
            style={styles.uploadBox}
            onPress={async () => {
              const res = await launchImageLibrary({
                mediaType: "photo",
                quality: 0.8,
              });

              if (!res.didCancel && res.assets?.length) {
                setCustomValues(p => ({
                  ...p,
                  [field.id]: res.assets[0],
                }));
              }
            }}
          >
            <Text>{value ? "Image Selected ✔️" : "Upload Image"}</Text>
          </TouchableOpacity>

          {value?.uri && (
            <Image source={{ uri: value.uri }} style={styles.preview} />
          )}
        </View>
      );
    }

    return null;
  };

  /* ================= COMBO RENDER ================= */
  const renderComboItem = item => {
  const selected = !!selectedCombos[item.id];

  return (
    <TouchableOpacity
      key={item.id}
      style={[
        styles.comboCard,
        selected && styles.comboSelected,
      ]}
      onPress={() => {
        setSelectedCombos(prev => {
          const updated = { ...prev };

          if (selected) {
            delete updated[item.id];   // ✅ REMOVE KEY
          } else {
            updated[item.id] = item;   // ✅ ADD ITEM
          }

          return updated;
        });
      }}
    >
      <Image
        source={{ uri: normalizeUri(item.image) }}
        style={styles.comboImage}
      />

      <View style={{ flex: 1, marginLeft: 10 }}>
        <Text style={{ fontWeight: "700" }}>{item.name}</Text>
        <Text>Qty: {item.quantity}</Text>
        <Text style={{ color: "#ff6600", fontWeight: "700" }}>
          ₹ {item.combo_price}
        </Text>
      </View>

      <Text style={{ fontSize: 22 }}>
        {selected ? "☑️" : "⬜"}
      </Text>
    </TouchableOpacity>
  );
};


  /* ================= TOTAL ================= */
  const calculateComboTotal = () => {
  let total = Number(product.price);

  Object.values(selectedCombos)
    .filter(Boolean) // ✅ ignore undefined just in case
    .forEach(item => {
      total += Number(item.combo_price) * Number(item.quantity);
    });

  return total;
};


  /* ================= ADD TO CART ================= */
 const handleAddToCart = () => {
  // validation stays SAME
  if (
    product.product_type === "CUSTOMIZED" &&
    customFields.some(
      f =>
        f.is_required &&
        (!customValues[f.id] ||
          (f.field_type === "IMAGE" &&
            !customValues[f.id]?.uri))
    )
  ) {
    alert("Please complete customization");
    return;
  }

  if (
    product.product_type === "COMBO" &&
    Object.keys(selectedCombos).length === 0
  ) {
    alert("Select at least one combo item");
    return;
  }

  // ✅ CALL BACKEND
  addToCartAPI();
};

 const handleBuyNow = async () => {
  // ---------- VALIDATION ----------
  if (product.product_type === "CUSTOMIZED") {
    const invalid = customFields.some(f => {
      const val = customValues[f.id];
      if (!f.is_required) return false;
      if (f.field_type === "TEXT") return !val?.trim();
      if (f.field_type === "IMAGE") return !val?.uri;
      return false;
    });

    if (invalid) {
      alert("Please complete customization");
      return;
    }
  }

  if (
    product.product_type === "COMBO" &&
    Object.keys(selectedCombos).length === 0
  ) {
    alert("Please select at least one combo item");
    return;
  }

  // ---------- PREPARE CUSTOM DATA ----------
  let customData = null;

  if (product.product_type === "CUSTOMIZED") {
    customData = await prepareCustomData(); // ✅ uploads image + JSON
  }

  // ---------- NORMALIZE ITEMS ----------
  const orderItems = [];

  if (product.product_type === "COMBO") {
    Object.values(selectedCombos).forEach(item => {
      orderItems.push({
        product_id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.combo_price,
        image: item.image,
        product_type: "COMBO_CHILD",
        custom_data: null,
        total_price: Number(item.combo_price) * Number(item.quantity),
      });
    });
  } else {
    orderItems.push({
      product_id: product.id,
      name: product.name,
      quantity: 1,
      price: product.price,
      image: product.image,
      product_type: product.product_type,
      custom_data: customData, // ✅ IMPORTANT
      total_price: Number(product.price),
    });
  }

  // ---------- NAVIGATE ----------
  navigation.navigate("BillingAddress", {
    checkout: {
      type: "BUY_NOW",
      items: orderItems,
      totalAmount:
        product.product_type === "COMBO"
          ? calculateComboTotal()
          : Number(product.price),
    },
  });
};


const prepareCustomData = async () => {
  const data = {};

  for (const field of customFields) {
    const value = customValues[field.id];
    if (!value) continue;

    if (field.field_type === "TEXT") {
      data[field.id] = value;
    }

    if (field.field_type === "IMAGE") {
      const uploadedUrl = await uploadImage(value);
      data[field.id] = uploadedUrl;
    }
  }

  return JSON.stringify(data);
};




const handleGift = () => {
  // same validation as Buy Now
  if (product.product_type === "CUSTOMIZED") {
    const invalid = customFields.some(f => {
      const val = customValues[f.id];
      if (!f.is_required) return false;

      if (f.field_type === "TEXT") return !val?.trim();
      if (f.field_type === "IMAGE") return !val?.uri;
      return false;
    });

    if (invalid) {
      alert("Please complete customization");
      return;
    }
  }

  if (
    product.product_type === "COMBO" &&
    Object.keys(selectedCombos).length === 0
  ) {
    alert("Please select combo items");
    return;
  }

  setGiftModalVisible(true);
};
const addToCartAPI = async () => {
  try {
    const stored = await AsyncStorage.getItem("userData");
    const userId = JSON.parse(stored || "{}")?.id;

    if (!userId) {
      alert("Please login first");
      return;
    }
    const customData =
  product.product_type === "CUSTOMIZED"
    ? await prepareCustomData()
    : null;
console.log("CUSTOM VALUES:", customValues);

    await axios.post(
      "https://wishandsurprise.com/backend/cart/add_update_cart.php",
      {
        user_id: userId,
        product_id: product.id,
        product_type: product.product_type,
        quantity: 1,
        custom_data: customData,
        combo_items:
          product.product_type === "COMBO"
            ? Object.values(selectedCombos).map(i => ({
                product_id: i.id,
                quantity: i.quantity,
                price: i.combo_price,
              }))
            : [],
        base_price: product.price,
        total_price:
          product.product_type === "COMBO"
            ? calculateComboTotal()
            : product.price,
      }
    );

    // ✅ AFTER SUCCESS
    navigation.navigate("Cart");

  } catch (e) {
    console.error("Add to cart failed", e);
    alert("Failed to add to cart");
  }
};

const uploadImage = async image => {
  const formData = new FormData();

  formData.append("image", {
    uri: image.uri,
    type: image.type,
    name: image.fileName || "custom.jpg",
  });

  const res = await axios.post(
    "https://wishandsurprise.com/backend/upload_custom_image.php",
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
  console.log("UPLOAD RES:", res.data);
  return res.data?.image_url;
};


  return (
    <ScrollView style={styles.container}>
      <Image
        source={{ uri: normalizeUri(mainImage) }}
        style={styles.productImage}
      />

      <Text style={styles.productName}>{product.name}</Text>

      <Text style={styles.price}>
        ₹{" "}
        {product.product_type === "COMBO"
          ? calculateComboTotal()
          : product.price}
      </Text>

      {/* COMBO */}
      {product.product_type === "COMBO" && (
        <>
          <Text style={styles.section}>🎁 Select Combo Items</Text>
          {comboProducts.map(renderComboItem)}
        </>
      )}

      {/* CUSTOM */}
      {product.product_type === "CUSTOMIZED" && (
        <>
          <Text style={styles.section}>🎨 Customization</Text>
          {customFields.map(renderCustomField)}
        </>
      )}

      {/* ADD TO CART */}
<TouchableOpacity style={styles.cartBtn} onPress={handleAddToCart}>
  <Text style={styles.cartText}>Add to Cart</Text>
</TouchableOpacity>

{/* BUY & GIFT */}
<View style={{ flexDirection: "row", marginTop: 12 }}>
  <TouchableOpacity
    style={[styles.actionBtn, { flex: 1, marginRight: 8 }]}
    onPress={handleGift}
  >
    <Text style={styles.actionText}>🎁 Gift</Text>
  </TouchableOpacity>

  <TouchableOpacity
    style={[styles.actionBtn, { flex: 1 }]}
    onPress={handleBuyNow}
  >
    <Text style={styles.actionText}>Buy Now</Text>
  </TouchableOpacity>
</View>

      

      <GiftRequestModal
        visible={giftModalVisible}
        onClose={() => setGiftModalVisible(false)}
        product={product}
      />

      <BuyModal
        visible={buyModalVisible}
        onClose={() => setBuyModalVisible(false)}
        product={product}
      />
    </ScrollView>
  );
};

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: "#fff" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },

  productImage: { width: "100%", height: 260, borderRadius: 10 },
  productName: { fontSize: 22, fontWeight: "700", marginTop: 12 },
  price: { fontSize: 20, fontWeight: "800", color: "#ff6600" },

  section: { marginTop: 20, fontSize: 18, fontWeight: "700" },
  block: { marginTop: 12 },
  label: { fontWeight: "600", marginBottom: 6 },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
  },

  uploadBox: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },

  preview: { width: 120, height: 120, marginTop: 10, borderRadius: 8 },

  comboCard: {
    flexDirection: "row",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    marginTop: 10,
    alignItems: "center",
  },

  comboSelected: {
    borderColor: "#FF9F1C",
    backgroundColor: "#FFF7ED",
  },

  comboImage: { width: 60, height: 60, borderRadius: 8 },

  cartBtn: {
    backgroundColor: "#FF9F1C",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  actionBtn: {
  backgroundColor: "#FF9F1C",
  padding: 14,
  borderRadius: 10,
  alignItems: "center",
},

actionText: {
  color: "#fff",
  fontWeight: "700",
  fontSize: 16,
},


  cartText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});

export default ProductDetails;
