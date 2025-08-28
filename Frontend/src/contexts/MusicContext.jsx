import React, { createContext, useState, useContext, useEffect } from 'react';
import { fetchTrending } from '../Config/config';

export const MusicContext = createContext(null);

export const MusicProvider = ({ children }) => {
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [trendingSongs, setTrendingSongs] = useState([]);
  const [playbackQueue, setPlaybackQueue] = useState([]);
  const [isShuffled, setIsShuffled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const audioRef = React.useRef(null);

  // Fetch all trending songs
  useEffect(() => {
    const fetchAllTrendingSongs = async () => {
      try {
        setIsLoading(true);
        const data = await fetchTrending();
        if (Array.isArray(data)) {
          setTrendingSongs(data);
          setPlaybackQueue([...data]); // Initialize playback queue with original order
        }
      } catch (err) {
        console.error('Error fetching trending songs:', err);
        setError('Failed to load trending songs');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllTrendingSongs();
  }, []);

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

  // Get limited number of trending songs for the home page
  const getLimitedTrendingSongs = (limit = 9) => {
    return trendingSongs.slice(0, limit);
  };

  // Toggle shuffle on/off
  const toggleShuffle = () => {
    if (isShuffled) {
      // Reset to original order
      setPlaybackQueue([...trendingSongs]);
    } else {
      // Create a shuffled copy of the songs
      const shuffled = [...trendingSongs];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      setPlaybackQueue(shuffled);
    }
    setIsShuffled(!isShuffled);
  };

  // Play the next song in the queue
  const playNextSong = () => {
    if (playbackQueue.length === 0 || !currentSong) return;
    
    const currentIndex = playbackQueue.findIndex(song => song._id === currentSong._id);
    if (currentIndex === -1) return;
    
    const nextIndex = (currentIndex + 1) % playbackQueue.length;
    playSong(playbackQueue[nextIndex]);
  };

  // Play the previous song in the queue
  const playPreviousSong = () => {
    if (playbackQueue.length === 0 || !currentSong) return;
    
    const currentIndex = playbackQueue.findIndex(song => song._id === currentSong._id);
    if (currentIndex === -1) return;
    
    const prevIndex = (currentIndex - 1 + playbackQueue.length) % playbackQueue.length;
    playSong(playbackQueue[prevIndex]);
  };

  const findCurrentSongIndex = () => {
    if (!currentSong) return -1;
    return playbackQueue.findIndex(song => song._id === currentSong._id);
  };

  return (

    <MusicContext.Provider value={{ 
      currentSong, 
      isPlaying,
      playSong, 
      togglePlayPause,
      audioRef,
      trendingSongs,
      getLimitedTrendingSongs,
      isLoading,
      isShuffled,
      toggleShuffle,
      playNextSong,
      playPreviousSong,
      error
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
