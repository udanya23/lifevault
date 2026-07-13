/**
 * utils/ipGeolocation.js — Client IP + city/area lookup
 *
 * Behind Render/proxies, req.ip is often a private 10.x address.
 * We extract the first public IP from X-Forwarded-For, then look up
 * city/region via HTTPS providers (ip-api free tier is HTTP-only and
 * often blocked on Render).
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
  const publicIp = normalized.find((ip) => !isPrivateOrLocalIp(ip));
  if (publicIp) return publicIp;
  return normalized[0] || 'Unknown';
};

const buildArea = ({ city, regionName, country }) => {
  const parts = [];
  if (city) parts.push(city);
  if (regionName) parts.push(regionName);
  if (country) parts.push(country);
  return parts.join(', ');
};

const fetchJson = async (url, timeoutMs = 4000) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const resp = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    if (!resp.ok) return null;
    return await resp.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
};

/** Provider 1: ipwho.is (HTTPS, free, no key) */
const lookupIpWhoIs = async (ip) => {
  const data = await fetchJson(`https://ipwho.is/${encodeURIComponent(ip)}`);
  if (!data || data.success === false) return null;
  return {
    city: data.city || '',
    regionName: data.region || data.region_code || '',
    country: data.country || '',
  };
};

/** Provider 2: geojs.io (HTTPS, free, no key) */
const lookupGeoJs = async (ip) => {
  const data = await fetchJson(
    `https://get.geojs.io/v1/ip/geo/${encodeURIComponent(ip)}.json`
  );
  if (!data || data.error) return null;
  return {
    city: data.city || '',
    regionName: data.region || '',
    country: data.country || '',
  };
};

/** Provider 3: ipapi.co (HTTPS, free with rate limits) */
const lookupIpApiCo = async (ip) => {
  const data = await fetchJson(`https://ipapi.co/${encodeURIComponent(ip)}/json/`);
  if (!data || data.error) return null;
  return {
    city: data.city || '',
    regionName: data.region || '',
    country: data.country_name || data.country || '',
  };
};

const getIpGeolocation = async (rawIp) => {
  const ip = normalizeIp(rawIp);
  if (isPrivateOrLocalIp(ip)) return null;

  const now = Date.now();
  const cached = cache.get(ip);
  if (cached && cached.expiresAt > now) return cached.value;

  const providers = [lookupIpWhoIs, lookupGeoJs, lookupIpApiCo];
  let geo = null;

  for (const provider of providers) {
    try {
      geo = await provider(ip);
      if (geo && (geo.city || geo.regionName || geo.country)) break;
    } catch {
      // try next provider
    }
  }

  if (!geo) return null;

  const value = {
    city: geo.city || '',
    regionName: geo.regionName || '',
    country: geo.country || '',
    area: buildArea(geo) || '',
  };

  if (!value.area) return null;

  cache.set(ip, { value, expiresAt: now + GEO_CACHE_MAX_AGE_MS });
  return value;
};

module.exports = {
  getClientIp,
  getIpGeolocation,
  normalizeIp,
  isPrivateOrLocalIp,
};
