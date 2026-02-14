import { useEffect, useRef } from 'react';

function KakaoMap({ cctvList, onMarkerClick }) {
  const mapRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    const scriptId = 'kakao-maps-script';
    const existing = document.getElementById(scriptId);

    const initializeMap = () => {
      if (!window.kakao?.maps || !mapRef.current) {
        return;
      }

      const map = new window.kakao.maps.Map(mapRef.current, {
        center: new window.kakao.maps.LatLng(36.5, 127.9),
        level: 12
      });

      const mapTypeControl = new window.kakao.maps.MapTypeControl();
      map.addControl(mapTypeControl, window.kakao.maps.ControlPosition.TOPRIGHT);

      const zoomControl = new window.kakao.maps.ZoomControl();
      map.addControl(zoomControl, window.kakao.maps.ControlPosition.RIGHT);

      markersRef.current.forEach((marker) => marker.setMap(null));
      markersRef.current = cctvList.map((item) => {
        const marker = new window.kakao.maps.Marker({
          map,
          position: new window.kakao.maps.LatLng(item.lat, item.lng)
        });

        window.kakao.maps.event.addListener(marker, 'click', () => onMarkerClick(item));
        return marker;
      });
    };

    if (existing) {
      window.kakao.maps.load(initializeMap);
      return undefined;
    }

    const appkey = import.meta.env.VITE_KAKAO_MAP_KEY;
    if (!appkey) {
      return undefined;
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.async = true;
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?autoload=false&appkey=${appkey}`;
    script.onload = () => window.kakao.maps.load(initializeMap);
    document.head.appendChild(script);

    return () => {
      markersRef.current.forEach((marker) => marker.setMap(null));
      markersRef.current = [];
    };
  }, [cctvList, onMarkerClick]);

  if (!import.meta.env.VITE_KAKAO_MAP_KEY) {
    return (
      <div className="map-fallback">
        <h2>Kakao Map API 키가 없습니다.</h2>
        <p><code>.env</code>에 <code>VITE_KAKAO_MAP_KEY</code>를 설정하면 지도가 렌더링됩니다.</p>
      </div>
    );
  }

  return <div ref={mapRef} className="map-canvas" />;
}

export default KakaoMap;
