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
VITE_PROXY_BASE_URL=https://your-worker.your-subdomain.workers.dev
```

## 아키텍처 요약

- 프론트엔드: React + Vite
- 지도: Kakao Maps JavaScript SDK
- 비디오: HLS.js + YouTube iframe
- 프록시: Cloudflare Worker (CORS/HTTPS 우회)
- 배포: GitHub Pages + GitHub Actions
