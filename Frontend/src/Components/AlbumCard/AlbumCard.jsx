import React from 'react';
import { useNavigate } from 'react-router-dom';
import './AlbumCard.css';

const AlbumCard = ({ album }) => {
  const navigate = useNavigate();

  const handleAlbumClick = () => {
    navigate(`/album/${album._id}`, { state: { album } });
  };

  return (
    <div className="album-card" onClick={handleAlbumClick}>
      <div className="album-image-container">
        <img 
          src={album.imageUrl} 
          alt={album.albumname} 
          className="album-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://via.placeholder.com/200';
          }}
        />
        <div className="album-play-button">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="#1DB954">
            <path d="M8 5v14l11-7z"></path>
          </svg>
        </div>
      </div>
      <div className="album-info">
        <h4 className="album-title">{album.albumname}</h4>
        <p className="album-artist">{album.artist}</p>
        <p className="album-year">{album.year} • {album.songs?.length || 0} songs</p>
      </div>
    </div>
  );
};

export default AlbumCard;
