import { useMemo, useState } from 'react';
import KakaoMap from './components/KakaoMap';
import VideoModal from './components/VideoModal';
import { sampleCctv } from './data/sampleCctv';

const filters = [
  { id: 'highway', label: '고속도로' },
  { id: 'national', label: '국도' },
  { id: 'tour', label: '관광지' }
];

function App() {
  const [selected, setSelected] = useState(null);
  const [enabledFilters, setEnabledFilters] = useState(() => new Set(filters.map((item) => item.id)));

  const visibleCctv = useMemo(
    () => sampleCctv.filter((item) => enabledFilters.has(item.source)),
    [enabledFilters]
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
        <h1>전국 CCTV 통합 뷰어 (Phase 1-2 MVP)</h1>
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
      </section>

      <KakaoMap cctvList={visibleCctv} onMarkerClick={setSelected} />
      <VideoModal selected={selected} onClose={() => setSelected(null)} />
    </main>
  );
}

export default App;
