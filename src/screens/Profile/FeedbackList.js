import React, { useEffect, useState, useCallback } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  Image,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';

const API_BASE = 'https://wishandsurprise.com/backend/getfeedback.php';

export default function FeedbackList({ navigation, route, userId: propUserId }) {
  const userId = route?.params?.userId

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const sanitizePhotoUrl = (url) => {
    if (!url) return null;
    let out = url.trim();
    out = out.replace('wishandsurprise.combackend', 'wishandsurprise.com/backend');
    if (!/^https?:\/\//i.test(out)) {
      out = 'https://' + out.replace(/^\/+/, '');
    }
    return out;
  };

  const fetchFeedback = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const url = `${API_BASE}?userId=${encodeURIComponent(userId)}`;
      const res = await fetch(url);
      console.log('Fetch URL:', url, "response status:", res);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();

      // If API returns success but empty data, we still treat as success and set empty array
      if (json.status !== 'success') throw new Error(json.message || 'API error');

      const normalized = (json.data || []).map((gift) => ({
        giftId: gift.giftId,
        feedback: (gift.feedback || []).map((f) => ({
          ...f,
          photo: sanitizePhotoUrl(f.photo || ''),
        })),
      }));

      setData(normalized);
    } catch (err) {
      setError(err.message);
      setData([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchFeedback();
  };

  const renderFeedbackItem = ({ item }) => {
    // remote placeholder to avoid missing local asset issues
    const placeholderUri = 'https://placehold.co/100x100?text=User';
    return (
      <View style={styles.feedbackCard}>
        <Image
          source={item.photo ? { uri: item.photo } : { uri: placeholderUri }}
          style={styles.avatar}
          resizeMode="cover"
        />

        <View style={styles.feedbackContent}>
          <View style={styles.row}>
            <Text style={styles.name}>{item.name || 'Anonymous'}</Text>
            {item.relationship ? (
              <Text style={styles.relationship}> — {item.relationship}</Text>
            ) : null}
          </View>

          <Text style={styles.message}>{item.message}</Text>
        </View>
      </View>
    );
  };

  const renderGift = ({ item }) => {
    console.log('Rendering gift feedback for giftId:', item);
      return (
      <View style={styles.giftSection}>
        <TouchableOpacity
          style={styles.giftHeader}
          onPress={() =>
            navigation.navigate('GiftDetails', {
              id: item.giftId,
              redirectTo: { name: 'GiftDetails', params: { id: item.giftId } },
            })
          }
        >
          <Text style={styles.giftTitle}>Gift ID: {item.giftId}</Text>
          <Text style={styles.viewAll}>View Details ➜</Text>
        </TouchableOpacity>

        <FlatList
          data={item.feedback}
          keyExtractor={(f, idx) => `${item.giftId}-${f.userId || 'u'}-${idx}`}
          renderItem={renderFeedbackItem}
          scrollEnabled={false}
        />
      </View>
    );
  };

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  // Error state
  if (error) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={fetchFeedback}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Explicit empty-data UI when API returns success but data is empty
  if (!loading && (!data || data.length === 0)) {
    return (
      <SafeAreaView style={styles.center}>
        <Image
          source={{ uri: 'https://placehold.co/180x120?text=No+Wishes' }}
          style={{ width: 180, height: 120, marginBottom: 18 }}
          resizeMode="contain"
        />
        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 8 }}>
          No submitted wishes yet
        </Text>
        <Text style={{ color: '#666', textAlign: 'center', marginHorizontal: 30, marginBottom: 18 }}>
          We couldn't find any feedback for this user. Try again or go to Gifts to submit/view gifts.
        </Text>

        <View style={{ flexDirection: 'row', gap: 12 }}>
          <TouchableOpacity style={[styles.retryBtn, { marginRight: 8 }]} >
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.goBtn]}
            onPress={() => {
              // Navigate to your Gifts list or Home — change route name if different
              if (navigation?.navigate) navigation.navigate('MyBottomTab');
            }}
          >
            <Text style={{ color: '#fff' }}>Go to Gifts</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Normal list render
  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={data}
        keyExtractor={(item) => `gift-${item.giftId}`}
        renderItem={renderGift}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={<Text style={styles.empty}>No feedback found.</Text>}
        contentContainerStyle={data.length === 0 && styles.center}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  giftSection: { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderColor: '#eee' },
  giftHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  giftTitle: { fontWeight: '700', fontSize: 16 },
  viewAll: { color: '#007bff', fontSize: 14 },
  feedbackCard: { flexDirection: 'row', marginBottom: 10, backgroundColor: '#fafafa', padding: 8, borderRadius: 8 },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#ddd' },
  feedbackContent: { flex: 1, marginLeft: 10 },
  row: { flexDirection: 'row', alignItems: 'center' },
  name: { fontWeight: '600' },
  relationship: { color: '#666', marginLeft: 6 },
  message: { marginTop: 4, color: '#333' },
  empty: { textAlign: 'center', marginTop: 20, color: '#666' },
  errorText: { color: 'red' },
  retryBtn: { marginTop: 12, paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#007bff', borderRadius: 6 },
  retryText: { color: '#fff' },
  goBtn: { marginTop: 12, paddingHorizontal: 16, paddingVertical: 8, backgroundColor: 'orange', borderRadius: 6 },
});
