import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { FastAverageColor } from 'fast-average-color';
import './specificMusic.css';
import { fetchTrackById } from '../../Config/config';
import MusicPlayerBar from '../Musicbar/Musicbar';
import Navbar from '../../Components/navbar/Navbar';
import SideBar from '../../Components/Sidebar/SideBar';

// Create a single instance of FastAverageColor outside the component
const fac = new FastAverageColor();

const SpecificMusicPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  // State to hold the dynamic background gradient
  const [backgroundGradient, setBackgroundGradient] = useState('');
  // State to hold the track data
  const [track, setTrack] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentEle, setCurrentEle] = useState(location.state?.track || null);
  // Player states
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [showMusicPlayer, setShowMusicPlayer] = useState(false);

  // Memoize the songName we will query by to avoid unnecessary effects
  const songNameToQuery = useMemo(() => currentEle?.songName || currentEle?.heading || '', [currentEle?.songName, currentEle?.heading]);

  useEffect(() => {
    // Check if track data or image source exists; if not, exit the effect
    if (!track?.imgsrc) return;

    // Use the FastAverageColor library to get the average color from the image URL
    // The library handles fetching the image asynchronously
    fac.getColorAsync(track.imgsrc)
      .then(color => {
        // The result is a color object with a hex property
        const mainColor = color.hex;
        
        // Create a linear gradient that transitions from the main color to the dark background
        const gradient = `linear-gradient(to bottom, ${mainColor} 0%, #121212 50%, #121212 100%)`;
        
        // Update the state with the new gradient
        setBackgroundGradient(gradient);
      })
      .catch(e => {
        console.error('Error getting color:', e);
        // Fallback to a default gradient on error
        setBackgroundGradient('linear-gradient(to bottom, #a8a294 0%, #121212 50%, #121212 100%)');
      });
  }, [track?.imgsrc]); // The effect re-runs when the image source changes

  // Fetch the track by ID from backend and set up the audio player
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
        } else {
          // Redirect to home if track not found
          navigate('/home');
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
  useEffect(() => {
    let cancelled = false;

    const fetchTrackData = async () => {
      // If we have track data in location state, use it
      if (location.state?.track) {
        const trackData = location.state.track;
        setTrack(trackData);
        setCurrentEle(trackData);
        return;
      }
      
      // Otherwise fetch by id from URL
      if (!id) return;

      try {
        const trackData = await fetchTrackById(id);
        if (cancelled) return;
        
        if (!trackData) {
          console.error('No track data found for ID:', id);
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

  // Hook up audio element events for metadata (duration) and time updates
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;

    const onLoadedMetadata = () => {
      console.log('Audio metadata loaded, duration:', el.duration);
      setDuration(el.duration);
    };
    const onTimeUpdate = () => setCurrentTime(el.currentTime || 0);
    const onEnded = () => setIsPlaying(false);
    const onCanPlay = () => {
      console.log('Audio can play, duration:', el.duration);
      setDuration(el.duration);
    };

    el.addEventListener('loadedmetadata', onLoadedMetadata);
    el.addEventListener('timeupdate', onTimeUpdate);
    el.addEventListener('ended', onEnded);
    el.addEventListener('canplay', onCanPlay);
    
    // Force update duration when the track changes
    if (track?.music) {
      el.load(); // This will trigger loadedmetadata when the new source is ready
    }

    return () => {
      el.removeEventListener('loadedmetadata', onLoadedMetadata);
      el.removeEventListener('timeupdate', onTimeUpdate);
      el.removeEventListener('ended', onEnded);
      el.removeEventListener('canplay', onCanPlay);
    };
  }, [track?.music]);

  // Utilities to format time like Spotify (m:ss)
  const fmt = (sec) => {
    if (!sec || Number.isNaN(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Play/Pause handler with optimized state updates
  const togglePlay = useCallback(async () => {
    if (!track?.music) {
      console.error('No track to play');
      return;
    }
    
    // Always show the player when play is clicked
    setShowMusicPlayer(true);
    const el = audioRef.current;
    
    if (!el) {
      console.error('Audio element not found');
      return;
    }
    
    try {
      if (isPlaying) {
        // Pause immediately for responsive UI
        setIsPlaying(false);
        await el.pause();
      } else {
        // Optimistic UI update
        setIsPlaying(true);
        
        // Ensure the audio is ready to play
        if (el.readyState < 3) { // 3 = HAVE_FUTURE_DATA
          console.log('Buffering audio...');
          await new Promise((resolve) => {
            const onCanPlay = () => {
              el.removeEventListener('canplay', onCanPlay);
              resolve();
            };
            el.addEventListener('canplay', onCanPlay, { once: true });
          });
        }
        
        // Play and handle autoplay restrictions
        const playPromise = el.play();
        
        if (playPromise !== undefined) {
          await playPromise.catch(error => {
            console.error('Playback failed:', error);
            setIsPlaying(false);
          });
        }
      }
    } catch (error) {
      console.error('Playback error:', error);
      setIsPlaying(false);
    }
  }, [track, isPlaying]);

  if (isLoading) {
    return <div className="loading-container">Loading...</div>;
  }

  if (!track) {
    return null; // Will redirect from useEffect
  }
  
  // Debug log to check if showMusicPlayer is being set correctly
  console.log('showMusicPlayer:', showMusicPlayer);

  return (
    <div className="home-layout">
      <Navbar />
      <div className="home-body">
        <aside className="home-sidebar">
          <SideBar />
        </aside>
        <section className="home-main" style={{ background: backgroundGradient }}>
          <div className="content-wrapper">
          <div className="music-container">
            <img src={track.imgsrc} alt="music" className="music-image" />
            <div className="music-details">
              <h1 className="heading">{track.heading}</h1>
              <h2>{track.subheading}</h2>
            </div>
          </div>
          <div className="player-row" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px' }}>
            <button onClick={togglePlay} aria-label={isPlaying ? 'Pause' : 'Play'} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
              {!isPlaying ? (
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M7.05 3.606l13.49 7.788a.7.7 0 010 1.212L7.05 20.394A.7.7 0 016 19.788V4.212a.7.7 0 011.05-.606z"></path></svg>
              ) : (
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M6 5h4v14H6zM14 5h4v14h-4z"></path></svg>
              )}
            </button>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: '#1DB954', fontWeight: 600, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {track?.songName || currentEle.songName || currentEle.heading}
              </div>
              <div style={{ color: '#b3b3b3', fontSize: 12, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {currentEle.subheading}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button aria-label="Add" style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M11 2.75A.75.75 0 0111.75 3.5v7.75H20a.75.75 0 010 1.5h-7.25V21a.75.75 0 01-1.5 0v-7.25H4a.75.75 0 010-1.5h7.25V3.5a.75.75 0 01.75-.75z"></path></svg>
              </button>
              <div style={{ color: '#b3b3b3', fontSize: 14, minWidth: '40px' }}>
                {fmt(duration)}
              </div>
            </div>
            <button aria-label="More" style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M3 12a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm9 0a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm9 0a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"></path></svg>
            </button>
          </div>

          {/* Audio elements and other components */}
          <div style={{ display: 'none' }}>
            {track?.music && (
              <audio
                key={track.music}
                ref={audioRef}
                src={track.music}
                preload="metadata"
                onError={(e) => {
                  console.error('Audio loading error:', e);
                  setTrack(prev => prev ? { ...prev, error: true } : null);
                }}
                onLoadedMetadata={(e) => {
                  console.log('Audio metadata loaded', e);
                  setDuration(e.target.duration);
                  setTrack(prev => prev ? { ...prev, isLoaded: true } : null);
                }}
                onCanPlay={(e) => {
                  console.log('Audio can play', e);
                  setDuration(e.target.duration);
                }}
                onWaiting={() => {
                  console.log('Audio waiting/buffering...');
                }}
                onPlaying={() => {
                  console.log('Audio playing');
                  setIsPlaying(true);
                }}
                onPause={() => {
                  console.log('Audio paused');
                  setIsPlaying(false);
                }}
              />
            )}
            
            {track?.error && (
              <div style={{ color: 'red', padding: '10px' }}>
                Failed to load audio for this track.
              </div>
            )}
          </div>
          </div>
        </section>
      </div>
      {showMusicPlayer && track && (
        <MusicPlayerBar
          currentSong={{
            ...track,
            heading: track.heading || '',
            songName: track.songName || ''
          }}
          onClose={() => setShowMusicPlayer(false)}
          audioRef={audioRef}
          isPlaying={isPlaying}
          onPlayPause={togglePlay}
        />
      )}
    </div>
  );
};

export default SpecificMusicPage;