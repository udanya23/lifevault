/**
 * utils/ipGeolocation.js — Client IP + city/area lookup
 *
 * Behind Render/proxies, req.ip is often a private 10.x address.
 * We extract the first public IP from X-Forwarded-For, then look up
 * city/region via HTTPS providers.
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
  return publicIp || normalized[0] || 'Unknown';
};

const buildArea = ({ city, country }) => {
  return [city, country].filter(Boolean).join(', ');
};

const fetchJson = async (url, timeoutMs = 4000) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const resp = await fetch(url, { signal: controller.signal, headers: { Accept: 'application/json' } });
    if (!resp.ok) return null;
    return await resp.json();
  } catch { return null; } finally { clearTimeout(timeout); }
};

/**
 * ISO 3166-1 alpha-2 -> full country name (common countries).
 * Used when a provider returns only a 2-letter code.
 */
const ISO_COUNTRY_NAMES = {
  IN: 'India', US: 'United States', GB: 'United Kingdom', AU: 'Australia',
  CA: 'Canada', DE: 'Germany', FR: 'France', JP: 'Japan', CN: 'China',
  BR: 'Brazil', SG: 'Singapore', AE: 'United Arab Emirates', PK: 'Pakistan',
  BD: 'Bangladesh', NP: 'Nepal', LK: 'Sri Lanka', MY: 'Malaysia',
  ID: 'Indonesia', TH: 'Thailand', PH: 'Philippines', NZ: 'New Zealand',
  ZA: 'South Africa', NG: 'Nigeria', KE: 'Kenya', EG: 'Egypt',
  RU: 'Russia', MX: 'Mexico', AR: 'Argentina', IT: 'Italy', ES: 'Spain',
  NL: 'Netherlands', SE: 'Sweden', NO: 'Norway', FI: 'Finland', CH: 'Switzerland',
  SA: 'Saudi Arabia', IR: 'Iran', IQ: 'Iraq', TR: 'Turkey', UA: 'Ukraine',
  PL: 'Poland', CZ: 'Czech Republic', HU: 'Hungary', RO: 'Romania', GR: 'Greece',
  PT: 'Portugal', DK: 'Denmark', BE: 'Belgium', AT: 'Austria', HK: 'Hong Kong',
  TW: 'Taiwan', KR: 'South Korea', VN: 'Vietnam',
};

const resolveCountry = (code) => {
  if (!code) return '';
  if (code.length > 2) return code; // already a full name
  return ISO_COUNTRY_NAMES[code.toUpperCase()] || code;
};

/**
 * Provider 1: ipinfo.io — Most accurate for Indian ISP IPs
 * Returns city (accurate) and country code (resolved to full name).
 */
const lookupIpInfo = async (ip) => {
  const token = process.env.IPINFO_TOKEN ? `?token=${process.env.IPINFO_TOKEN}` : '';
  const data = await fetchJson(`https://ipinfo.io/${encodeURIComponent(ip)}/json${token}`);
  if (!data || data.bogon || !data.city) return null;
  return { city: data.city, country: resolveCountry(data.country) };
};

const lookupFreeIpApi = async (ip) => {
  const data = await fetchJson(`https://freeipapi.com/api/json/${encodeURIComponent(ip)}`);
  if (!data || !data.cityName) return null;
  return { city: data.cityName, country: data.countryName };
};

const lookupIpApiCom = async (ip) => {
  const data = await fetchJson(`http://ip-api.com/json/${encodeURIComponent(ip)}`);
  if (!data || data.status !== 'success') return null;
  return { city: data.city, country: data.country };
};

const lookupIpWhoIs = async (ip) => {
  const data = await fetchJson(`https://ipwho.is/${encodeURIComponent(ip)}`);
  if (!data || !data.success) return null;
  return { city: data.city, country: data.country };
};

const getIpGeolocation = async (rawIp) => {
  const ip = normalizeIp(rawIp);
  if (isPrivateOrLocalIp(ip)) return null;

  const now = Date.now();
  const cached = cache.get(ip);
  if (cached && cached.expiresAt > now) return cached.value;

  const providers = [lookupIpInfo, lookupFreeIpApi, lookupIpApiCom, lookupIpWhoIs];
  let geo = null;

  for (const provider of providers) {
    geo = await provider(ip);
    if (geo?.city) break;
  }

  if (!geo) return null;

  const value = {
    city: geo.city || '',
    country: geo.country || '',
    area: buildArea(geo) || '',
  };

  cache.set(ip, { value, expiresAt: now + GEO_CACHE_MAX_AGE_MS });
  return value;
};

module.exports = {
  getClientIp,
  getIpGeolocation,
  normalizeIp,
  isPrivateOrLocalIp,
};
