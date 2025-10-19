import React, { useEffect, useRef } from "react";
import { FaTimes } from "react-icons/fa";
import "./CanvasPlayer.css";

const CanvasPlayer = ({ videoUrl, trackName, artistName, imageUrl, onClose }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    console.log('CanvasPlayer mounted with props ->', { videoUrl, imageUrl, trackName, artistName });
    return () => {
      console.log('CanvasPlayer unmounted');
    };
  }, []);

  useEffect(() => {
    console.log('CanvasPlayer props changed -> videoUrl:', videoUrl, 'imageUrl:', imageUrl);
  }, [videoUrl, imageUrl]);

  // Force video reload when videoUrl changes
  useEffect(() => {
    if (videoRef.current && videoUrl) {
      // Force video reload by setting src to empty and then back to the URL
      videoRef.current.pause();
      videoRef.current.load();
      videoRef.current.play().catch(error => {
        console.log("Autoplay prevented:", error);
      });
    }
  }, [videoUrl]);

  return (
    <div className="canvas-sidebar">
      {/* always render close button so user can hide the panel */}
      <button className="close-button" onClick={onClose} aria-label="Close canvas player">
        <FaTimes />
      </button>

      {/* content: video if available, else image if available, else solid black fallback */}
      {videoUrl ? (
        <video
          ref={videoRef}
          key={videoUrl}
          className="canvas-video"
          src={videoUrl}
          autoPlay
          loop
          muted
          playsInline
        />
      ) : imageUrl ? (
        <img 
          src={imageUrl} 
          alt={`${trackName || 'Album'} cover`} 
          className="canvas-image"
        />
      ) : (
        <div className="fallback-background" />
      )}

      <div className="canvas-overlay" />

      <div className="track-info-top">
        {trackName && <p className="track-name">{trackName}</p>}
      </div>
      <div className="track-info-bottom">
        {trackName && <h4 className="track-name-main">{trackName}</h4>}
        {artistName && <p className="artist-name">{artistName}</p>}
      </div>
    </div>
  );
};

export default CanvasPlayer;
