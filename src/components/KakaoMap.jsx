import { useEffect, useMemo, useRef, useState } from 'react';

function KakaoMap({ cctvList, onMarkerClick }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const [mapStatus, setMapStatus] = useState('idle');

  const fallbackMessage = useMemo(() => {
    const appkey = import.meta.env.VITE_KAKAO_MAP_KEY;
    if (!appkey) {
      return 'Kakao Map API 키가 없어 샘플 목록 모드로 표시 중입니다.';
    }

    return 'Kakao 지도를 불러오지 못해 샘플 목록 모드로 표시 중입니다.';
  }, []);

  useEffect(() => {
    const appkey = import.meta.env.VITE_KAKAO_MAP_KEY;
    if (!appkey) {
      setMapStatus('fallback');
      return undefined;
    }

    const scriptId = 'kakao-maps-script';
    const existing = document.getElementById(scriptId);

    const initializeMap = () => {
      if (!window.kakao?.maps || !mapRef.current) {
        setMapStatus('fallback');
        return;
      }

      const map =
        mapInstanceRef.current ??
        new window.kakao.maps.Map(mapRef.current, {
          center: new window.kakao.maps.LatLng(36.5, 127.9),
          level: 12
        });
      mapInstanceRef.current = map;

      if (!map.__controlsInitialized) {
        const mapTypeControl = new window.kakao.maps.MapTypeControl();
        map.addControl(mapTypeControl, window.kakao.maps.ControlPosition.TOPRIGHT);

        const zoomControl = new window.kakao.maps.ZoomControl();
        map.addControl(zoomControl, window.kakao.maps.ControlPosition.RIGHT);
        map.__controlsInitialized = true;
      }

      markersRef.current.forEach((marker) => marker.setMap(null));
      markersRef.current = cctvList.map((item) => {
        const marker = new window.kakao.maps.Marker({
          map,
          position: new window.kakao.maps.LatLng(item.lat, item.lng)
        });

        window.kakao.maps.event.addListener(marker, 'click', () => onMarkerClick(item));
        return marker;
      });

      setMapStatus('ready');
    };

    if (existing) {
      if (window.kakao?.maps?.load) {
        window.kakao.maps.load(initializeMap);
      } else {
        existing.addEventListener('load', initializeMap, { once: true });
      }
      return undefined;
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.async = true;
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?autoload=false&appkey=${appkey}`;
    script.onload = () => {
      if (!window.kakao?.maps?.load) {
        setMapStatus('fallback');
        return;
      }

      window.kakao.maps.load(initializeMap);
    };
    script.onerror = () => {
      setMapStatus('fallback');
    };
    document.head.appendChild(script);

    return () => {
      markersRef.current.forEach((marker) => marker.setMap(null));
      markersRef.current = [];
    };
  }, [cctvList, onMarkerClick]);

  if (mapStatus === 'fallback') {
    return (
      <div className="map-fallback">
        <h2>샘플 CCTV 목록</h2>
        <p>{fallbackMessage}</p>
        <div className="fallback-list" role="list">
          {cctvList.map((item) => (
            <button key={item.id} type="button" role="listitem" onClick={() => onMarkerClick(item)}>
              {item.name}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return <div ref={mapRef} className="map-canvas" />;
}

export default KakaoMap;
