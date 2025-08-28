import React, { useEffect, useRef, useState } from 'react';
import { useMusic } from '../../contexts/MusicContext';

const MusicBar = () => {
  // State and refs
  const { currentSong, isPlaying, togglePlayPause, audioRef } = useMusic();
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(70);
  const [isMuted, setIsMuted] = useState(false);
  const progressBarRef = useRef(null);

  // Styles
  const playerBarStyle = {
    backgroundColor: '#181818',
    borderTop: '1px solid #282828',
    height: '90px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 16px',
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    transform: currentSong ? 'translateY(0)' : 'translateY(100%)',
    transition: 'transform 0.3s ease-in-out'
  };

  const leftSectionStyle = {
    width: '30%',
    minWidth: '180px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  };

  const centerSectionStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    flex: 1,
    maxWidth: '722px'
  };

  const rightSectionStyle = {
    width: '30%',
    minWidth: '180px',
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: '8px'
  };

  const controlButtonStyle = {
    background: 'none',
    border: 'none',
    color: '#b3b3b3',
    cursor: 'pointer',
    padding: '8px',
    '&:hover': { color: 'white' }
  };

  const playPauseButtonStyle = {
    background: 'white',
    border: 'none',
    borderRadius: '50%',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    margin: '0 16px',
    '&:hover': { transform: 'scale(1.05)' }
  };

  const progressBarStyle = {
    flex: 1,
    height: '4px',
    backgroundColor: '#404040',
    borderRadius: '2px',
    cursor: 'pointer',
    position: 'relative',
    overflow: 'hidden'
  };

  const timeStyle = {
    color: '#a7a7a7',
    fontSize: '11px',
    minWidth: '40px',
    textAlign: 'center'
  };

  // Progress fill style that depends on state
  const progressFillStyle = {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#b3b3b3',
    width: `${(currentTime / duration) * 100}%`,
    '&:hover': { backgroundColor: '#1db954' }
  };
  
  // Debug log when currentSong changes
  useEffect(() => {
    console.log('MusicBar - Current song:', currentSong);
    console.log('MusicBar - isPlaying:', isPlaying);
  }, [currentSong, isPlaying]);

  // Effect for time updates and duration changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };
    
    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('durationchange', updateDuration);
    audio.addEventListener('canplay', updateDuration);

    updateTime();
    updateDuration();

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('durationchange', updateDuration);
      audio.removeEventListener('canplay', updateDuration);
    };
  }, [currentSong, audioRef]);

  // Handle volume changes
  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100;
      setIsMuted(newVolume === 0);
    }
  };

  // Toggle mute/unmute
  const toggleMute = () => {
    if (!audioRef.current) return;
    if (isMuted) {
      audioRef.current.volume = volume / 100;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  // Handle seek on progress bar
  const handleSeek = (e) => {
    if (!audioRef.current || !progressBarRef.current) return;
    const progressBar = progressBarRef.current;
    const clickPosition = e.nativeEvent.offsetX;
    const progressBarWidth = progressBar.clientWidth;
    const seekPosition = (clickPosition / progressBarWidth) * duration;
    audioRef.current.currentTime = seekPosition;
    setCurrentTime(seekPosition);
  };

  // Format time (seconds to MM:SS)
  const formatTime = (time) => {
    if (isNaN(time) || time === null) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Don't render anything if no song is selected
  if (!currentSong) return null;


  return (
    <div style={playerBarStyle}>
      {/* Left section - Track info */}
      <div style={leftSectionStyle}>
        <img 
          src={currentSong.imgsrc || 'https://via.placeholder.com/56'} 
          alt="Album Cover" 
          style={{
            width: '56px',
            height: '56px',
            objectFit: 'cover'
          }}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://via.placeholder.com/56';
          }}
        />
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          minWidth: 0
        }}>
          <span style={{
            color: 'white',
            fontSize: '14px',
            fontWeight: 500,
            marginBottom: '4px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }} title={currentSong.title || 'Unknown Track'}>
            {currentSong.title || 'Unknown Track'}
          </span>
          <span style={{
            color: '#b3b3b3',
            fontSize: '12px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }} title={currentSong.artist || 'Unknown Artist'}>
            {currentSong.artist || 'Unknown Artist'}
          </span>
        </div>
      </div>

      {/* Center section - Playback controls */}
      <div style={centerSectionStyle}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '8px'
        }}>
          <button style={controlButtonStyle}>
            <svg role="img" height="16" width="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M13.151.922a.75.75 0 10-1.06 1.06L13.109 3H11.16a3.75 3.75 0 00-2.873 1.34l-6.173 7.356A2.25 2.25 0 01.39 12.5H0V14h.391a3.75 3.75 0 002.873-1.34l6.173-7.356a2.25 2.25 0 011.724-.804h1.947l-1.017 1.018a.75.75 0 001.06 1.06L15.98 3.75 13.15.922zM.391 12.5H0v-1h.391c1.109 0 2.16-.49 2.873-1.34l6.173-7.356A2.25 2.25 0 0111.16 4h1.947l-1.017 1.018a.75.75 0 101.06 1.06L15.98 3.75 13.15.922a.75.75 0 00-1.06 1.06L13.11 3H11.16a3.75 3.75 0 00-2.873 1.34l-6.173 7.356A2.25 2.25 0 01.39 12.5z"></path>
            </svg>
          </button>
          <button style={controlButtonStyle}>
            <svg role="img" height="16" width="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M12.7 1a.7.7 0 00-.7.7v5.15L2.05 1.107A.7.7 0 001 1.712v12.575a.7.7 0 001.05.607L12 9.149V14.3a.7.7 0 00.7.7h1.6a.7.7 0 00.7-.7V1.7a.7.7 0 00-.7-.7h-1.6z"></path>
            </svg>
          </button>
          <button onClick={togglePlayPause} style={playPauseButtonStyle}>
            {isPlaying ? (
              <svg role="img" height="16" width="16" viewBox="0 0 16 16" fill="black">
                <path d="M2.7 1a.7.7 0 00-.7.7v12.6a.7.7 0 00.7.7h2.6a.7.7 0 00.7-.7V1.7a.7.7 0 00-.7-.7H2.7zm8 0a.7.7 0 00-.7.7v12.6a.7.7 0 00.7.7h2.6a.7.7 0 00.7-.7V1.7a.7.7 0 00-.7-.7h-2.6z"></path>
              </svg>
            ) : (
              <svg role="img" height="16" width="16" viewBox="0 0 16 16" fill="black" style={{ marginLeft: '2px' }}>
                <path d="M3 1.713a.7.7 0 011.05-.607l10.89 6.288a.7.7 0 010 1.212L4.05 14.894A.7.7 0 013 14.288V1.713z"></path>
              </svg>
            )}
          </button>
          <button style={controlButtonStyle}>
            <svg role="img" height="16" width="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M3.3 1a.7.7 0 01.7.7v5.15l9.95-5.744a.7.7 0 011.05.606v12.575a.7.7 0 01-1.05.607L4 9.149V14.3a.7.7 0 01-.7.7H1.7a.7.7 0 01-.7-.7V1.7a.7.7 0 01.7-.7h1.6z"></path>
            </svg>
          </button>
          <button style={controlButtonStyle}>
            <svg role="img" height="16" width="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M0 4.75A3.75 3.75 0 013.75 1h8.5A3.75 3.75 0 0116 4.75v5a3.75 3.75 0 01-3.75 3.75H9.81l1.018 1.018a.75.75 0 11-1.06 1.06L6.939 12.75l2.829-2.828a.75.75 0 111.06 1.06L9.811 12h2.439a2.25 2.25 0 002.25-2.25v-5a2.25 2.25 0 00-2.25-2.25h-8.5A2.25 2.25 0 001.5 4.75v5A2.25 2.25 0 003.75 12H5v1.5H3.75A3.75 3.75 0 010 9.75v-5z"></path>
            </svg>
          </button>
        </div>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          gap: '8px',
          maxWidth: '600px'
        }}>
          <span style={timeStyle}>
            {formatTime(currentTime)}
          </span>
          <div 
            style={progressBarStyle}
            ref={progressBarRef}
            onClick={handleSeek}
          >
            <div style={progressFillStyle} />
          </div>
          <span style={timeStyle}>
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Right section - Volume controls */}
      <div style={rightSectionStyle}>
        <button 
          onClick={toggleMute}
          style={controlButtonStyle}
        >
          <svg role="presentation" height="16" width="16" viewBox="0 0 16 16" fill="currentColor">
            {isMuted || volume === 0 ? (
              <path d="M13.86 5.47a.75.75 0 00-1.061 0l-1.47 1.47-1.47-1.47A.75.75 0 008.8 6.53L10.269 8l-1.47 1.47a.75.75 0 101.06 1.06l1.47-1.47 1.47 1.47a.75.75 0 001.06-1.06L12.39 8l1.47-1.47a.75.75 0 000-1.06z"></path>
            ) : volume < 30 ? (
              <path d="M1.5 6a.75.75 0 00-1.5 0v4a.75.75 0 001.5 0V6zm3.5-4v12h1.5V2H5z"></path>
            ) : (
              <path d="M9.741.85a.75.75 0 01.375.65v13a.75.75 0 01-1.125.65l-6.925-4a3.642 3.642 0 01-1.33-4.967 3.639 3.639 0 011.33-1.332l6.925-4a.75.75 0 01.75 0zm-6.924 5.3a2.139 2.139 0 000 3.7l5.8 3.35V2.8l-5.8 3.35zm8.683 4.29V5.56a2.75 2.75 0 010 4.88z"></path>
            )}
          </svg>
        </button>
        <div style={{ width: '100px' }}>
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            style={{
              width: '100%',
              height: '4px',
              WebkitAppearance: 'none',
              backgroundColor: '#404040',
              borderRadius: '2px',
              outline: 'none',
              cursor: 'pointer'
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default MusicBar;