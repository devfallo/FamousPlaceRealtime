# FamousPlaceRealtime

전국 단위 공개 CCTV를 한눈에 볼 수 있도록 설계한 GitHub Pages 기반 웹 애플리케이션입니다.

## 빠른 시작

```bash
npm install
npm run dev
```

## 환경 변수

`.env` 파일에 카카오 맵 키를 추가하세요.

```bash
VITE_KAKAO_MAP_KEY=YOUR_KAKAO_JAVASCRIPT_KEY
VITE_PROXY_BASE_URL=https://your-worker.your-subdomain.workers.dev/api/its
VITE_ITS_CCTV_PATH=/api/cctv/list
```

Cloudflare Worker에는 아래 시크릿/환경 변수를 설정하세요.

```bash
ITS_BASE_URL=https://openapi.its.go.kr
ITS_API_KEY=YOUR_SERVER_SIDE_API_KEY
RATE_LIMIT_MAX=120
RATE_LIMIT_WINDOW_MS=60000
```

## 아키텍처 요약

- 프론트엔드: React + Vite
- 지도: Kakao Maps JavaScript SDK
- 비디오: HLS.js + YouTube iframe
- 프록시: Cloudflare Worker (CORS/HTTPS 우회)
- 배포: GitHub Pages + GitHub Actions


> `VITE_PROXY_BASE_URL` 또는 ITS 키가 없으면 앱은 자동으로 샘플 CCTV 데이터를 표시합니다.
