const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

const rateLimitStore = new Map();

const jsonResponse = (body, status = 200, extraHeaders = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      ...CORS_HEADERS,
      'Content-Type': 'application/json; charset=utf-8',
      ...extraHeaders
    }
  });

const normalizePath = (path) => {
  if (!path || !path.startsWith('/')) {
    return null;
  }

  return path;
};

const checkRateLimit = (key, maxRequests, windowMs) => {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || now - record.startedAt > windowMs) {
    rateLimitStore.set(key, { count: 1, startedAt: now });
    return { limited: false };
  }

  record.count += 1;
  rateLimitStore.set(key, record);

  if (record.count > maxRequests) {
    const retryAfterSec = Math.ceil((windowMs - (now - record.startedAt)) / 1000);
    return { limited: true, retryAfterSec };
  }

  return { limited: false };
};

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    const url = new URL(request.url);
    const path = url.searchParams.get('path');
    const maxRequests = Number(env.RATE_LIMIT_MAX ?? 120);
    const windowMs = Number(env.RATE_LIMIT_WINDOW_MS ?? 60000);

    const clientIp = request.headers.get('CF-Connecting-IP') ?? 'unknown';
    const limit = checkRateLimit(clientIp, maxRequests, windowMs);

    if (limit.limited) {
      return jsonResponse(
        { message: 'Too many requests', retryAfterSec: limit.retryAfterSec },
        429,
        { 'Retry-After': String(limit.retryAfterSec) }
      );
    }

    if (!path) {
      return jsonResponse({ message: 'Missing path query parameter' }, 400);
    }

    if (!env.ITS_BASE_URL) {
      return jsonResponse({ message: 'Missing ITS_BASE_URL environment variable' }, 500);
    }

    const normalizedPath = normalizePath(path);

    if (!normalizedPath) {
      return jsonResponse({ message: 'path must start with /' }, 400);
    }

    const target = new URL(normalizedPath, env.ITS_BASE_URL);

    if (env.ITS_API_KEY) {
      target.searchParams.set('key', env.ITS_API_KEY);
    }

    const response = await fetch(target.toString(), {
      headers: {
        Accept: 'application/json'
      }
    });
    const body = await response.text();

    return new Response(body, {
      status: response.status,
      headers: {
        ...CORS_HEADERS,
        'Content-Type': response.headers.get('content-type') ?? 'application/json; charset=utf-8'
      }
    });
  }
};
