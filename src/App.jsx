import { useEffect, useMemo, useState } from 'react';
import KakaoMap from './components/KakaoMap';
import VideoModal from './components/VideoModal';
import { fetchItsCctvList } from './api/itsCctv';
import { sampleCctv } from './data/sampleCctv';

const filters = [
  { id: 'highway', label: '고속도로' },
  { id: 'national', label: '국도' },
  { id: 'tour', label: '관광지' }
];

function App() {
  const [selected, setSelected] = useState(null);
  const [cctvList, setCctvList] = useState(sampleCctv);
  const [loadState, setLoadState] = useState({ status: 'idle', message: '' });
  const [enabledFilters, setEnabledFilters] = useState(() => new Set(filters.map((item) => item.id)));

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoadState({ status: 'loading', message: 'ITS CCTV 데이터를 불러오는 중...' });
        const itsCctv = await fetchItsCctvList();

        if (!mounted) {
          return;
        }

        if (itsCctv.length === 0) {
          setLoadState({
            status: 'warning',
            message: '프록시 또는 API 키가 없어 샘플 데이터만 표시 중입니다.'
          });
          setCctvList(sampleCctv);
          return;
        }

        const tourSamples = sampleCctv.filter((item) => item.source === 'tour');
        setCctvList([...itsCctv, ...tourSamples]);
        setLoadState({
          status: 'success',
          message: `ITS ${itsCctv.length}건 + 관광 샘플 ${tourSamples.length}건 반영 완료`
        });
      } catch (error) {
        if (!mounted) {
          return;
        }

        setLoadState({
          status: 'error',
          message: `ITS 연동 실패: ${error.message}. 샘플 데이터로 대체합니다.`
        });
        setCctvList(sampleCctv);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, []);

  const visibleCctv = useMemo(
    () => cctvList.filter((item) => enabledFilters.has(item.source)),
    [cctvList, enabledFilters]
  );

  const toggleFilter = (filterId) => {
    setEnabledFilters((prev) => {
      const next = new Set(prev);
      if (next.has(filterId)) {
        next.delete(filterId);
      } else {
        next.add(filterId);
      }
      return next;
    });
  };

  return (
    <main>
      <section className="toolbar">
        <h1>전국 CCTV 통합 뷰어 (Phase 2 진행중)</h1>
        <div className="filter-wrap">
          {filters.map((filter) => (
            <button
              key={filter.id}
              type="button"
              className={enabledFilters.has(filter.id) ? 'active' : ''}
              onClick={() => toggleFilter(filter.id)}
            >
              {filter.label}
            </button>
          ))}
        </div>
        <p className={`load-message ${loadState.status}`}>{loadState.message}</p>
      </section>

      <KakaoMap cctvList={visibleCctv} onMarkerClick={setSelected} />
      <VideoModal selected={selected} onClose={() => setSelected(null)} />
    </main>
  );
}

export default App;
