import React, { useState, useEffect } from 'react';
import './artistcard.css';
import { getArtists } from '../../services/artistService';
import { useNavigate } from 'react-router-dom';

const ArtistCard = () => {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await fetch('http://localhost:5000/api/artists', {
          credentials: 'include', // Include cookies for session
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to fetch artists');
        }
        
        const data = await response.json();
        console.log('Artists data:', data);
        setArtists(data.artists || []);
      } catch (err) {
        console.error('Error in fetchArtists:', err);
        setError(err.message || 'Failed to load artists. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchArtists();
  }, []);

  const handleArtistClick = (artistId, artistName) => {
    navigate(`/artist/${artistId}`, { state: { artistName } });
  };

  if (loading) {
    return <div className="loading">Loading artists...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (artists.length === 0) {
    return <div className="no-artists">No artists available</div>;
  }

  return (
    <div className='ArtistCardContent'>
      {artists.map((artist) => (
        <div 
          key={artist._id}
          className="ArtistCarddetail"
          onClick={() => handleArtistClick(artist._id, artist.name)}
        >
          <img 
            src={artist.img || '/default-artist.jpg'} 
            alt={artist.name}
            className="artist-image"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://via.placeholder.com/150/282828/1DB954?text=No+Image';
            }}
          />
          <div className="textcontainer">
            <h1>{artist.name}</h1>
           
          </div>
          <span id="playbutton">
            <svg 
              data-encore-id="icon" 
              role="img" 
              aria-hidden="true" 
              className="e-9812-icon e-9812-baseline" 
              viewBox="0 0 24 24"
            >
              <path d="m7.05 3.606 13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z"></path>
            </svg>
          </span>
        </div>
      ))}
    </div>
  );
};

export default ArtistCard;