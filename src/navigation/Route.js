import React, { useEffect } from 'react';
import { Linking } from 'react-native';

// export a navigationRef which your root NavigationContainer should use
export const navigationRef = React.createRef();

/**
 * Robust URL parser for React Native
 */
export function parseUrlString(url) {
  if (!url || typeof url !== 'string') return { path: '', segments: [], query: {} };

  let pathAndQuery = url;

  // 1) Strip "<scheme>://" only, KEEP host and path.
  // Examples:
  //  - wishandsurprise://giftdetails/62       -> "giftdetails/62"
  //  - https://wishandsurprise.com/giftdetails/62?foo=bar
  //        -> "wishandsurprise.com/giftdetails/62?foo=bar"
  const schemeMatch = url.match(/^([a-zA-Z][a-zA-Z0-9+\-.]*):\/\//);
  if (schemeMatch) {
    pathAndQuery = url.slice(schemeMatch[0].length);
  }

  // Ensure it starts with "/" for consistency
  if (!pathAndQuery.startsWith('/')) {
    pathAndQuery = '/' + pathAndQuery;
  }

  // 2) Split path from query
  const [pathPartRaw, queryRaw] = pathAndQuery.split('?');
  const pathPart = pathPartRaw || '/';

  // 3) Normalise segments (lowercase for matching)
  const segments = pathPart
    .split('/')
    .filter(Boolean)
    .map((s) => s.toLowerCase());

  // 4) Parse simple query string into object
  const query = {};
  if (queryRaw) {
    queryRaw.split('&').forEach((pair) => {
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

    // Example segments:
    //  - wishandsurprise://giftdetails/62
    //       -> ['giftdetails', '62']
    //  - https://wishandsurprise.com/giftdetails/62
    //       -> ['wishandsurprise.com', 'giftdetails', '62']

    const idx = segments.findIndex((p) => p.includes('giftdetails'));
    if (idx >= 0) {
      const id = segments[idx + 1]; // next segment after "giftdetails"
      if (id) {
        console.log('[Route] navigating to GiftDetails with id (from path)', id);
        navigationRef.current.navigate('GiftDetails', { id });
        return;
      }
    }

    // fallback: if path contains giftdetails but no next segment, check query param 'id'
    if (path.toLowerCase().includes('giftdetails') && query && query.id) {
      console.log('[Route] navigating to GiftDetails with id (from query)', query.id);
      navigationRef.current.navigate('GiftDetails', { id: query.id });
      return;
    }

    console.log('[Route] parseAndNavigate: no route matched for url', url);
  } catch (e) {
    console.warn('[Route] parseAndNavigate error', e);
  }
}

/**
 * Component that attaches Linking listeners and handles initial URL.
 * Render this ONCE inside your app (e.g. next to NavigationContainer).
 */
export const DeepLinkHandler = () => {
  useEffect(() => {
    (async () => {
      try {
        const initialUrl = await Linking.getInitialURL();
        if (initialUrl) {
          console.log('[Route] initial URL ->', initialUrl);
          // small delay so navigationRef is ready
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

    const sub = Linking.addEventListener
      ? Linking.addEventListener('url', onUrl)
      : Linking.addListener('url', onUrl);

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
