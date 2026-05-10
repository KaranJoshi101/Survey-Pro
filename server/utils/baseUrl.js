function ensureHttps(url) {
  if (!url || typeof url !== 'string') return url;
  const trimmed = url.trim().replace(/\/+$/, '');
  if (/^https?:\/\//i.test(trimmed)) {
    // If http in production, convert to https
    if (process.env.NODE_ENV === 'production' && trimmed.startsWith('http:')) {
      return trimmed.replace(/^http:/i, 'https:');
    }
    return trimmed;
  }
  return `https://${trimmed}`;
}

function getSiteUrl() {
  const envSite = (process.env.SITE_URL || process.env.CLIENT_URL || '').trim();
  if (process.env.NODE_ENV === 'production') {
    if (!envSite) {
      throw new Error('SITE_URL (or CLIENT_URL) must be set in production and must use HTTPS');
    }
    const normalized = ensureHttps(envSite);
    if (!normalized.startsWith('https://')) {
      throw new Error('SITE_URL must use HTTPS in production');
    }
    if (normalized.includes('localhost')) {
      throw new Error('SITE_URL must not reference localhost in production');
    }
    return normalized.replace(/\/+$/, '');
  }

  // Non-production: prefer SITE_URL, then CLIENT_URL, then fallback to the backend origin.
  if (envSite) {
    return envSite.replace(/\/+$/, '');
  }

  const serverPort = process.env.SERVER_PORT || '5000';
  return `http://localhost:${serverPort}`;
}

const SITE_URL = getSiteUrl();

function buildUrl(p) {
  if (!p) return SITE_URL;
  const suffix = String(p).startsWith('/') ? String(p) : `/${String(p)}`;
  return `${SITE_URL.replace(/\/+$/, '')}${suffix}`;
}

module.exports = {
  SITE_URL,
  getSiteUrl,
  buildUrl,
  ensureHttps,
};
