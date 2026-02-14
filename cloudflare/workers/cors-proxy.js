const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    const url = new URL(request.url);
    const path = url.searchParams.get('path');

    if (!path) {
      return new Response(JSON.stringify({ message: 'Missing path query parameter' }), {
        status: 400,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    }

    const target = new URL(path, env.ITS_BASE_URL);

    if (env.ITS_API_KEY) {
      target.searchParams.set('key', env.ITS_API_KEY);
    }

    const response = await fetch(target.toString());
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
