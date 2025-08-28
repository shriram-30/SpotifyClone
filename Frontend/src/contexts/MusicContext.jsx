import React, { createContext, useState, useContext } from 'react';

const MusicContext = createContext(null);

export const MusicProvider = ({ children }) => {
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = React.useRef(null);

  const playSong = (song) => {
    console.log('Playing song:', song);
    setCurrentSong(song);
    setIsPlaying(true);
    // Small delay to ensure audio element is in the DOM
    setTimeout(() => {
      if (audioRef.current) {
        console.log('Audio element found, attempting to play...');
        audioRef.current.src = song.music;
        audioRef.current.play()
          .then(() => console.log('Playback started successfully'))
          .catch(e => console.error("Playback failed:", e));
      } else {
        console.error('Audio ref is not available');
      }
    }, 100);
  };

  const togglePlayPause = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => console.error("Playback failed:", e));
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <MusicContext.Provider value={{ 
      currentSong, 
      isPlaying,
      playSong, 
      togglePlayPause,
      audioRef
    }}>
      {children}
      {/* Hidden audio element */}
      {currentSong && (
        <audio
          ref={audioRef}
          src={currentSong.music}
          onEnded={() => setIsPlaying(false)}
          onPause={() => setIsPlaying(false)}
          onPlay={() => setIsPlaying(true)}
          style={{ display: 'none' }}
        />
      )}
    </MusicContext.Provider>
  );
};

export const useMusic = () => {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
};
