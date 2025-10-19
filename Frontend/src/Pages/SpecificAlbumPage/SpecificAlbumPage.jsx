import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { FastAverageColor } from 'fast-average-color';
import { FaRandom, FaPlay } from 'react-icons/fa';
import './SpecificAlbumPage.css';
import { useMusic } from '../../contexts/MusicContext';
import MusicBar from '../Musicbar/Musicbar';
import Navbar from '../../Components/Navbar/Navbar';
import SideBar from '../../Components/Sidebar/SideBar';
import CanvasPlayer from '../../Components/CanvasPlayer/CanvasPlayer';
import axios from 'axios';

const fac = new FastAverageColor();

const SpecificAlbumPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [album, setAlbum] = useState(location.state?.album || null);
  const [isLoading, setIsLoading] = useState(!location.state?.album);
  const [backgroundGradient, setBackgroundGradient] = useState('');
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [showCanvas, setShowCanvas] = useState(false);

  const {
    currentSong,
    isPlaying,
    playSong,
    togglePlayPause,
    setCurrentPlaylist,
  } = useMusic();

  // Update currentSongIndex when currentSong changes
  useEffect(() => {
    if (currentSong && album?.songs) {
      const index = album.songs.findIndex(song => song._id === currentSong._id);
      if (index !== -1) {
        setCurrentSongIndex(index);
      }
    }
  }, [currentSong, album?.songs]);

  // Fetch album data when component mounts or ID changes
  useEffect(() => {
    const fetchAlbum = async () => {
      if (!id) {
        console.error('No album ID provided');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await axios.get(`http://localhost:5000/api/albums/${id}`);
        
        if (response.data?.success && response.data.data) {
          const albumData = response.data.data;
          setAlbum(albumData);

          // Initialize canvas visibility from session storage or location state
          const canvasWasVisible = sessionStorage.getItem('canvasVisible') === 'true';
          if (canvasWasVisible || location.state?.startSong) {
            setShowCanvas(true);
          } else {
            setShowCanvas(false);
          }

          // If there's a startSong in location state, find its index
          if (location.state?.startSong) {
            const songIndex = albumData.songs?.findIndex(
              song => song._id === location.state.startSong._id
            );
            if (songIndex !== -1) {
              setCurrentSongIndex(songIndex);
            }
          }
        } else {
          console.error('Failed to fetch album data');
        }
      } catch (error) {
        console.error('Error fetching album:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAlbum();
  }, [id, location.state]);

  // If navigation passed a startSong in location.state, set the current index when album is loaded
  useEffect(() => {
    const startSong = location.state?.startSong;
    if (startSong && album?.songs) {
      const index = album.songs.findIndex(s => s._id === startSong._id || s.title === startSong.title);
      if (index !== -1) setCurrentSongIndex(index);
    }
  }, [location.state, album]);

  // Set dynamic background
  useEffect(() => {
    if (!album?.imageUrl) return;
    fac.getColorAsync(album.imageUrl)
      .then((color) => {
        const gradient = `linear-gradient(to bottom, ${color.hex} 0%, #121212 50%, #121212 100%)`;
        setBackgroundGradient(gradient);
      })
      .catch(() => {
        setBackgroundGradient('linear-gradient(to bottom, #a8a294 0%, #121212 50%, #121212 100%)');
      });
  }, [album?.imageUrl]);

  const formatDurationToSeconds = (duration) => {
    if (!duration) return 0;
    const [minutes, seconds] = duration.split(':').map(Number);
    return minutes * 60 + (seconds || 0);
  };

  const handlePlayPause = useCallback(() => {
    if (!album?.songs?.length) return;

    const currentSongInAlbum = album.songs[currentSongIndex];
    const isDifferentSong = !currentSong || currentSong._id !== currentSongInAlbum._id;

    const playlist = album.songs.map((song, idx) => ({
      ...song,
      imgsrc: album.imageUrl,
      artist: album.artist,
      album: album.albumname,
      duration: formatDurationToSeconds(song.duration),
      music: song.url || song.music,
      canvasUrl: song.canvasUrl,
      _index: idx
    }));

    if (isDifferentSong) {
      const songToPlay = playlist[currentSongIndex];
      setCurrentPlaylist(playlist, currentSongIndex);
      playSong(songToPlay);
      setShowCanvas(!!songToPlay.canvasUrl);
    } else {
      togglePlayPause();
    }
  }, [album?.songs, currentSong, currentSongIndex, playSong, setCurrentPlaylist, togglePlayPause]);

  // Handle song play with canvas
  const handlePlaySong = useCallback((song, index) => {
    const playlist = album.songs.map((s, idx) => ({
      ...s,
      imgsrc: album.imageUrl,
      artist: album.artist,
      album: album.albumname,
      duration: formatDurationToSeconds(s.duration),
      music: s.url || s.music,
      canvasUrl: s.canvasUrl,
      _index: idx
    }));

    const isSameSong = currentSong && song._id === currentSong._id;
    
    setCurrentSongIndex(index);
    setCurrentPlaylist(playlist, index);
    playSong(playlist[index]);
    
    // Always show canvas for a new song, or toggle for the same song
    if (isSameSong) {
      // Toggle canvas visibility for the same song
      setShowCanvas(prev => !prev);
    } else {
      // Always show canvas for a new song
      setShowCanvas(true);
    }
    
    // Update session storage based on canvas visibility
    if (showCanvas) {
      sessionStorage.setItem('canvasVisible', 'true');
    }
  }, [album?.songs, album?.imageUrl, album?.artist, album?.albumname, currentSong, playSong, setCurrentPlaylist]);

  const handleShufflePlay = useCallback(() => {
    if (!album?.songs?.length) return;
    
    // Create a shuffled copy of the songs
    const shuffledSongs = [...album.songs].sort(() => 0.5 - Math.random());
    
    // Map the songs to include all required properties
    const playlist = shuffledSongs.map((s, idx) => ({
      ...s,
      imgsrc: album.imageUrl,
      artist: album.artist,
      album: album.albumname,
      duration: formatDurationToSeconds(s.duration),
      music: s.url || s.music,
      canvasUrl: s.canvasUrl,
      _index: album.songs.findIndex(originalSong => originalSong._id === s._id)
    }));
    
    if (playlist.length > 0) {
      const firstSong = playlist[0];
      setCurrentPlaylist(playlist, 0);
      playSong(firstSong);
      setCurrentSongIndex(firstSong._index);
      setShowCanvas(!!firstSong.canvasUrl);
    }
  }, [album?.songs, album?.imageUrl, album?.artist, album?.albumname, playSong, setCurrentPlaylist]);

  // Close canvas
  const closeCanvas = useCallback(() => {
    setShowCanvas(false);
    // Remove canvas visibility from session storage
    sessionStorage.removeItem('canvasVisible');
  }, []);

  const currentAlbumSong = album?.songs?.[currentSongIndex];
  const isCurrentSongPlaying = currentSong && currentAlbumSong && currentSong._id === currentAlbumSong._id;

  if (isLoading) {
    return (
      <div className="loading-container" style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#121212',
        color: '#fff'
      }}>
        <div className="loading">Loading album...</div>
      </div>
    );
  }

  if (!album) {
    return (
      <div className="error-container" style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#121212',
        color: '#fff',
        textAlign: 'center',
        padding: '20px'
      }}>
        <h2>Album not found</h2>
        <p>We couldn't find the album you're looking for.</p>
        <button 
          onClick={() => navigate('/')} 
          style={{
            marginTop: '20px',
            padding: '10px 20px',
            backgroundColor: '#1DB954',
            color: 'white',
            border: 'none',
            borderRadius: '20px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="specific-album-page">
      <div className="specific-album-navbar">
        <Navbar />
      </div>

      <div className={`specific-album-content-wrapper ${showCanvas ? 'with-canvas' : ''}`}>
        <aside className="specific-album-sidebar">
          <SideBar />
        </aside>

        <main className="specific-album-main" style={{ background: backgroundGradient }}>
        <div className="album-details">
          <div className="album-header">
            <div className="album-cover">
              <img
              className="album-cover-image"
                src={album.imageUrl}
                alt={album.albumname}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/300/282828/1DB954?text=No+Image';
                }}
              />
            </div>
            <div className="album-info">
              <h1>{album.albumname}</h1>
              <p className="artist">{album.artist}</p>
              <p className="year">{album.year} • {album.songs?.length || 0} songs</p>
              <div className="album-actions">
                <div className="album-main-actions">
                  <button className="play-button" onClick={handlePlayPause}>
                    {isCurrentSongPlaying && isPlaying ? 'Pause' : 'Play'}
                  </button>
                </div>
                <div className="shuffle-action">
                  <button
                    className="shuffle-play-button"
                    onClick={handleShufflePlay}
                    title="Shuffle Play"
                  >
                    <FaRandom className="shuffle-icon" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="songs-list">
            {album.songs?.map((song, index) => {
              const isActive = currentSong?._id === song._id;
              return (
                <div
                  key={song._id || index}
                  className={`song-row ${isActive ? 'active' : ''}`}
                  onClick={() => handlePlaySong(song, index)}
                >
                  <div className="track-number">
                    <span className="track-number-text">{index + 1}</span>
                    <div className="play-icon">
                      <FaPlay />
                    </div>
                    {isActive && isPlaying && (
                      <div className="playing-animation">
                        <span></span><span></span><span></span>
                      </div>
                    )}
                  </div>
                  <div className="track-info">
                    <span className="track-title">
                      {song.title}
                      {song.explicit && <span className="explicit-badge">E</span>}
                    </span>
                    <span className="track-artist">
                      {song.artists || album.artist}
                    </span>
                  </div>
                  <span className="track-duration">
                    {song.duration || '0:00'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        </main>

        <div className={`canvas-panel ${showCanvas ? 'visible' : ''}`}>
          {showCanvas && (
            <CanvasPlayer 
              videoUrl={currentAlbumSong?.canvasUrl}
              imageUrl={album?.imageUrl}
              trackName={currentAlbumSong?.title}
              artistName={album?.artist}
              onClose={closeCanvas}
            />
          )}
        </div>
      </div>

      <div className="music-player-container">
        <MusicBar 
          albumImage={album?.image || album?.coverImage} 
          artistName={album?.artist}
          trackName={currentSong?.title}
        />
      </div>
    </div>
  );
};

export default SpecificAlbumPage;
