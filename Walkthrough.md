# CCTV 통합 플랫폼 구현 Walkthrough

## 요청 사항 반영 요약
- 공공 원천 API 중심(ITS, data.go.kr) 연동 전략 채택
- GitHub Pages 정적 호스팅의 CORS/HTTPS 제약을 Cloudflare Worker 프록시로 대응
- HLS 스트림 재생을 위한 `hls.js` 기반 플레이어 구성
- Phase 기반 구현 로드맵과 실제 진행 상황 동시 관리

---

## Phase 1 — 기반 환경 구축 및 지도 렌더링 (완료)
### 구현 내용
1. React(Vite) 기반 프로젝트 초기화
2. GitHub Pages 배포를 위한 `base` 경로 설정
3. Kakao Map 로더 컴포넌트 구현
   - `VITE_KAKAO_MAP_KEY` 존재 시 SDK 로드
   - 지도 + 줌/맵타입 컨트롤 표시
4. 샘플 CCTV 마커 클릭 시 모달 플레이어 오픈
5. HLS 샘플 스트림 / YouTube 임베드 분기 재생

### 결과
- 키가 있는 환경에서는 지도 렌더링 가능
- 키가 없으면 안내 UI를 표시해 개발 환경에서 즉시 원인 파악 가능

---

## Phase 2 — 핵심 데이터(교통 CCTV) 및 프록시 구축 (진행 중)
### 구현 내용
1. Cloudflare Worker 프록시 템플릿 작성
   - `/api/its?path=...` 형태로 원천 API 호출 위임
   - CORS 헤더 부여
2. 프론트엔드 필터 UI(고속도로/국도/관광지) 도입
3. 샘플 데이터 구조를 실데이터 이관 가능한 스키마로 정의
   - `id, name, lat, lng, source, streamType, streamUrl/videoId`

### 다음 작업
- ITS 실 API 키 발급 후 연계 fetch 모듈 추가
- MarkerClusterer 적용(대량 마커 성능 대응)
- 프록시에 API 키 시크릿 바인딩 및 rate limit 도입

---

## Phase 3 — 관광/재난 데이터 확장 (예정)
- 국립공원/해수욕장 YouTube Live 목록 JSON 구축
- 지자체 API별 어댑터 계층(정규화 모듈) 추가
- 소스 타입별 마커 스타일 분리

## Phase 4 — UX 고도화 및 서비스화 (예정)
- 즐겨찾기(localStorage), 최근 본 영상
- 모바일 대응 모달/지도 레이아웃 튜닝
- 오류 상태(스트림 중단, API 타임아웃) UX 개선

---

## 운영 체크리스트
- [ ] Kakao 도메인에 `https://<username>.github.io` 등록
- [ ] ITS/OpenAPI 키 신청 및 사용량 제한 확인
- [ ] Worker 배포 URL을 `VITE_PROXY_BASE_URL`로 연결
- [ ] GitHub Actions Pages 배포 확인
