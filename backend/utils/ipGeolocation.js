/**
 * utils/ipGeolocation.js — IP geolocation helper
 *
 * Converts an IP to { city, regionName, country, area } using ip-api.com.
 * No API key required (rate limited on the free tier).
 */

const GEO_CACHE_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24h

// Simple in-memory cache to reduce external calls.
// Key: normalized IP, Value: { value, expiresAt }
const cache = new Map();

const normalizeIp = (ip = '') => {
  if (!ip) return '';
  // Express may return IPv4-mapped IPv6 format: ::ffff:1.2.3.4
  const trimmed = String(ip).trim();
  if (trimmed.startsWith('::ffff:')) return trimmed.slice(7);
  return trimmed;
};

const isLocalOrUnknownIp = (ip) => {
  if (!ip) return true;
  if (ip === 'Unknown') return true;
  if (ip === '127.0.0.1' || ip === '::1') return true;
  // Add other private ranges if you want later.
  return false;
};

const buildArea = ({ city, regionName }) => {
  const parts = [];
  if (city) parts.push(city);
  if (regionName) parts.push(regionName);
  return parts.join(', ');
};

const getIpGeolocation = async (rawIp) => {
  const ip = normalizeIp(rawIp);
  if (isLocalOrUnknownIp(ip)) return null;

  const now = Date.now();
  const cached = cache.get(ip);
  if (cached && cached.expiresAt > now) return cached.value;

  // ip-api free endpoint (no key required)
  // Example: https://ip-api.com/json/8.8.8.8?fields=status,message,country,regionName,city
  const url =
    `https://ip-api.com/json/${encodeURIComponent(ip)}` +
    `?fields=status,message,country,regionName,city`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 2500);

  try {
    const resp = await fetch(url, { signal: controller.signal });
    const data = await resp.json();

    if (!data || data.status !== 'success') return null;

    const value = {
      city: data.city || '',
      regionName: data.regionName || '',
      country: data.country || '',
      area: buildArea({ city: data.city || '', regionName: data.regionName || '' }) || '',
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
  getIpGeolocation,
  normalizeIp,
};

