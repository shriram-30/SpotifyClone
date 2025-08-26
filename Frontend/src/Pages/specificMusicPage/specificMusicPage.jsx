import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { FastAverageColor } from 'fast-average-color';
import './specificMusic.css';
import { fetchTrackByName } from '../../Config/config';
import MusicPlayerBar from '../Musicbar/Musicbar';

// Create a single instance of FastAverageColor outside the component
const fac = new FastAverageColor();

const SpecificMusicPage = ({ currentEle }) => {
  // State to hold the dynamic background gradient
  const [backgroundGradient, setBackgroundGradient] = useState('');
  // State to hold the track fetched from backend by name (heading)
  const [track, setTrack] = useState(null);
  // Player states
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [showMusicPlayer, setShowMusicPlayer] = useState(false);

  // Memoize the heading we will query by to avoid unnecessary effects
  const headingToQuery = useMemo(() => currentEle?.heading || '', [currentEle?.heading]);

  useEffect(() => {
    // Check if an image source exists; if not, exit the effect
    if (!currentEle?.imgsrc) return;

    // Use the FastAverageColor library to get the average color from the image URL
    // The library handles fetching the image asynchronously
    fac.getColorAsync(currentEle.imgsrc)
      .then(color => {
        // The result is a color object with a hex property
        const mainColor = color.hex;
        
        // Create a linear gradient using the extracted color and black
        const gradient = `linear-gradient(to right, ${mainColor}, #000000)`;
        
        // Update the state with the new gradient
        setBackgroundGradient(gradient);
      })
      .catch(e => {
        console.error('Error getting color:', e);
        // Fallback to a default gradient on error
        setBackgroundGradient('linear-gradient(to right, #a8a294, #383631)');
      });
  }, [currentEle?.imgsrc]); // The effect re-runs when the image source changes

  // Fetch the track by name (heading) from backend and set up the audio player
  useEffect(() => {
    if (!headingToQuery) return;

    let cancelled = false;
    let audioElement = null;

    const preloadAudio = (url) => {
      return new Promise((resolve) => {
        audioElement = new Audio();
        audioElement.preload = 'auto';
        audioElement.src = url;
        
        const onCanPlayThrough = () => {
          audioElement.removeEventListener('canplaythrough', onCanPlayThrough);
          resolve(true);
        };
        
        const onError = () => {
          audioElement.removeEventListener('error', onError);
          console.error('Error preloading audio:', url);
          resolve(false);
        };
        
        audioElement.addEventListener('canplaythrough', onCanPlayThrough, { once: true });
        audioElement.addEventListener('error', onError, { once: true });
        
        // Start loading
        audioElement.load();
      });
    };

    (async () => {
      console.log(`[Debug] Fetching track for heading: "${headingToQuery}"`);
      try {
        const t = await fetchTrackByName(headingToQuery);
        if (cancelled) return;
        
        console.log('[Debug] Fetched track data from backend:', t);
        
        if (!t) {
          console.error('[Debug] No track data returned from backend');
          if (currentEle) {
            console.log('[Debug] Using currentEle as fallback');
            setTrack({
              ...currentEle,
              music: currentEle.music || currentEle.Music
            });
          }
          return;
        }
        
        const musicUrl = t.music || t.Music;
        if (!musicUrl) {
          console.error('[Debug] No music URL found in track data');
          if (currentEle?.music || currentEle?.Music) {
            console.log('[Debug] Using music URL from currentEle as fallback');
            setTrack({
              ...t,
              music: currentEle.music || currentEle.Music
            });
            return;
          }
          setTrack(t);
          return;
        }
        
        console.log('[Debug] Music URL found, preloading:', musicUrl);
        
        // Preload audio in the background
        preloadAudio(musicUrl).then(success => {
          if (!cancelled && success) {
            console.log('[Debug] Audio preloaded successfully');
            setTrack({
              ...t,
              music: musicUrl,
              isLoaded: true
            });
          }
        });
        
        // Set track immediately for UI, but mark as loading
        setTrack({
          ...t,
          music: musicUrl,
          isLoaded: false
        });
        
      } catch (error) {
        console.error('[Debug] Error fetching track:', error);
        // Fallback to currentEle if available
        if (currentEle) {
          console.log('[Debug] Using currentEle due to fetch error');
          setTrack({
            ...currentEle,
            music: currentEle.music || currentEle.Music
          });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [headingToQuery, currentEle]);

  // Hook up audio element events for metadata (duration) and time updates
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;

    const onLoadedMetadata = () => setDuration(el.duration || 0);
    const onTimeUpdate = () => setCurrentTime(el.currentTime || 0);
    const onEnded = () => setIsPlaying(false);

    el.addEventListener('loadedmetadata', onLoadedMetadata);
    el.addEventListener('timeupdate', onTimeUpdate);
    el.addEventListener('ended', onEnded);
    return () => {
      el.removeEventListener('loadedmetadata', onLoadedMetadata);
      el.removeEventListener('timeupdate', onTimeUpdate);
      el.removeEventListener('ended', onEnded);
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

  return (
    <>
      {/* The main container with the dynamic background style */}
      <div className="music-container" style={{ background: backgroundGradient }}>
        {/* The album art image */}
        <img src={currentEle.imgsrc} alt="music" className="music-image" />
        
        {/* Container for the song details */}
        <div className="music-details">
          {/* Song title */}
          <h1 className="heading">{currentEle.heading}</h1>
          {/* Artist name */}
          <h2>{currentEle.subheading}</h2>
        </div>
      </div>

      {/*
        Spotify-like single row with play button, title (green), artists, plus icon, duration, and kebab menu.
        COMMAND-LINE STYLE EXPLANATION (comments):
        - fetchTrackByName(currentEle.heading)  -> fetch the track document from backend.
        - audio src={track.music}               -> set audio source to the music URL from DB.
        - onClick togglePlay()                  -> play/pause control.
        - fmt(duration)                         -> show m:ss duration once metadata is loaded.
      */}
      <div className="player-row" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px' }}>
        {/* Play/Pause button */}
        <button onClick={togglePlay} aria-label={isPlaying ? 'Pause' : 'Play'} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
          {/* triangle play icon */}
          {!isPlaying ? (
            <svg viewBox="0 0 24 24" width="20" height="20"><path d="M7.05 3.606l13.49 7.788a.7.7 0 010 1.212L7.05 20.394A.7.7 0 016 19.788V4.212a.7.7 0 011.05-.606z"></path></svg>
          ) : (
            <svg viewBox="0 0 24 24" width="20" height="20"><path d="M6 5h4v14H6zM14 5h4v14h-4z"></path></svg>
          )}
        </button>

        {/* Title and artists */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: '#1DB954', fontWeight: 600, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
            {currentEle.heading}
          </div>
          <div style={{ color: '#b3b3b3', fontSize: 12, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
            {currentEle.subheading}
          </div>
        </div>

        {/* Plus icon */}
        <button aria-label="Add" style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
          <svg viewBox="0 0 24 24" width="20" height="20"><path d="M11 2.75A.75.75 0 0111.75 3.5v7.75H20a.75.75 0 010 1.5h-7.25V21a.75.75 0 01-1.5 0v-7.25H4a.75.75 0 010-1.5h7.25V3.5a.75.75 0 01.75-.75z"></path></svg>
        </button>

        {/* Duration */}
        <div style={{ width: 40, textAlign: 'right', color: '#b3b3b3', fontSize: 12 }}>
          {fmt(duration)}
        </div>

        {/* Kebab menu */}
        <button aria-label="More" style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
          <svg viewBox="0 0 24 24" width="18" height="18"><path d="M3 12a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm9 0a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm9 0a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"></path></svg>
        </button>
      </div>

      {/* Audio element with optimized loading */}
      <div style={{ display: 'none' }}>
        {track?.music && (
          <audio
            key={track.music}
            ref={audioRef}
            src={track.music}
            preload="auto"
            onError={(e) => {
              console.error('Audio loading error:', e);
              console.error('Failed to load audio from:', track.music);
              // Update track to reflect error state
              setTrack(prev => prev ? { ...prev, error: true } : null);
            }}
            onLoadedMetadata={() => {
              console.log('Audio metadata loaded for:', track.music);
              console.log('Duration:', audioRef.current?.duration);
              // Update track to reflect loaded state
              setTrack(prev => prev ? { ...prev, isLoaded: true } : null);
            }}
            onWaiting={() => {
              console.log('Audio waiting/buffering...');
            }}
            onPlaying={() => {
              console.log('Audio started playing');
              setIsPlaying(true);
            }}
            onPause={() => {
              console.log('Audio paused');
              setIsPlaying(false);
            }}
          />
        )}
      </div>
      
      {/* Loading indicator */}
      {track?.music && !track.isLoaded && (
        <div style={{ padding: '10px', color: '#b3b3b3' }}>
          Loading audio...
        </div>
      )}
      
      {/* Error message */}
      {track?.error && (
        <div style={{ color: 'red', padding: '10px' }}>
          Failed to load audio for this track.
        </div>
      )}

      {/* Music Player Bar */}
      {showMusicPlayer && track && (
        <MusicPlayerBar 
          currentSong={track}
          onClose={() => setShowMusicPlayer(false)}
          audioRef={audioRef}
          isPlaying={isPlaying}
          onPlayPause={togglePlay}
        />
      )}
    </>
  );
};

export default SpecificMusicPage;