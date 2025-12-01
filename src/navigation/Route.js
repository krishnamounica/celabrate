import React, { useEffect } from 'react';
import { Linking } from 'react-native';

// export a navigationRef which your root NavigationContainer should use
export const navigationRef = React.createRef();

/**
 * Helper: parse url and navigate using navigationRef
 */
export // robust URL parser (do NOT rely on `new URL()` in React Native)
function parseUrlString(url) {
  if (!url || typeof url !== 'string') return { path: '', query: {} };

  // Remove leading scheme and host, leaving the path+query.
  // Examples transformed:
  //  - https://domain.com/giftdetails/62?foo=bar  -> /giftdetails/62?foo=bar
  //  - myapp://giftdetails/62                     -> /giftdetails/62
  let pathAndQuery = url;

  // Remove scheme and host: match "<scheme>://<host><path...>"
  const m = url.match(/^[a-zA-Z][a-zA-Z0-9+\-.]*:\/\/[^/]+(\/.*)$/);
  if (m && m[1]) pathAndQuery = m[1];

  // If nothing matched, maybe url is already path-like ("/giftdetails/62" or "giftdetails/62")
  if (!pathAndQuery.startsWith('/')) {
    pathAndQuery = '/' + pathAndQuery;
  }

  // Split path from query
  const [pathPartRaw, queryRaw] = pathAndQuery.split('?');
  const pathPart = pathPartRaw || '/';

  // Normalise segments (lowercase for matching)
  const segments = pathPart.split('/').filter(Boolean).map(s => s.toLowerCase());

  // parse simple querystring into object
  const query = {};
  if (queryRaw) {
    queryRaw.split('&').forEach(pair => {
      const [k, v] = pair.split('=');
      if (!k) return;
      try {
        query[decodeURIComponent(k)] = decodeURIComponent(v || '');
      } catch (_) {
        query[k] = v || '';
      }
    });
  }

  return { path: pathPart, segments, query };
}

export function parseAndNavigate(url) {
  if (!url || !navigationRef.current) return;
  try {
    console.log('[Route] handling url ->', url);
    const { path, segments, query } = parseUrlString(url);

    // Strategy:
    // 1) prefer path segments form: /giftdetails/62
    // 2) if not available, fall back to query param id: ?id=62

    // find giftdetails segment
    const idx = segments.findIndex(p => p.includes('giftdetails'));
    if (idx >= 0 && segments.length > idx + 1) {
      const id = segments[idx + 1];
      console.log('[Route] navigating to GiftDetails with id (from path)', id);
      navigationRef.current.navigate('GiftDetails', { id });
      return;
    }

    // fallback: if path contains giftdetails but no next segment, check query param 'id'
    if (path.toLowerCase().includes('giftdetails') && query && query.id) {
      console.log('[Route] navigating to GiftDetails with id (from query)', query.id);
      navigationRef.current.navigate('GiftDetails', { id: query.id });
      return;
    }

    // No mapping matched — optionally log for debugging
    console.log('[Route] parseAndNavigate: no route matched for url', url);
  } catch (e) {
    console.warn('[Route] parseAndNavigate error', e);
  }
}

/**
 * Small component that only attaches Linking listeners and handles initial URL.
 * DOES NOT render a NavigationContainer (to avoid nested containers).
 */
export const DeepLinkHandler = () => {
  useEffect(() => {
    (async () => {
      try {
        const initialUrl = await Linking.getInitialURL();
        if (initialUrl) {
          console.log('[Route] initial URL ->', initialUrl);
          setTimeout(() => parseAndNavigate(initialUrl), 400);
        }
      } catch (e) {
        console.warn('[Route] error getting initial URL', e);
      }
    })();

    const onUrl = ({ url }) => {
      console.log('[Route] Linking url event ->', url);
      parseAndNavigate(url);
    };

    const sub = Linking.addEventListener ? Linking.addEventListener('url', onUrl) : Linking.addListener('url', onUrl);
    return () => {
      try {
        if (sub && sub.remove) sub.remove();
        else Linking.removeEventListener('url', onUrl);
      } catch (e) {}
    };
  }, []);

  return null;
};

export default null;
