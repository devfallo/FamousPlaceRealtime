import { useEffect, useRef } from 'react';
import Hls from 'hls.js';

function VideoModal({ selected, onClose }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (!selected || selected.streamType !== 'hls' || !videoRef.current) {
      return undefined;
    }

    const video = videoRef.current;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = selected.streamUrl;
      return undefined;
    }

    if (!Hls.isSupported()) {
      return undefined;
    }

    const hls = new Hls();
    hls.loadSource(selected.streamUrl);
    hls.attachMedia(video);

    return () => {
      hls.destroy();
    };
  }, [selected]);

  if (!selected) {
    return null;
  }

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div className="modal" onClick={(event) => event.stopPropagation()}>
        <header className="modal-header">
          <h2>{selected.name}</h2>
          <button type="button" onClick={onClose} aria-label="닫기">✕</button>
        </header>
        <div className="modal-content">
          {selected.streamType === 'hls' ? (
            <video ref={videoRef} controls autoPlay playsInline />
          ) : (
            <iframe
              title={selected.name}
              src={`https://www.youtube.com/embed/${selected.videoId}?autoplay=1`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default VideoModal;
