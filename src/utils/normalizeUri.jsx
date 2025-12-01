// normalizeUri(url)
// - ensure http://wishandsurprise.com -> https://wishandsurprise.com
// - convert relative paths ('/uploads/...') to https://wishandsurprise.com/...
// - leave file:// and other https/http URLs (other domains) as-is
export default function normalizeUri(uri) {
  if (!uri) return null;

  // If object with path or uri (image picker), handle those
  if (typeof uri === 'object') {
    if (uri.path) {
      const p = String(uri.path);
      return p.startsWith('file://') ? p : `file://${p}`;
    }
    if (uri.uri) {
      const u = String(uri.uri);
      if (u.startsWith('http://') && u.includes('wishandsurprise.com')) return u.replace(/^http:\/\//i, 'https://');
      return u.startsWith('file://') ? u : u;
    }
    return null;
  }

  const u = String(uri).trim();

  // http on our domain -> https
  if (u.startsWith('http://') && u.includes('wishandsurprise.com')) {
    return u.replace(/^http:\/\//i, 'https://');
  }

  // already absolute (http/https/file)
  if (u.startsWith('https://') || u.startsWith('http://') || u.startsWith('file://')) {
    return u;
  }

  // Relative path starting with slash
  if (u.startsWith('/')) return `https://wishandsurprise.com${u}`;

  // relative without slash -> treat as path on site
  return `https://wishandsurprise.com/${u}`;
}
