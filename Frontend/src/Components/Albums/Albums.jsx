import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Albums.css';

const Albums = () => {
  const [albums, setAlbums] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/albums');
        if (response.data && response.data.success) {
          setAlbums(response.data.data);
        }
      } catch (err) {
        console.error('Error fetching albums:', err);
        setError('Failed to load albums. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAlbums();
  }, []);

  if (isLoading) {
    return <div className="albums-loading">Loading albums...</div>;
  }

  if (error) {
    return <div className="albums-error">{error}</div>;
  }

  const handleShowAll = () => {
    navigate('/albums');
  };

  if (isLoading) return <div className="loading">Loading albums...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (albums.length === 0) return <div>No albums found</div>;

  return (
    <div className='TrendingContent'>
      <span>Popular Albums</span>
    
      <div className='TrendingCardContent'>
        {albums.map((album) => (
          <div 
            key={album._id} 
            className="CardContent"
            onClick={() => navigate(`/album/${album._id}`, { state: { album } })}
          >
            <img 
              src={album.imageUrl} 
              alt={album.albumname} 
              className="song-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/300/282828/1DB954?text=No+Image';
              }}
            />
            <div className="CardContainerText">
              <h3 className="song-title">{album.albumname || 'Unknown Album'}</h3>
              <p className="song-artist">{album.artist || 'Various Artists'}</p>
            </div>
            <div className="play-button">
              <svg viewBox="0 0 24 24" className="play-icon" width="24" height="24" fill="white">
                <path d="m7.05 3.606 13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z"></path>
              </svg>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Albums;
