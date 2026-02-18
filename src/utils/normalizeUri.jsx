export default function normalizeUri(u) {
  if (!u) return '';
  let out = String(u).trim();
  out = out.replace('wishandsurprise.combackend', 'wishandsurprise.com/backend');
  if (!/^https?:\/\//i.test(out)) {
    out = 'https://' + out.replace(/^\/+/, '');
  }
  return out;
}
