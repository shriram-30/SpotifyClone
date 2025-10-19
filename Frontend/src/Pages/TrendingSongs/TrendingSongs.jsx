import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMusic } from '../../contexts/MusicContext';
import './TrendingSongs.css';
import { FaRandom } from 'react-icons/fa';

const TrendingSongs = () => {
  const navigate = useNavigate();
  const { 
    trendingSongs, 
    isLoading, 
    error, 
    isShuffled, 
    toggleShuffle, 
    playSong 
  } = useMusic();
  
  const handleShuffle = () => {
    toggleShuffle();
    
    // If shuffling was just turned on, play the first song in the shuffled queue
    if (!isShuffled && trendingSongs.length > 0) {
      playSong(trendingSongs[0]);
    }
  };
  
  const handleSongClick = (song) => {
    // Navigate to the track page
    navigate(`/track/${song._id}`, { state: { track: song } });
    // Play the song
    playSong({
      ...song,
      // Ensure artist is set correctly for the Musicbar
      artist: song.subheading || 'Unknown Artist',
      // Ensure title is set correctly
      title: song.heading || 'Unknown Track'
    });
  };

  if (isLoading) {
    return (
      <div className="trending-songs-page">
        <div className="trending-songs-header">
          <h1>Loading Trending Songs...</h1>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="trending-songs-page">
        <div className="trending-songs-header">
          <h1>Error Loading Songs</h1>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (trendingSongs.length === 0) {
    return (
      <div className="trending-songs-page">
        <div className="trending-songs-header">
          <h1>No Trending Songs Found</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="trending-songs-page">
      <div className="trending-songs-header">
        <h1>Trending Songs</h1>
        <p className="trending-count">{trendingSongs.length} songs</p>
        <div className="header-actions">
          <button onClick={handleShuffle}
          className={`shuffle-button ${isShuffled ? 'active': ''}`}
          aria-label={isShuffled ? 'Disable shuffle' : 'Shuffle songs'}>
             <FaRandom />
             <span>{isShuffled ? 'Shuffled' : 'Shuffle'}</span>
          </button>

        </div>
      </div>
      <div className="trending-songs-grid">
        {trendingSongs.map((song) => (
          <div 
            key={song._id} 
            className="trending-song-card"
            onClick={() => handleSongClick(song)}
          >
            <img 
              src={song.imgsrc} 
              alt={song.heading} 
              className="trending-song-cover" 
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/300/1DB954/FFFFFF?text=No+Image';
              }}
            />
            <div className="trending-song-info">
              <h3 className="trending-song-title">{song.heading || 'Unknown Track'}</h3>
              <p className="trending-song-artist">{song.subheading || 'Unknown Artist'}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrendingSongs;