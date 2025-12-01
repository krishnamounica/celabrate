import React, { useEffect, useState } from 'react';
import { Linking } from 'react-native';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, Modal, TextInput, TouchableOpacity, Image, Share, KeyboardAvoidingView, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RazorpayCheckout from 'react-native-razorpay';
import ImagePicker from 'react-native-image-crop-picker';
import axios from 'axios';
import withSplashScreen from '../navigation/withSplashScreen';

const GiftDetailsScreen = ({ route, navigation }) => {
  // Be defensive — route.params may be undefined when the app is cold-launched.
  const id = route?.params?.id ?? null;

  // console.log('[GiftDetails] mount. route.params =', route?.params);
  // console.log('[GiftDetails] derived id from route.params:', id);
  // console.log('[GiftDetails] mounted with route.params:', route?.params, 'derived id:', id);

  useEffect(() => {
    (async () => {
      try {
        const initial = await Linking.getInitialURL();
        console.log('[GiftDetails] initialURL on mount:', initial);
      } catch (e) {
        console.warn('[GiftDetails] error reading initialURL on mount:', e);
      }
    })();
  }, []);


  // If user isn't logged in, send them to Login and include a redirect target.
  useEffect(() => {
    const ensureLoggedIn = async () => {
      console.log('[GiftDetails] ensureLoggedIn: checking AsyncStorage userData');
      try {
        const user = await AsyncStorage.getItem('userData');
        // if no user and we have an id, redirect to Login and tell Login where to go after success
        if (!user) {
          if (id) {
            console.log('[GiftDetails] user not logged in — redirecting to Login with id', id);
          navigation.replace('Login', {
              redirectTo: { name: 'GiftDetails', params: { id } },
            });
          } else {
            // No id — fallback to Login (no redirect target)
            navigation.replace('Login');
          }
        }
      } catch (err) {
        console.error('Error checking login status in GiftDetailsScreen', err);
      }
    };
    ensureLoggedIn();
  }, []);


  const [gift, setGift] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [customAmount, setCustomAmount] = useState('');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackName, setFeedbackName] = useState('');
  const [feedbackRelationship, setFeedbackRelationship] = useState('');
  const [feedbackRelationshipOther, setFeedbackRelationshipOther] = useState('');
  const [feedbackImage, setFeedbackImage] = useState(null);
  const [suggestionsExpanded, setSuggestionsExpanded] = useState(false);
  const [showSuggestionHint, setShowSuggestionHint] = useState(false);
  const [resolvedFeedbackUris, setResolvedFeedbackUris] = useState({});
  const [failedFeedbackImgs, setFailedFeedbackImgs] = useState({});

  // Fetch when we have an id. This covers cold-launch initial URL and later updates.
  // Require user to be logged in before viewing GiftDetails. If not logged in, send
  // the user to the Login screen and include a redirect target so we can come back.
  useEffect(() => {
    const ensureLoggedIn = async () => {
      console.log('[GiftDetails] ensureLoggedIn start. route.params =', route?.params, 'id =', id);
      try {
        const userDataString = await AsyncStorage.getItem('userData');
        const userEmail = await AsyncStorage.getItem('userEmail');
        console.log('[GiftDetails] AsyncStorage userDataString exists?', !!userDataString, 'userEmail exists?', !!userEmail);
        if (!userDataString && !userEmail) {
          console.log('[GiftDetails] no logged-in user. Need to redirect to Login. Starting targetId resolution.');
          let targetId = id;
          console.log('[GiftDetails] initial targetId from route.params:', targetId);
          if (!targetId) {
            try {
              const url = await Linking.getInitialURL().catch(() => null);
              console.log('[GiftDetails] getInitialURL() returned:', url);
              if (url) {
                try {
                  const u = new URL(url);
                  // look for path like /giftdetails/:id or /giftdetails?id=123
                  const parts = u.pathname.split('/').filter(Boolean);
                  const idx = parts.findIndex(p => p.toLowerCase().includes('giftdetails'));
                  if (idx >= 0 && parts.length > idx + 1) {
                    targetId = parts[idx + 1];
                    console.log('[GiftDetails] targetId set from path segment:', targetId);
                  }
                  if (!targetId && u.searchParams.has('id')) {
                    targetId = u.searchParams.get('id');
                    console.log('[GiftDetails] targetId set from query param id:', targetId);
                  }
                } catch (e) {
                  console.warn('[GiftDetails] URL parse error, falling back to regex', e);
                 const m = url.match(/giftdetails\/?([^\/?#]+)/i);
                  if (m && m[1]) {
                    targetId = m[1];
                    console.log('[GiftDetails] targetId set from regex:', targetId);
                  }
                }
              }
            } catch (err) {
              console.warn('[GiftDetails] getInitialURL() threw error', err);
            }
          }

          if (!targetId) {
            console.warn('[GiftDetails] could not resolve targetId from deep link. Will NOT send redirectTo to Login. User will go to home.');
            try {
              const rawUrl = await Linking.getInitialURL().catch(() => null);
              console.log('[GiftDetails] final raw URL when targetId missing:', rawUrl);
              try {
                fetch('https://wishandsurprise.com/backend/log_deeplink.php', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ event: 'missing_id', url: rawUrl, source: 'GiftDetails.ensureLoggedIn' }),
                }).catch(() => {});
              } catch (e) {
                console.warn('[GiftDetails] failed to send log_deeplink missing_id', e);
              }
            } catch (e) {
              console.warn('[GiftDetails] getInitialURL() failed inside missing targetId handler', e);
            }
            // Do not continue: let Auth flow send user to default screen
            return;
          }

          const redirectPayload = {
            redirectTo: { name: 'GiftDetails', params: { id: targetId } },
            message: 'Please sign in to view this gift',
          };
          console.log('[GiftDetails] redirecting to Login with payload:', redirectPayload);
          navigation.replace('Login', redirectPayload);
          return;
        } else {
          console.log('[GiftDetails] user already logged in. Skipping redirect to Login.');
        }
      } catch (err) {
        console.warn('[GiftDetails] Auth check failed in ensureLoggedIn', err);
      }
    };

    ensureLoggedIn();
  }, [navigation, id, route]);
useEffect(() => {
    if (!id) {
      console.log('[GiftDetails] no id present in route, skipping fetch. route.params:', route?.params);
      // No id provided yet — don't try to fetch.
      setGift(null);
      setLoading(false);
      return;
    }

    const fetchGift = async () => {
      console.log('[GiftDetails] fetchGift called with id:', id);
      setLoading(true);
      try {
        const response = await axios.get(
          `https://wishandsurprise.com/backend/get_gift_request.php?userId=${id}`
        );
        setGift(response.data);
      } catch (error) {
        console.error('Error fetching gift:', error);
        Alert.alert('Error', 'Failed to fetch gift details.');
      } finally {
        setLoading(false);
      }
    };

    fetchGift();
  }, [id]);

  // Handle payment flow using Razorpay native checkout
  const handlePay = async (amountToPay) => {
    try {
      const amountInPaise = Math.round(Number(amountToPay) * 100);
      const userDataString = await AsyncStorage.getItem('userData');
      const userData = userDataString ? JSON.parse(userDataString) : {};
      const userId = userData?.id;

      // 1) Ask server to create an order
      const orderResp = await fetch('https://wishandsurprise.com/backend/create-order.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: amountInPaise, currency: 'INR' }),
      });
      const orderData = await orderResp.json();
      if (!orderData.orderId) throw new Error('Failed to create order on server');

      // 2) Open Razorpay checkout
      const options = {
        description: `Payment for ${gift.productName}`,
        currency: 'INR',
        key: 'rzp_live_yOvVxv8Djhx8ds',
        amount: amountInPaise,
        name: 'Wish and Surprise',
        order_id: orderData.orderId,
        prefill: {
          email: userData?.email || '',
          contact: userData?.phone || '',
          name: userData?.name || '',
        },
        theme: { color: '#F37254' },
      };

      RazorpayCheckout.open(options)
        .then(async (data) => {
          // save payment to server
          await fetch('https://wishandsurprise.com/backend/save-payment.php', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${userData?.token || ''}`,
            },
            body: JSON.stringify({
              razorpay_payment_id: data.razorpay_payment_id,
              razorpay_order_id: data.razorpay_order_id,
              razorpay_signature: data.razorpay_signature,
              productId: gift.id ?? gift._id,
              productName: gift.productName,
              amount: amountToPay,
              userId: userId,
            }),
          });

          // update gift totals
          const prevPaid = Number(gift.paymentAmount || 0);
          const newPaid = prevPaid + Number(amountToPay);
          const newRemaining = Math.max(Number(gift.productPrice || 0) - newPaid, 0);
          const newNoOfPayments = (parseInt(gift.noOfPayments) || 0) + 1;

          await fetch(`https://wishandsurprise.com/backend/update-gift.php?id=${gift.id ?? gift._id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${userData?.token || ''}`,
            },
            body: JSON.stringify({
              amountPaid: amountToPay,
              remainingAmount: newRemaining,
              noOfPayments: newNoOfPayments,
              paymentAmount: newPaid,
            }),
          });

          // apply to local state and show feedback modal
          setGift((prev) => ({ ...prev, paymentAmount: newPaid, remainingAmount: newRemaining, noOfPayments: newNoOfPayments }));
          setShowFeedbackModal(true);
          setCustomAmount('');
        })
        .catch((err) => {
          console.error('Razorpay Payment Failed:', err);
          Alert.alert('Payment Failed', err.description || 'Something went wrong');
        });
    } catch (err) {
      console.error('Error during payment:', err);
      Alert.alert('Payment Error', 'Could not initiate payment.');
    }
  };

  // fetchGift logic is now handled in the useEffect above (run when `id` updates)

  // Parse feedback list (gift.feedback may be JSON string or array)
  // NOTE: this parsing and the hooks/useEffect below must be declared BEFORE
  // any early returns so React hooks are called in the same order on every render.
  let feedbackList = [];
  try {
    if (gift && gift.feedback) {
      feedbackList = typeof gift.feedback === 'string' ? JSON.parse(gift.feedback) : gift.feedback;
      if (!Array.isArray(feedbackList)) feedbackList = [];
    }
  } catch (err) {
    console.warn('Unable to parse feedback list for gift', err);
    feedbackList = [];
  }

  // Helper: normalize a photo URL returned by the server or a local picker
  // - convert server-side relative paths to https://wishandsurprise.com/...
  // - convert http://wishandsurprise.com -> https://wishandsurprise.com to avoid cleartext/blocking
  // - keep other absolute http(s)/file:// URLs as-is
  const normalizePhotoUri = (uri) => {
    if (!uri) return null;
    // If it's an http URL to our domain, always prefer HTTPS
    if (typeof uri === 'string' && uri.startsWith('http://') && uri.includes('wishandsurprise.com')) {
      return uri.replace(/^http:\/\//i, 'https://');
    }
    // Already absolute or file scheme
    if (typeof uri === 'string' && (uri.startsWith('http://') || uri.startsWith('https://') || uri.startsWith('file://'))) {
      return uri;
    }
    if (typeof uri === 'string' && uri.startsWith('/')) {
      // Relative path starting with slash -> join to main domain
      return `https://wishandsurprise.com${uri}`;
    }
    // Some servers return relative paths without leading slash
    if (typeof uri === 'string') {
      return `https://wishandsurprise.com/${uri}`;
    }
    // For object values returned by some pickers
    if (uri && uri.path) {
      // local path on device - ensure file:// prefix
      return uri.path.startsWith('file://') ? uri.path : `file://${uri.path}`;
    }
    if (uri && uri.uri) {
      return typeof uri.uri === 'string' && (uri.uri.startsWith('http') || uri.uri.startsWith('file://')) ? uri.uri : `file://${uri.uri}`;
    }
    return null;
  };

  // Try a HEAD request quickly to check if an URL exists (200).
  const urlExists = async (url, timeoutMs = 4000) => {
    if (!url) return false;
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeoutMs);
      const resp = await fetch(url, { method: 'HEAD', signal: controller.signal });
      clearTimeout(id);
      return resp && resp.status >= 200 && resp.status < 400;
    } catch (err) {
      // network error or abort
      return false;
    }
  };

  // Quick suggestion chips for feedback — tuned by relation/occasion
  // Never use hooks here so the render/hook order remains stable.
  const quickSuggestions = (() => {
    // base generics
    const base = [
      'So proud of you — keep shining ✨',
      'You make everything brighter. Cheers to you!',
      'Thanks for being you — sending lots of love ❤️',
      'Congrats — well deserved!',
    ];

    try {
      const name = (gift?.name || '').trim();

      // prefer the contributor selection (including Other text when provided)
      const relRaw = feedbackRelationship === 'Other' && feedbackRelationshipOther ? feedbackRelationshipOther : (feedbackRelationship || gift?.relation || '');
      const rel = String(relRaw).toLowerCase();
      const occ = (gift?.occasion || '').toLowerCase();

      const suggestions = [];

      // Occasion-aware suggestions (first-priority)
      if (occ.includes('birthday')) {
        suggestions.push(name ? `Happy Birthday, ${name}! Wishing you a fantastic year ahead 🎂` : 'Happy Birthday! Wishing you a fantastic year ahead 🎂');
        suggestions.push('Eat cake, spread smiles — have the best birthday!');
      }
      if (occ.includes('anniversary')) {
        suggestions.push(name ? `Happy Anniversary, ${name} — here’s to many more beautiful years ❤️` : 'Happy Anniversary — many more beautiful years together ❤️');
        suggestions.push('Wishing you continued love & joy on your special day.');
      }
      if (occ.includes('graduation') || occ.includes('congrat')) {
        suggestions.push(name ? `Huge congrats ${name} — your hard work paid off!` : 'Huge congrats — your hard work paid off!');
        suggestions.push('Onward and upward — celebrate this milestone!');
      }

      // Relationship-aware suggestions (second-priority)
      if (rel.includes('friend')) {
        suggestions.push(name ? `To my friend ${name} — thanks for always being there!` : 'To my friend — thanks for always being there!');
        suggestions.push('You make life more fun — big hugs!');
      }
      if (rel.includes('sister') || rel.includes('brother')) {
        suggestions.push(name ? `Love you always ${name} — you’re the best!` : "Love you always — you're the best!");
        suggestions.push('Siblings for life — keep shining.');
      }
       
              if (rel.includes('son') || rel.includes('daughter') || rel.includes('child')) {
        suggestions.push(name ? `So proud of you, ${name} — keep reaching for the stars!` : 'So proud of you — keep reaching for the stars!');
        suggestions.push('Keep being amazing — love you tons.');
      }
      if (rel.includes('cousin')) {
        suggestions.push(name ? `Hey ${name}, love the memories — here’s to many more!` : 'Hey, love the memories — here’s to many more!');
        suggestions.push('Cousins forever — stay awesome.');
      }
      if (rel.includes('uncle') || rel.includes('aunt')) {
        suggestions.push(name ? `Dear ${name}, thanks for being there — much love.` : 'Thanks for always being a guiding light — much love.');
        suggestions.push('Your kindness means a lot — thank you.');
      }
      if (rel.includes('grand') || rel.includes('grandmother') || rel.includes('grandfather')) {
        suggestions.push(name ? `Dear ${name}, your love is our family’s strength — love you.` : 'Your love is our family’s strength — love you.');
        suggestions.push('Warm hugs and lots of love.');
      }
      if (rel.includes('neighbor')) {
        suggestions.push('Thanks for being a great neighbour — appreciate you!');
        suggestions.push('So glad to have you nearby — many thanks.');
      }
      if (rel.includes('boss') || rel.includes('manager') || rel.includes('lead')) {
        suggestions.push('Many congratulations — your leadership inspires us all.');
        suggestions.push('Thank you for your guidance — onward to more success.');
      }
      if (rel.includes('colleague') || rel.includes('work') || rel.includes('team')) {
        suggestions.push('Congrats on this milestone — proud to work with you!');
        suggestions.push('Thanks for being an awesome teammate — here’s to more wins.');
      }
      if (rel.includes('husband') || rel.includes('wife') || rel.includes('partner') || rel.includes('spouse')) {
        suggestions.push(name ? `I love you, ${name} — you’re my anchor and my adventure.` : "I love you — you're my anchor and my adventure.");
        suggestions.push('Grateful for you every day — love always.');
      }
      if (rel.includes('parent') || rel.includes('mother') || rel.includes('father') || rel.includes('mom') || rel.includes('dad')) {
        suggestions.push(name ? `Dear ${name}, thanks for everything — love you.` : 'Thanks for always being there — love you.');
        suggestions.push('Your support means the world to me — thank you.');
      }
      if (rel.includes('colleague') || rel.includes('work') || rel.includes('team')) {
        suggestions.push('Congrats on this milestone — proud to work with you!');
        suggestions.push('Thanks for being an awesome teammate — here’s to more wins.');
      }

      // Always append a couple of neutral fallbacks (unique)
      const merged = [...suggestions, ...base];

      // De-duplicate while preserving order
      return Array.from(new Set(merged)).slice(0, 6);
    } catch (err) {
      return base.slice(0, 5);
    }
  })();

  // show hint only once - load persisted flag on component mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const seen = await AsyncStorage.getItem('seenSuggestionHint');
        if (!mounted) return;
        // show hint only if not seen
        setShowSuggestionHint(seen !== 'true');
      } catch (e) {
        // ignore
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Resolve feedback image URL robustly: try normalized https, then http, then alternate paths
  // This effect runs on every render (hook is declared unconditionally) but only
  // performs work when `gift` (and thus feedbackList) exists.
  useEffect(() => {
    if (!gift) return; // nothing to do until gift exists
    let mounted = true;
    const resolveAll = async () => {
      const map = {};
      for (let i = 0; i < feedbackList.length; i++) {
        const fb = feedbackList[i];
        if (!fb || !fb.photo) continue;

        const original = typeof fb.photo === 'string' ? fb.photo : (fb.photo.uri || fb.photo.path || '');
        const candidates = [];

        // primary: normalized (https preferred)
        const normalized = normalizePhotoUri(original);
        if (normalized) candidates.push(normalized);

        // if original was http, try original http too (fallback)
        if (typeof original === 'string' && original.startsWith('http://') && original.includes('wishandsurprise.com')) {
          candidates.push(original);
        }

        // try variations: drop or add /backend/ prefix (server inconsistencies)
        try {
          const urlObj = new URL(normalized || original);
          const pathname = urlObj.pathname || '';
          if (pathname.includes('/backend/')) {
            const alt = urlObj.href.replace('/backend/', '/');
            candidates.push(alt);
          } else {
            const alt = urlObj.href.replace('/uploads/', '/backend/uploads/');
            if (alt !== urlObj.href) candidates.push(alt);
          }
        } catch (_) {
          // ignore URL parse failures
        }

        // de-duplicate
        const uniq = Array.from(new Set(candidates));

        let chosen = null;
        for (const c of uniq) {
          const ok = await urlExists(c);
          if (ok) { chosen = c; break; }
        }

        if (!chosen) {
          console.warn('[GiftDetails] could not resolve feedback photo, tried:', uniq);
        }

        if (chosen && mounted) map[i] = chosen;
      }

      if (mounted) setResolvedFeedbackUris(map);
    };

    resolveAll();
    return () => { mounted = false; };
  }, [gift, /* keep fixed dependency - effect only does work when gift exists */]);

  if (!id) {
    return (
      <View style={styles.center}>
        <Text>No gift ID supplied in the deep link.</Text>
      </View>
    );
  }

  if (loading) {
    return <ActivityIndicator style={{ flex: 1 }} size="large" color="#000" />;
  }

  if (!gift) {
    return (
      <View style={styles.center}>
        <Text>No gift found.</Text>
      </View>
    );
  }

  

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🎁 Gift for {gift.name}</Text>

      <Section title="Recipient Info">
        <Item label="Name" value={gift.name} />
        <Item label="Phone" value={gift.phone} />
        <Item label="Relation" value={gift.relation} />
        <Item label="Occasion" value={gift.occasion} />
        <Item label="Date" value={new Date(gift.date).toDateString()} />
      </Section>

      <Section title="Delivery Address">
        <Item label="Flat Number" value={gift.flatNumber} />
        <Item label="Building" value={gift.building} />
        <Item label="Landmark" value={gift.landmark} />
        <Item label="District" value={gift.district} />
        <Item label="State" value={gift.state} />
        <Item label="Pincode" value={gift.pincode} />
      </Section>

      <Section title="Product Info">
        <Item label="Product Name" value={gift.productName} />
        <Item label="Product Price" value={`₹${gift.productPrice}`} />
      </Section>

      <Section title="Payment">
        <Item label="Status" value={gift.status} />
        <Item label="Payment" value={gift.payment ? 'Paid ✅' : 'Unpaid ❌'} />
        <Item label="Total Amount" value={`₹${gift.totalAmount}`} />
        <Item label="Remaining Amount" value={`₹${gift.remainingAmount}`} />
        <Item label="No. of Payments" value={gift.noOfPayments?.toString()} />
        <Item label="Payment Amount" value={`₹${gift.paymentAmount}`} />
        {/* If not fully paid show Pay button, otherwise show Give Feedback */}
        {Number(gift.paymentAmount || 0) < Number(gift.totalAmount || 0) ? (
          <TouchableOpacity
            onPress={() => setShowPayModal(true)}
            style={{ marginTop: 12, backgroundColor: '#ff6600', padding: 10, borderRadius: 8 }}
          >
            <Text style={{ color: '#fff', textAlign: 'center' }}>Pay Now</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={() => setShowFeedbackModal(true)}
            style={{ marginTop: 12, backgroundColor: 'green', padding: 10, borderRadius: 8 }}
          >
            <Text style={{ color: '#fff', textAlign: 'center' }}>Give Feedback</Text>
          </TouchableOpacity>
        )}
      </Section>

      <Section title="Links">
        <View style={styles.shareRow}>
          <View style={styles.linkCard}>
            <Text style={styles.linkLabel}>Sharable Link</Text>
            <Text numberOfLines={1} style={styles.linkText}>{gift.sharablelink || `https://wishandsurprise.com/giftdetails/${gift.id}`}</Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              const url = gift.sharablelink || `https://wishandsurprise.com/giftdetails/${gift.id}`;
              Share.share({ message: `🎁 Gift — ${gift.productName} — ${url}`, title: 'Wish & Surprise' }).catch(e => console.warn(e));
            }}
            style={styles.shareButtonSmall}
          >
            <Text style={styles.shareButtonText}>Share</Text>
          </TouchableOpacity>
        </View>
        {gift.paymentlink ? (
          <View style={[styles.shareRow, { marginTop: 10 }]}>
            <View style={styles.linkCard}>
              <Text style={styles.linkLabel}>Payment Link</Text>
              <Text numberOfLines={1} style={styles.linkText}>{gift.paymentlink}</Text>
            </View>
            <TouchableOpacity
              onPress={() => Share.share({ message: `Pay: ${gift.paymentlink}`, title: 'Payment Link' }).catch(e => console.warn(e))}
              style={styles.shareButtonSmall}
            >
              <Text style={styles.shareButtonText}>Share</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </Section>

      {/* Feedback display section */}
      <Section title="Feedback">
        {feedbackList.length === 0 ? (
          <Text>No feedback yet.</Text>
        ) : (
          feedbackList.map((fb, idx) => (
            <View key={`fb-${idx}`} style={{ marginBottom: 12, paddingTop: 8 }}>
              <Text style={{ fontWeight: '700' }}>{fb.name || 'Anonymous'} {fb.relationship ? `• ${fb.relationship}` : ''}</Text>
              {fb.photo ? (
                failedFeedbackImgs[idx] ? (
                  <View style={{ width: 120, height: 80, borderRadius: 8, marginTop: 6, backgroundColor: '#eee', justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ fontSize: 12, color: '#666' }}>Image failed to load</Text>
                  </View>
                ) : (
                  <Image
                    source={{ uri: resolvedFeedbackUris[idx] || normalizePhotoUri(fb.photo) }}
                    style={{ width: 120, height: 80, borderRadius: 8, marginTop: 6 }}
                    resizeMode="cover"
                    onError={(e) => {
                      console.warn('[GiftDetails] feedback image load error:', normalizePhotoUri(fb.photo), e.nativeEvent || e);
                      setFailedFeedbackImgs(prev => ({ ...prev, [idx]: true }));
                    }}
                  />
                )
              ) : null}
              <Text style={{ marginTop: 6 }}>{fb.message}</Text>
            </View>
          ))
        )}
      </Section>

      {/* Payment modal */}
      <Modal visible={showPayModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Enter Amount to Pay</Text>
            <TextInput
              keyboardType="numeric"
              placeholder={`Enter amount (max ₹${gift.remainingAmount})`}
              value={customAmount}
              onChangeText={setCustomAmount}
              style={styles.input}
            />
            <View style={styles.modalActionsRow}>
              <TouchableOpacity onPress={() => setShowPayModal(false)} style={[styles.modalButton, styles.modalButtonSecondary]}>
                <Text style={styles.modalButtonSecondaryText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={async () => {
                  // validate
                  const amt = customAmount === '' ? null : Number(customAmount);
                  if (amt !== null && (isNaN(amt) || amt <= 0)) return Alert.alert('Invalid amount', 'Please enter valid amount greater than 0');
                  if (amt !== null && amt > Number(gift.remainingAmount)) return Alert.alert('Invalid amount', `Amount should be <= ${gift.remainingAmount}`);
                  setShowPayModal(false);
                  // perform payment with selected amount or full remaining
                  await handlePay(amt === null ? Number(gift.remainingAmount) : amt);
                }}
                style={[styles.modalButton, styles.modalButtonPrimary]}
              >
                <Text style={styles.modalButtonPrimaryText}>Proceed to Pay</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
{/* Feedback modal (fixed: proper height, scrollable, actions pinned) */}
<Modal visible={showFeedbackModal} transparent animationType="fade">
  <View style={styles.modalOverlay}>
    <View style={[styles.modalCardLarge, { overflow: 'hidden' }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 24}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* This wrapper ensures top content and bottom actions are spaced properly */}
          <View style={{ flex: 1, justifyContent: 'space-between' }}>
            <View>
              <Text style={styles.modalTitle}>Share your Wishes</Text>
              <Text style={styles.modalSubTitle}>Write a quick message for the recipient</Text>

              <Text style={{ marginTop: 12, fontWeight: '600' }}>Name</Text>
              <TextInput
                value={feedbackName}
                onChangeText={setFeedbackName}
                style={[styles.input, { marginTop: 8 }]}
                placeholder="Your name"
              />

              <Text style={{ marginTop: 12, fontWeight: '600' }}>Relationship</Text>
              <View style={styles.relationRow}>
                {['Friend','Brother','Sister','Mother','Father','Son','Daughter','Husband','Wife','Partner','Cousin','Uncle','Aunt','Grandmother','Grandfather','Colleague','Neighbor','Boss','Other'].map((r) => (
                  <TouchableOpacity
                    key={`rel-${r}`}
                    onPress={() => setFeedbackRelationship(r === 'Other' ? 'Other' : r)}
                    style={[
                      styles.relationChip,
                      feedbackRelationship && feedbackRelationship.toLowerCase() === r.toLowerCase() ? styles.relationChipSelected : null,
                    ]}
                  >
                    <Text style={feedbackRelationship && feedbackRelationship.toLowerCase() === r.toLowerCase() ? styles.relationChipTextSelected : styles.relationChipText}>{r}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {feedbackRelationship === 'Other' && (
                <TextInput
                  value={feedbackRelationshipOther}
                  onChangeText={setFeedbackRelationshipOther}
                  style={[styles.input, { marginTop: 8 }]}
                  placeholder="Specify relation (e.g. cousin, neighbour)"
                />
              )}

              <Text style={{ marginTop: 12, fontWeight: '600' }}>Message</Text>
              <TextInput
                value={feedbackMessage}
                onChangeText={setFeedbackMessage}
                style={[styles.input, { marginTop: 8, height: 120, textAlignVertical: 'top' }]}
                placeholder="Write your wishes..."
                multiline
              />

              <Text style={{ marginTop: 10, fontWeight: '600', color: '#555' }}>Quick suggestions</Text>

              {showSuggestionHint ? (
                <View style={styles.hintRow}>
                  <Text style={styles.hintText}>Tip: Tap to insert • Long-press to append</Text>
                  <TouchableOpacity onPress={async () => { setShowSuggestionHint(false); await AsyncStorage.setItem('seenSuggestionHint','true'); }} style={styles.hintDismiss}>
                    <Text style={styles.hintDismissText}>Got it</Text>
                  </TouchableOpacity>
                </View>
              ) : null}

              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.suggestionsRow} contentContainerStyle={{ paddingRight: 8 }}>
                {(() => {
                  const visible = suggestionsExpanded ? quickSuggestions : quickSuggestions.slice(0, 3);
                  const nodes = visible.map((s, i) => (
                    <TouchableOpacity
                      key={`sug-${i}`}
                      onPress={() => setFeedbackMessage(s)}
                      onLongPress={() => setFeedbackMessage(prev => prev ? `${prev} ${s}` : s)}
                      style={styles.suggestionChip}
                    >
                      <Text style={styles.suggestionChipText} numberOfLines={2}>{s}</Text>
                    </TouchableOpacity>
                  ));

                  if (!suggestionsExpanded && quickSuggestions.length > 3) {
                    nodes.push(
                      <TouchableOpacity key="more-chip" onPress={() => setSuggestionsExpanded(true)} style={[styles.suggestionChip, styles.moreChip]}>
                        <Text style={[styles.suggestionChipText, { fontWeight: '700' }]}>More</Text>
                      </TouchableOpacity>
                    );
                  }

                  if (suggestionsExpanded && quickSuggestions.length > 3) {
                    nodes.push(
                      <TouchableOpacity key="less-chip" onPress={() => setSuggestionsExpanded(false)} style={[styles.suggestionChip, styles.moreChip]}>
                        <Text style={[styles.suggestionChipText, { fontWeight: '700' }]}>Less</Text>
                      </TouchableOpacity>
                    );
                  }

                  return nodes;
                })()}
              </ScrollView>

              <Text style={{ marginTop: 12, fontWeight: '600' }}>Photo (optional)</Text>
              <View style={{ flexDirection: 'row', alignItems:'center', marginTop: 8 }}>
                <TouchableOpacity onPress={() => {
                  ImagePicker.openPicker({ width: 400, height: 400, cropping: true }).then(img => {
                    setFeedbackImage(img);
                  }).catch(e=>console.warn('picker',e))
                }} style={styles.addPhotoButton}>
                  <Text>Add Photo</Text>
                </TouchableOpacity>
                {feedbackImage && <Image source={{ uri: normalizePhotoUri(feedbackImage) }} style={styles.previewImage} onError={(e) => console.warn('[GiftDetails] preview image load error:', normalizePhotoUri(feedbackImage), e.nativeEvent || e)} />}
              </View>
            </View>

            {/* action row - stays at bottom of modal */}
            <View style={[styles.modalActionsRow, { marginTop: 12 }]}>
              <TouchableOpacity onPress={async () => {
                if (!feedbackMessage.trim()) return Alert.alert('Empty', 'Please enter some feedback');
                try {
                  const userDataString = await AsyncStorage.getItem('userData');
                  const userData = userDataString ? JSON.parse(userDataString) : {};

                  let uploadedImageUrl = '';
                  if (feedbackImage) {
                    const fd = new FormData();
                    let localUri = feedbackImage.path || feedbackImage.uri || '';
                    if (localUri && !localUri.startsWith('file://') && !localUri.startsWith('http')) {
                      localUri = `file://${localUri}`;
                    }
                    fd.append('file', { uri: localUri, name: 'photo.jpg', type: feedbackImage.mime || 'image/jpeg' });
                    fd.append('giftId', gift.id);
                    const up = await fetch('https://wishandsurprise.com/backend/upload-feedback-image.php', { method: 'POST', body: fd });
                    const upJson = await up.json();
                    if (upJson && upJson.success) {
                      if (upJson.url) uploadedImageUrl = upJson.url;
                      else if (Array.isArray(upJson.alt_urls) && upJson.alt_urls.length > 0) uploadedImageUrl = upJson.alt_urls[0];
                    }
                  }

                  const relationshipToSave = feedbackRelationship === 'Other' ? (feedbackRelationshipOther || '') : feedbackRelationship || '';
                  const feedbackObject = {
                    userId: userData?.id,
                    message: feedbackMessage,
                    name: feedbackName || '',
                    relationship: relationshipToSave,
                    photo: uploadedImageUrl || ''
                  };

                  let prevList = [];
                  try { prevList = gift.feedback ? JSON.parse(gift.feedback) : []; } catch(e) { prevList = []; }
                  const newList = [...prevList, feedbackObject];

                  const res = await fetch(`https://wishandsurprise.com/backend/update-gift.php?id=${gift.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ feedback: newList })
                  });
                  const result = await res.json();
                  if (result?.success || result?.gift) {
                    Alert.alert('Thanks', 'Feedback submitted successfully');
                    setShowFeedbackModal(false);
                    setFeedbackMessage(''); setFeedbackName(''); setFeedbackRelationship(''); setFeedbackRelationshipOther(''); setFeedbackImage(null);
                    setGift(prev => ({ ...prev, feedback: JSON.stringify(newList) }));
                  } else {
                    Alert.alert('Error', result?.error || 'Failed to submit feedback');
                  }
                } catch (err) {
                  console.error('Feedback error', err);
                  Alert.alert('Error', 'Failed to submit feedback');
                }
              }} style={[styles.modalButton, styles.modalButtonPrimary]}>
                <Text style={styles.modalButtonPrimaryText}>Submit</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => { setShowFeedbackModal(false); setFeedbackImage(null); }} style={[styles.modalButton, styles.modalButtonSecondary]}>
                <Text style={styles.modalButtonSecondaryText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  </View>
</Modal>


    </ScrollView>
  );
};

const Section = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

const Item = ({ label, value }) => (
  <View style={styles.itemRow}>
    <Text style={styles.label}>{label}:</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#FAFAFA',
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
    color: '#333',
  },
  section: {
    marginBottom: 20,
    padding: 12,
    backgroundColor: '#FFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#555',
  },
  itemRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    fontWeight: '500',
    width: 140,
    color: '#444',
  },
  value: {
    flex: 1,
    color: '#111',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Modal overlay & card styles for professional popups
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.14,
    shadowRadius: 12,
    elevation: 8,
  },
  modalCardLarge: {
  width: '100%',
  maxWidth: 460,
  backgroundColor: '#fff',
  borderRadius: 12,
  shadowColor: '#000',
  shadowOpacity: 0.14,
  shadowRadius: 12,
  elevation: 8,
  // important to ensure modal is visible and doesn't collapse
  minHeight: 420,       // <-- ensures visible initial height
  maxHeight: '85%',     // <-- prevents overflow on small screens
},
modalActionsRow: {
  flexDirection: 'row',
  marginTop: 14,
  gap: 8,
  // ensure action row stretches full width inside modal
  alignItems: 'center',
},


  modalTitle: {
    fontWeight: '700',
    fontSize: 18,
    marginBottom: 8,
    color: '#222',
  },
  modalSubTitle: {
    color: '#666',
    marginBottom: 8,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#e6e6e6',
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  addPhotoButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#e6e6e6',
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  previewImage: {
    width: 56,
    height: 56,
    borderRadius: 8,
  },
  modalActionsRow: {
    flexDirection: 'row',
    marginTop: 14,
    gap: 8,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonPrimary: {
    backgroundColor: '#ff6600',
  },
  modalButtonPrimaryText: {
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
  },
  modalButtonSecondary: {
    backgroundColor: '#f3f3f3',
  },
  modalButtonSecondaryText: {
    color: '#333',
    fontWeight: '600',
    textAlign: 'center',
  },
  shareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
  },
  linkCard: {
    flex: 1,
    backgroundColor: '#f8f9fb',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eef2f6',
  },
  linkLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  linkText: {
    color: '#0b5fff',
    fontSize: 13,
  },
  shareButtonSmall: {
    backgroundColor: '#ff6600',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  // suggestion chip styles
  suggestionsRow: {
    marginTop: 8,
    flexDirection: 'row',
    paddingVertical: 6,
  },
  suggestionChip: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#eee',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
    maxWidth: 220,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  suggestionChipText: {
    color: '#333',
    fontSize: 13,
    lineHeight: 18,
  },
  relationRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 8,
  },
  relationChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e6e6e6',
    backgroundColor: '#fff',
  },
  relationChipSelected: {
    backgroundColor: '#ffedd8',
    borderColor: '#ffb780',
  },
  relationChipText: {
    color: '#333',
    fontWeight: '600',
  },
  relationChipTextSelected: {
    color: '#b84a00',
    fontWeight: '700',
  },
  hintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff7e9',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ffeecc',
    marginTop: 8,
    marginBottom: 6,
  },
  hintText: {
    color: '#6b4a12',
    flex: 1,
    fontSize: 12,
  },
  hintDismiss: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#f4a261',
  },
  hintDismissText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
  moreChip: {
    backgroundColor: '#fffbe6',
    borderColor: '#ffe3a8',
  },
});

// export const  GiftDetailsScreen;
export default withSplashScreen(GiftDetailsScreen);
