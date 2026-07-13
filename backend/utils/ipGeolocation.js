/**
 * utils/ipGeolocation.js — Client IP + city/area lookup
 *
 * Behind Render/proxies, req.ip is often a private 10.x address.
 * We extract the first public IP from X-Forwarded-For, then look up
 * city/region via ip-api.com (no API key; free-tier rate limits apply).
 */

const GEO_CACHE_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24h
const cache = new Map();

const normalizeIp = (ip = '') => {
  if (!ip) return '';
  let trimmed = String(ip).trim().replace(/^\[|\]$/g, '');
  if (trimmed.startsWith('::ffff:')) trimmed = trimmed.slice(7);
  return trimmed;
};

const isPrivateOrLocalIp = (ip) => {
  const value = normalizeIp(ip);
  if (!value || value === 'Unknown') return true;
  if (value === '127.0.0.1' || value === '::1') return true;
  if (value.startsWith('10.')) return true;
  if (value.startsWith('192.168.')) return true;
  if (value.startsWith('169.254.')) return true;
  // 172.16.0.0 – 172.31.255.255
  const m = value.match(/^172\.(\d+)\./);
  if (m) {
    const second = parseInt(m[1], 10);
    if (second >= 16 && second <= 31) return true;
  }
  return false;
};

/**
 * Best-effort public client IP (works on Render / reverse proxies).
 */
const getClientIp = (req) => {
  const candidates = [];

  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length) {
    forwarded.split(',').forEach((part) => candidates.push(part.trim()));
  } else if (Array.isArray(forwarded)) {
    forwarded.forEach((part) => candidates.push(String(part).trim()));
  }

  if (req.headers['x-real-ip']) candidates.push(String(req.headers['x-real-ip']));
  if (req.headers['cf-connecting-ip']) candidates.push(String(req.headers['cf-connecting-ip']));
  if (req.ip) candidates.push(String(req.ip));
  if (req.socket?.remoteAddress) candidates.push(String(req.socket.remoteAddress));

  const normalized = candidates.map(normalizeIp).filter(Boolean);

  // Prefer first public IP in the chain (original client)
  const publicIp = normalized.find((ip) => !isPrivateOrLocalIp(ip));
  if (publicIp) return publicIp;

  // Fall back to whatever we have (may stay Unknown for geo)
  return normalized[0] || 'Unknown';
};

const buildArea = ({ city, regionName, country }) => {
  const parts = [];
  if (city) parts.push(city);
  if (regionName) parts.push(regionName);
  if (country) parts.push(country);
  return parts.join(', ');
};

const getIpGeolocation = async (rawIp) => {
  const ip = normalizeIp(rawIp);
  if (isPrivateOrLocalIp(ip)) return null;

  const now = Date.now();
  const cached = cache.get(ip);
  if (cached && cached.expiresAt > now) return cached.value;

  const url =
    `https://ip-api.com/json/${encodeURIComponent(ip)}` +
    `?fields=status,message,country,regionName,city`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3500);

  try {
    const resp = await fetch(url, { signal: controller.signal });
    const data = await resp.json();

    if (!data || data.status !== 'success') return null;

    const value = {
      city: data.city || '',
      regionName: data.regionName || '',
      country: data.country || '',
      area:
        buildArea({
          city: data.city || '',
          regionName: data.regionName || '',
          country: data.country || '',
        }) || '',
    };

    cache.set(ip, { value, expiresAt: now + GEO_CACHE_MAX_AGE_MS });
    return value;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
};

module.exports = {
  getClientIp,
  getIpGeolocation,
  normalizeIp,
  isPrivateOrLocalIp,
};
