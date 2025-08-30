import React from "react";
import "./CanvasPlayer.css";

const CanvasPlayer = ({ videoUrl , trackName,artistName}) => {
  return (
    <div className="canvas-sidebar">
      {videoUrl ? (
        <video
          className="canvas-video"
          src={videoUrl}
          autoPlay
          loop
          muted
          playsInline
        ></video>
      ) : (
        <div className="fallback-background"></div>
      )}
      <div className="canvas-overlay"></div>
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
