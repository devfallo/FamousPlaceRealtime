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

## Phase 2 — 핵심 데이터(교통 CCTV) 및 프록시 구축 (완료)
### 구현 내용
1. Cloudflare Worker 프록시 템플릿 작성
   - `/api/its?path=...` 형태로 원천 API 호출 위임
   - CORS 헤더 부여
2. 프론트엔드 필터 UI(고속도로/국도/관광지) 도입
3. 샘플 데이터 구조를 실데이터 이관 가능한 스키마로 정의
   - `id, name, lat, lng, source, streamType, streamUrl/videoId`
4. ITS 연동 모듈(`src/api/itsCctv.js`) 추가
   - `VITE_PROXY_BASE_URL` + `VITE_ITS_CCTV_PATH`를 이용해 프록시 호출
   - 응답 스키마가 달라도 배열 payload를 탐색해 정규화
   - 좌표/스트림 URL 유효성 검증 후 지도 마커 데이터로 변환
5. 로딩/성공/실패 상태를 상단 툴바 메시지로 노출
   - API 실패 또는 미설정 시 샘플 데이터로 자동 폴백

### Phase 2 마무리 반영
- MarkerClusterer 적용으로 대량 마커 렌더링 성능 개선
- 프록시에 API 키 시크릿 바인딩 + 요청 rate limit 추가
- 국도/고속도로 분류 규칙 고도화(roadType/routeNo/cctvname 다중 매핑)

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

## 실제 웹페이지 주소
- https://devfallo.github.io/FamousPlaceRealtime/

---

## 사용자 설정 가이드 (GitHub Pages `configure-pages` Not Found 에러 해결)
아래 에러는 저장소에 **GitHub Pages 사이트가 아직 활성화되지 않았을 때** 자주 발생합니다.

```text
Get Pages site failed. ... Error: Not Found
HttpError: Not Found - https://docs.github.com/rest/pages/pages#get-a-apiname-pages-site
```

### 1) GitHub 저장소에서 Pages를 먼저 1회 활성화
1. GitHub 저장소 접속
2. `Settings` → `Pages` 이동
3. `Build and deployment` 항목에서
   - **Source**를 `GitHub Actions`로 선택
4. 저장

> 이 과정을 하면 저장소에 Pages site가 생성되어, 워크플로우의 `configure-pages` 단계가 `Not Found`로 실패하지 않습니다.

### 2) Repository Actions 권한 확인
`Settings` → `Actions` → `General`에서 다음 확인:
- `Actions permissions`: `Allow all actions and reusable workflows` (또는 필요한 액션 허용 상태)
- `Workflow permissions`: **Read and write permissions**
- `Allow GitHub Actions to create and approve pull requests`는 선택 사항

### 3) 브랜치/리포지토리 조건 확인
- 워크플로우 트리거 브랜치가 실제 기본 브랜치와 일치하는지 확인 (`main`)
- 포크 저장소에서 실행 중이면 조직 정책/권한으로 인해 Pages enable API가 막힐 수 있으므로 본 저장소에서 실행 권장
- 조직(Organization) 저장소라면 Org 정책에서 GitHub Pages 사용 허용 여부 확인

### 4) 워크플로우 설정 반영 내용
본 저장소 워크플로우는 `configure-pages` 단계에서 아래처럼 `enablement: true`를 명시해, Pages site가 없을 경우 자동 생성/활성화를 시도하도록 변경했습니다.

```yaml
- name: Setup Pages
  uses: actions/configure-pages@v5
  with:
    enablement: true
```

### 5) 재실행 방법
1. 위 설정 저장 후 `Actions` 탭 이동
2. `Deploy Pages` 워크플로우 선택
3. `Run workflow` 수동 실행 또는 `main` 브랜치에 커밋 푸시
4. 성공 시 `deploy-pages` 단계에서 배포 URL이 출력됨

### 6) 계속 실패할 때 점검 포인트
- 저장소가 Private인데 요금제/정책상 Pages 제한이 있는지
- Enterprise/Organization 정책에서 Pages 또는 Actions 권한이 제한되어 있는지
- 최초 1회는 웹 UI에서 Pages 활성화 후 다시 실행했는지
