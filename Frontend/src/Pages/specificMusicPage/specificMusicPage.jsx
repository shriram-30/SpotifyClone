import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { FastAverageColor } from 'fast-average-color';
import './specificMusic.css';
import { fetchTrackById } from '../../Config/config';
import { useMusic } from '../../contexts/MusicContext';
import Navbar from '../../Components/navbar/Navbar';
import SideBar from '../../Components/Sidebar/SideBar';
import CanvasPlayer from '../../Components/CanvasPlayer/CanvasPlayer';

// Create a single instance of FastAverageColor outside the component
const fac = new FastAverageColor();

const SpecificMusicPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [track, setTrack] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentEle, setCurrentEle] = useState(location.state?.track || null);
  const [backgroundGradient, setBackgroundGradient] = useState('');
  const [duration, setDuration] = useState(0);

  const audioRef = useRef(null);
  const[showCanvas,setShowCanvas]=useState(false);
  // Music context
  const { currentSong, isPlaying, togglePlayPause, playSong } = useMusic();

  // Memoize the song name to query
  const songNameToQuery = useMemo(
    () => currentEle?.songName || currentEle?.heading || '',
    [currentEle?.songName, currentEle?.heading]
  );

  // Set background gradient from album art
  useEffect(() => {
    if (!track?.imgsrc) return;

    fac.getColorAsync(track.imgsrc)
      .then((color) => {
        const gradient = `linear-gradient(to bottom, ${color.hex} 0%, #121212 50%, #121212 100%)`;
        setBackgroundGradient(gradient);
      })
      .catch(() => {
        setBackgroundGradient(
          'linear-gradient(to bottom, #a8a294 0%, #121212 50%, #121212 100%)'
        );
      });
  }, [track?.imgsrc]);

  // Fetch track by ID
  useEffect(() => {
    async function loadTrack() {
      if (!id) {
        navigate('/home');
        return;
      }

      try {
        setIsLoading(true);
        const trackData = await fetchTrackById(id);
        if (trackData) {
          setTrack(trackData);
        }
      } catch (error) {
        console.error('Error loading track:', error);
        navigate('/home');
      } finally {
        setIsLoading(false);
      }
    }

    loadTrack();
  }, [id, navigate]);

  // If location state already has track data
  useEffect(() => {
    let cancelled = false;

    const fetchTrackData = async () => {
      if (location.state?.track) {
        const trackData = location.state.track;
        setTrack(trackData);
        setCurrentEle(trackData);
        return;
      }

      if (!id) return;

      try {
        const trackData = await fetchTrackById(id);
        if (cancelled) return;

        if (!trackData) {
          navigate('/home');
          return;
        }

        setTrack(trackData);
        setCurrentEle(trackData);
      } catch (error) {
        console.error('Error fetching track:', error);
        navigate('/home');
      }
    };

    fetchTrackData();

    return () => {
      cancelled = true;
    };
  }, [id, location.state, navigate]);

  // Setup audio
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (currentEle?.music) {
      audio.src = currentEle.music;
      audio.load();
    }

    return () => {
      if (audio) {
        audio.pause();
        audio.removeAttribute('src');
        audio.load();
      }
    };
  }, [currentEle]);

  // Update document title
  useEffect(() => {
    if (currentEle) {
      document.title = `${currentEle.heading} • ${currentEle.subheading} | Spotify`;
    }
    return () => {
      document.title = 'Spotify - Web Player';
    };
  }, [currentEle]);

  // Format duration
  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const isCurrentSong = currentSong?.id === currentEle?._id;

  const handlePlayClick = useCallback(() => {
    setShowCanvas(true);
    if (currentEle) {
      const songData = {
        id: currentEle._id,
        title: currentEle.heading || currentEle.songName || 'Unknown Track',
        artist: currentEle.subheading || 'Unknown Artist',
        imgsrc: currentEle.imgsrc,
        music: currentEle.music,
      };
      playSong(songData);
    }
  }, [currentEle, playSong]);

  if (isLoading) {
    return <div className="loading-container">Loading...</div>;
  }

  if (!track) {
    return null;
  }

  return (
    <div className="home-layout">
      <Navbar />
      <div className={`home-body ${showCanvas ? 'with-canvas' : ''}`}>
        <aside className="home-sidebar">
          <SideBar />
        </aside>

        <div className="main-content-container">
          <section className="home-main" style={{ background: backgroundGradient }}>
            <div className="content-wrapper">
              <div className="music-container">
                <img src={track.imgsrc} alt="music" className="music-image" />
                <div className="music-details">
                  <h1 className="heading">{track.heading}</h1>
                  <h2>{track.subheading}</h2>
                </div>
              </div>

            {/* Player Row (Play button + Track info + controls) */}
            <div
              className="player-row"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '8px 12px',
              }}
            >
              {/* Play Button */}
              <button
                className="specific-page-play-button"
                onClick={isCurrentSong ? togglePlayPause : handlePlayClick}
                aria-label={isCurrentSong && isPlaying ? 'Pause' : 'Play'}
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: '#1DB954',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
                  transition: 'all 0.3s ease',
                  marginRight: '16px',
                  transform: 'scale(1)',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.backgroundColor = '#1ed760';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.backgroundColor = '#1DB954';
                }}
              >
                {isCurrentSong && isPlaying ? (
                  <svg
                    viewBox="0 0 24 24"
                    className="play-icon"
                    style={{ width: '24px', height: '24px', fill: 'black' }}
                  >
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"></path>
                  </svg>
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    className="play-icon"
                    style={{ width: '24px', height: '24px', fill: 'black' }}
                  >
                    <path d="m7.05 3.606 13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z"></path>
                  </svg>
                )}
              </button>

              {/* Track Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    color: '#1DB954',
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                  }}
                >
                  {track?.songName || currentEle.songName || currentEle.heading}
                </div>
                <div
                  style={{
                    color: '#b3b3b3',
                    fontSize: 12,
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                  }}
                >
                  {currentEle.subheading}
                </div>
              </div>

              {/* Controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  aria-label="Add"
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
                >
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                    <path d="M11 2.75A.75.75 0 0111.75 3.5v7.75H20a.75.75 0 010 1.5h-7.25V21a.75.75 0 01-1.5 0v-7.25H4a.75.75 0 010-1.5h7.25V3.5a.75.75 0 01.75-.75z"></path>
                  </svg>
                </button>
                <div style={{ color: '#b3b3b3', fontSize: 14, minWidth: '40px' }}>
                  {formatTime(duration)}
                </div>
              </div>

              <button
                aria-label="More"
                style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M3 12a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm9 0a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm9 0a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"></path>
                </svg>
              </button>
            </div>

            {/* Hidden audio element */}
            <div style={{ display: 'none' }}>
              {track?.music && (
                <audio
                  key={track.music}
                  ref={audioRef}
                  src={track.music}
                  preload="metadata"
                  onError={(e) => {
                    console.error('Audio loading error:', e);
                    setTrack((prev) => (prev ? { ...prev, error: true } : null));
                  }}
                  onLoadedMetadata={(e) => {
                    setDuration(e.target.duration);
                    setTrack((prev) => (prev ? { ...prev, isLoaded: true } : null));
                  }}
                />
              )}
            </div>
          </div>
          </section>
        </div>
        
        {/* Right side Canvas Player - always in DOM but width is controlled by grid */}
        <div className={`canvas-player-container ${!showCanvas ? 'hidden' : ''}`}>
          {track?.canvasUrl && (
            <>
              <div className="canvas-close" onClick={() => setShowCanvas(false)}>×</div>
              <CanvasPlayer videoUrl={track.canvasUrl} trackName={track.heading}  artistName={track.subheading}/>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SpecificMusicPage;