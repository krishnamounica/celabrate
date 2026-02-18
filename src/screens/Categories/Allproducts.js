import React, { useMemo, useState, useEffect } from 'react';
import {
  FlatList,
  Platform,
  Modal,
  ScrollView,
  Text,
  Touchable,
  TouchableOpacity,
} from 'react-native';
import styled from 'styled-components/native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCategories } from '../../redux/categoriesSlice'; // adjust path if needed
import { useNavigation } from '@react-navigation/native';

const { width } = require('react-native').Dimensions.get('window');
const NUM_COLUMNS = 2;
const GAP = 12;
const CARD_WIDTH = (width - GAP * (NUM_COLUMNS + 1)) / NUM_COLUMNS;

export default function ProductsGridScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const reduxProducts = useSelector((state) => (state.products ? state.products.items || state.products : []));
  const categoriesArray = useSelector((state) => (state.categories ? state.categories.items || state.categories : []));

  // UI state
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [onlyFeatured, setOnlyFeatured] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  // Extra filters
  const [sortBy, setSortBy] = useState('none'); // 'none' | 'price_asc' | 'price_desc' | 'rating_desc' | 'newest'
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState(new Set()); // multi-select set of category_id strings

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim().toLowerCase()), 300);
    return () => clearTimeout(t);
  }, [query]);

  // normalize products and categories
  const products = useMemo(() => Array.isArray(reduxProducts) ? reduxProducts : Object.values(reduxProducts || {}), [reduxProducts]);
  const categories = useMemo(() => Array.isArray(categoriesArray) ? categoriesArray : Object.values(categoriesArray || {}), [categoriesArray]);

  // Build category map id -> name
  const categoryMap = useMemo(() => {
  const m = {};

  categories.forEach((c) => {
    if (!c) return;

    const id = c.id != null ? String(c.id) : (c.category_id != null ? String(c.category_id) : null);
    if (!id) return;

    const name = c.name || c.title || c.category_name || `Category ${id}`;
    m[id] = name;
  });

  return m;
}, [categories]);

  // Ensure categories are loaded
  useEffect(() => {
    if (!categories || categories.length === 0) {
      dispatch(fetchCategories());
    }
  }, [dispatch, categories]);

  // derive available category ids from products (if categories endpoint missing some)
  const productCategoryIds = useMemo(() => {
    const set = new Set();
    products.forEach((p) => { if (p && p.category_id != null) set.add(String(p.category_id)); });
    return Array.from(set);
  }, [products]);

  // toggle category in selectedCategories
  function toggleCategory(cat) {
    setSelectedCategories((prev) => {
      const s = new Set(prev);
      if (s.has(cat)) s.delete(cat);
      else s.add(cat);
      return s;
    });
  }

  // Clear filters helper
  function clearAll() {
    setMinPrice('');
    setMaxPrice('');
    setQuery('');
    setSelectedCategories(new Set());
    setOnlyFeatured(false);
    setSortBy('none');
  }

  // Filter + sort pipeline
  const filteredAndSorted = useMemo(() => {
    const min = parseFloat(minPrice) || 0;
    const max = parseFloat(maxPrice) || Number.POSITIVE_INFINITY;

    let out = products.filter((p) => {
      if (!p) return false;
      const txt = ((p.name || '') + ' ' + (p.description || '')).toLowerCase();
      if (debouncedQuery && !txt.includes(debouncedQuery)) return false;
      if (onlyFeatured && !(p.is_featured === '1' || p.is_featured === 1 || p.is_featured === true)) return false;
      const price = parseFloat(p.price) || 0;
      if (price < min || price > max) return false;
      // category multi-select: if some selected, product must match one
      if (selectedCategories.size > 0 && !selectedCategories.has(String(p.category_id))) return false;
      return true;
    });

    // sort
    if (sortBy === 'price_asc') {
      out.sort((a, b) => (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0));
    } else if (sortBy === 'price_desc') {
      out.sort((a, b) => (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0));
    } else if (sortBy === 'rating_desc') {
      out.sort((a, b) => (parseFloat(b.rating) || 0) - (parseFloat(a.rating) || 0));
    } else if (sortBy === 'newest') {
      out.sort((a, b) => {
        const da = a.date_created ? new Date(a.date_created).getTime() : 0;
        const db = b.date_created ? new Date(b.date_created).getTime() : 0;
        return db - da;
      });
    }

    return out;
  }, [products, debouncedQuery, onlyFeatured, minPrice, maxPrice, selectedCategories, sortBy]);

  const renderItem = ({ item }) => {
    const imageUri = item?.image || (item?.images && item.images.length ? item.images[0] : null);
    const price = (parseFloat(item?.price) || 0).toFixed(2);

    return (
      <Card activeOpacity={0.85} onPress={() => console.log('open', item?.id)}>
        <TouchableOpacity onPress={() => navigation.navigate('ProductDetails', { product: item })}>
             <ImageWrap>
          {item?.is_featured === '1' || item?.is_featured === 1 ? (
            <Badge>FEATURED</Badge>
          ) : null}
          {imageUri ? (
            <ProductImage source={{ uri: imageUri }} resizeMode="cover" />
          ) : (
            <NoImageText>No Image</NoImageText>
          )}
        </ImageWrap>
        </  TouchableOpacity>
       

        <Info>
          <Title numberOfLines={2}>{item?.name || 'Unnamed product'}</Title>
          <MetaRow>
            <Price>₹{price}</Price>
            {item?.rating ? <Rating>⭐ {item.rating}</Rating> : null}
          </MetaRow>

          <CategoryNameText>{categoryMap[String(item?.category_id)] || (item?.category_id ? `Category ${item.category_id}` : '')}</CategoryNameText>

          <AddButton onPress={() => navigation.navigate('ProductDetails', { product: item })}>
            <AddButtonText>Add to cart</AddButtonText>
          </AddButton>
        </Info>
      </Card>
    );
  };

  // helper to show how many categories selected
  const selectedCount = selectedCategories.size;

  return (
    <Screen>
      <Header>
        <SearchRow>
          <SearchInput
            placeholder="Search products..."
            placeholderTextColor="#999"
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
          />
        </SearchRow>

        {/* Row: Categories | Featured | Clear */}
        <FiltersRow>
          <FlexButton onPress={() => setCategoryModalVisible(true)}>
            <FlexButtonText>{selectedCount > 0 ? `${selectedCount} selected` : 'Categories'}</FlexButtonText>
          </FlexButton>

          <FlexButton onPress={() => setOnlyFeatured((v) => !v)}>
            <FlexButtonText>{onlyFeatured ? 'Featured' : 'All'}</FlexButtonText>
          </FlexButton>

          <FlexButton onPress={clearAll} danger>
            <FlexButtonText danger>Clear</FlexButtonText>
          </FlexButton>
        </FiltersRow>

        {/* Row: Sort chips */}
        <SortRow>
          <SortLabel>Sort</SortLabel>
          <SortScroll horizontal showsHorizontalScrollIndicator={false}>
            <SortChip active={sortBy === 'none'} onPress={() => setSortBy('none')}>
              <SortText active={sortBy === 'none'}>None</SortText>
            </SortChip>
            <SortChip active={sortBy === 'price_asc'} onPress={() => setSortBy('price_asc')}>
              <SortText active={sortBy === 'price_asc'}>Price ↑</SortText>
            </SortChip>
            <SortChip active={sortBy === 'price_desc'} onPress={() => setSortBy('price_desc')}>
              <SortText active={sortBy === 'price_desc'}>Price ↓</SortText>
            </SortChip>
            <SortChip active={sortBy === 'rating_desc'} onPress={() => setSortBy('rating_desc')}>
              <SortText active={sortBy === 'rating_desc'}>Rating</SortText>
            </SortChip>
            <SortChip active={sortBy === 'newest'} onPress={() => setSortBy('newest')}>
              <SortText active={sortBy === 'newest'}>Newest</SortText>
            </SortChip>
          </SortScroll>
        </SortRow>

        {/* Row: Price inputs */}
        <PriceRow>
          <PriceInput
            keyboardType={Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'numeric'}
            placeholder="Min"
            placeholderTextColor="#999"
            value={minPrice}
            onChangeText={setMinPrice}
          />

          <PriceInput
            keyboardType={Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'numeric'}
            placeholder="Max"
            placeholderTextColor="#999"
            value={maxPrice}
            onChangeText={setMaxPrice}
          />
        </PriceRow>
      </Header>

      <FlatList
        data={filteredAndSorted}
        renderItem={renderItem}
        keyExtractor={(i) => String(i?.id || Math.random())}
        numColumns={NUM_COLUMNS}
        contentContainerStyle={{ padding: GAP }}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <Empty>
            <EmptyText>No products found</EmptyText>
          </Empty>
        )}
      />

      {/* Category multi-select modal */}
      <Modal visible={categoryModalVisible} animationType="slide" onRequestClose={() => setCategoryModalVisible(false)}>
        <ModalScreen>
          <ModalHeader>
            <ModalTitle>Select categories</ModalTitle>
            <ModalClose onPress={() => setCategoryModalVisible(false)}>
              <ModalCloseText>Done</ModalCloseText>
            </ModalClose>
          </ModalHeader>

          <ScrollView contentContainerStyle={{ padding: GAP }}>
            { (categories.length === 0 && productCategoryIds.length === 0) ? (
              <Text>No categories</Text>
            ) : (
              // prefer showing category names from API; fall back to product-derived ids
              (categories.length > 0 ? categories.map((c) => {
                const id = c.id != null ? String(c.id) : String(c.category_id);
                const active = selectedCategories.has(id);
                return (
                  <CategoryRow key={id} onPress={() => toggleCategory(id)}>
                    <CategoryText>{categoryMap[id] || `Category ${id}`}</CategoryText>
                    <CategoryCheckbox active={active}>
                      <CategoryCheckboxText>{active ? '✓' : ''}</CategoryCheckboxText>
                    </CategoryCheckbox>
                  </CategoryRow>
                );
              }) : productCategoryIds.map((id) => {
                const active = selectedCategories.has(id);
                return (
                  <CategoryRow key={id} onPress={() => toggleCategory(id)}>
                    <CategoryText>{`Category ${id}`}</CategoryText>
                    <CategoryCheckbox active={active}>
                      <CategoryCheckboxText>{active ? '✓' : ''}</CategoryCheckboxText>
                    </CategoryCheckbox>
                  </CategoryRow>
                );
              }))
            )}
          </ScrollView>

          <ModalFooter>
            <SmallButton onPress={() => setSelectedCategories(new Set())}>
              <SmallButtonText>Clear</SmallButtonText>
            </SmallButton>
            <SmallButton onPress={() => setCategoryModalVisible(false)}>
              <SmallButtonText>Apply</SmallButtonText>
            </SmallButton>
          </ModalFooter>
        </ModalScreen>
      </Modal>
    </Screen>
  );
}

/* ---------------- styled components ---------------- */
const Screen = styled.View`
  flex: 1;
  background-color: #f7f7f8;
`;

const Header = styled.View`
  padding: ${GAP}px;
  background-color: #fff;
  border-bottom-width: 1px;
  border-bottom-color: #eee;
`;

const SearchRow = styled.View`
  margin-bottom: 12px;
`;

const SearchInput = styled.TextInput`
  background-color: #f2f2f2;
  padding: 12px 14px;
  border-radius: 12px;
  font-size: 14px;
`;

const FiltersRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const FlexButton = styled.TouchableOpacity`
  flex: 1;
  padding: 10px 12px;
  margin-right: 8px;
  background-color: #fff;
  border-radius: 10px;
  border-width: 1px;
  border-color: #eee;
  align-items: center;
  justify-content: center;
`;
const FlexButtonText = styled.Text`
  font-size: 14px;
  color: ${(p) => (p.danger ? '#ff6a00' : '#333')};
  font-weight: 600;
`;

const SortRow = styled.View`
  margin-bottom: 12px;
`;
const SortLabel = styled.Text`
  font-size: 12px;
  color: #666;
  margin-bottom: 8px;
`;
const SortScroll = styled.ScrollView``;
const SortChip = styled.TouchableOpacity`
  padding: 8px 12px;
  margin-right: 8px;
  background-color: ${(p) => (p.active ? '#ff6a00' : '#fff')};
  border-radius: 20px;
  border-width: 1px;
  border-color: #eee;
`;
const SortText = styled.Text`
  font-size: 13px;
  color: ${(p) => (p.active ? '#fff' : '#333')};
`;

const PriceRow = styled.View`
  flex-direction: row;
  align-items: center;
`;

const PriceInput = styled.TextInput`
  flex: 1;
  background-color: #f2f2f2;
  padding: 10px 12px;
  border-radius: 10px;
  font-size: 13px;
  margin-right: 8px;
`;

const Card = styled.TouchableOpacity`
  width: ${CARD_WIDTH}px;
  background-color: #fff;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: ${GAP}px;
  elevation: 2;
`;

const ImageWrap = styled.View`
  width: 100%;
  height: ${CARD_WIDTH}px;
  background-color: #f2f2f2;
  justify-content: center;
  align-items: center;
`;

const ProductImage = styled.Image`
  width: 100%;
  height: 100%;
`;

const NoImageText = styled.Text`
  color: #999;
`;

const Badge = styled.View`
  position: absolute;
  top: 10px;
  left: 10px;
  background-color: rgba(255,106,0,0.95);
  padding: 6px 8px;
  border-radius: 8px;
  z-index: 2;
`;
const Title = styled.Text`
  font-size: 14px;
  font-weight: 600;
  color: #111;
  margin-bottom: 6px;
`;

const Info = styled.View`
  padding: 10px;
`;

const MetaRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const Price = styled.Text`
  font-size: 14px;
  font-weight: 700;
`;
const Rating = styled.Text`
  font-size: 12px;
  color: #666;
`;

const CategoryNameText = styled.Text`
  font-size: 12px;
  color: #666;
  margin-bottom: 8px;
`;

const AddButton = styled.TouchableOpacity`
  margin-top: 4px;
  background-color: #ff6a00;
  padding-vertical: 10px;
  border-radius: 10px;
  align-items: center;
`;
const AddButtonText = styled.Text`
  color: #fff;
  font-weight: 700;
`;

const Empty = styled.View`
  padding: 40px;
  align-items: center;
`;
const EmptyText = styled.Text`
  color: #666;
`;

/* Modal styles */
const ModalScreen = styled.View`
  flex: 1;
  background-color: #fff;
`;
const ModalHeader = styled.View`
  padding: ${GAP}px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  border-bottom-width: 1px;
  border-bottom-color: #eee;
`;
const ModalTitle = styled.Text`
  font-size: 16px;
  font-weight: 700;
`;
const ModalClose = styled.TouchableOpacity``;
const ModalCloseText = styled.Text`
  color: #ff6a00;
  font-weight: 700;
`;

const CategoryRow = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 12px 10px;
  border-radius: 8px;
  border-width: 1px;
  border-color: #eee;
  margin-bottom: 8px;
`;
const CategoryText = styled.Text`
  font-size: 14px;
`;
const CategoryCheckbox = styled.View`
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background-color: ${(p) => (p.active ? '#ff6a00' : '#fff')};
  border-width: 1px;
  border-color: #eee;
  align-items: center;
  justify-content: center;
`;
const CategoryCheckboxText = styled.Text`
  color: #fff;
  font-weight: 700;
`;

const ModalFooter = styled.View`
  padding: ${GAP}px;
  flex-direction: row;
  justify-content: space-between;
`;
const SmallButton = styled.TouchableOpacity`
  padding: 10px 16px;
  border-radius: 8px;
  border-width: 1px;
  border-color: #eee;
`;
const SmallButtonText = styled.Text`
  color: #333;
`;
