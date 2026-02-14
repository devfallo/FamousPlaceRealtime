const ITS_DEFAULT_PATH = '/api/its/info';

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const classifySource = (item) => {
  const roadType = String(item.roadType ?? item.roadtype ?? '').toLowerCase();
  if (roadType.includes('highway') || roadType.includes('고속')) {
    return 'highway';
  }

  const routeNo = String(item.routeNo ?? item.routeNum ?? item.routecode ?? '');
  if (/^\d+$/.test(routeNo) && Number(routeNo) < 100) {
    return 'national';
  }

  return 'highway';
};

const findArrayPayload = (payload) => {
  if (!payload || typeof payload !== 'object') {
    return [];
  }

  if (Array.isArray(payload)) {
    return payload;
  }

  const candidates = ['items', 'data', 'list', 'result', 'response', 'body'];

  for (const key of candidates) {
    if (key in payload) {
      const found = findArrayPayload(payload[key]);
      if (found.length) {
        return found;
      }
    }
  }

  for (const value of Object.values(payload)) {
    const found = findArrayPayload(value);
    if (found.length) {
      return found;
    }
  }

  return [];
};

export async function fetchItsCctvList() {
  const proxyBaseUrl = import.meta.env.VITE_PROXY_BASE_URL;

  if (!proxyBaseUrl) {
    return [];
  }

  const requestedPath = import.meta.env.VITE_ITS_CCTV_PATH ?? ITS_DEFAULT_PATH;
  const endpoint = new URL(proxyBaseUrl);
  endpoint.searchParams.set('path', requestedPath);

  const response = await fetch(endpoint.toString());

  if (!response.ok) {
    throw new Error(`ITS API request failed with status ${response.status}`);
  }

  const payload = await response.json();
  const items = findArrayPayload(payload);

  return items
    .map((item, index) => {
      const lat = toNumber(item.coordY ?? item.coordy ?? item.y);
      const lng = toNumber(item.coordX ?? item.coordx ?? item.x);
      const streamUrl = item.cctvurl ?? item.streamUrl ?? item.url;

      if (!lat || !lng || !streamUrl) {
        return null;
      }

      return {
        id: String(item.cctvId ?? item.cctvid ?? `its-${index}`),
        name: String(item.cctvname ?? item.cctvName ?? item.name ?? `ITS CCTV ${index + 1}`),
        lat,
        lng,
        source: classifySource(item),
        streamType: 'hls',
        streamUrl
      };
    })
    .filter(Boolean);
}
