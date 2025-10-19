import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { fetchTrending } from '../Config/config';

export const MusicContext = createContext(null);

export const MusicProvider = ({ children }) => {
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [trendingSongs, setTrendingSongs] = useState([]);
  const [playbackQueue, setPlaybackQueue] = useState([]);
  const [currentPlaylist, setCurrentPlaylist] = useState([]);
  const [currentPlaylistIndex, setCurrentPlaylistIndex] = useState(0);
  const [isShuffled, setIsShuffled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const audioRef = useRef(null);

  // Fetch trending songs
  useEffect(() => {
    const fetchAllTrendingSongs = async () => {
      try {
        setIsLoading(true);
        const data = await fetchTrending();
        if (Array.isArray(data)) {
          setTrendingSongs(data);
          setPlaybackQueue([...data]);
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

    if (!audioRef.current) return;

    const audio = audioRef.current;
    let isMounted = true;

    // Remove any previous listeners
    audio.replaceWith(audio.cloneNode(true));
    audioRef.current = document.querySelector('audio');
    audioRef.current.src = song.music;
    audioRef.current.load();

    const handleCanPlay = () => {
      if (!isMounted) return;
      audioRef.current
        .play()
        .then(() => console.log('Playback started successfully'))
        .catch((e) => console.error('Playback failed:', e));

      audioRef.current.removeEventListener('canplay', handleCanPlay);
    };

    audioRef.current.addEventListener('canplay', handleCanPlay);

    // Cleanup if component unmounts or song changes
    return () => {
      isMounted = false;
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current.load();
      }
    };
  };

  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((e) => console.error('Playback failed:', e));
    }
    setIsPlaying(!isPlaying);
  };

  const getLimitedTrendingSongs = (limit = 9) => trendingSongs.slice(0, limit);

  const toggleShuffle = () => {
    if (isShuffled) {
      setPlaybackQueue(currentPlaylist.length > 0 ? [...currentPlaylist] : [...trendingSongs]);
    } else {
      const songsToShuffle = currentPlaylist.length > 0 ? [...currentPlaylist] : [...trendingSongs];
      const shuffled = [...songsToShuffle];

      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }

      if (currentSong) {
        const idx = shuffled.findIndex((s) => s._id === currentSong._id);
        if (idx > 0) [shuffled[0], shuffled[idx]] = [shuffled[idx], shuffled[0]];
      }

      setPlaybackQueue(shuffled);
    }
    setIsShuffled(!isShuffled);
  };

  const playNextSong = () => {
    const activePlaylist = currentPlaylist.length > 0 ? currentPlaylist : playbackQueue;
    if (!currentSong || activePlaylist.length === 0) return;

    let idx = activePlaylist.findIndex((s) => s._id === currentSong._id);
    if (idx === -1) return;

    const nextIdx = (idx + 1) % activePlaylist.length;
    playSong(activePlaylist[nextIdx]);
  };

  const playPreviousSong = () => {
    const activePlaylist = currentPlaylist.length > 0 ? currentPlaylist : playbackQueue;
    if (!currentSong || activePlaylist.length === 0) return;

    const audio = audioRef.current;
    if (audio && audio.currentTime > 2) {
      audio.currentTime = 0;
      audio.play().catch(console.error);
      return;
    }

    let idx = activePlaylist.findIndex((s) => s._id === currentSong._id);
    if (idx === -1) return;

    const prevIdx = (idx - 1 + activePlaylist.length) % activePlaylist.length;
    playSong(activePlaylist[prevIdx]);
  };

  const setPlaylist = (songs, startIndex = 0) => {
    if (!Array.isArray(songs)) {
      console.error('setPlaylist: Expected an array of songs');
      return;
    }

    setCurrentPlaylist(songs);
    setCurrentPlaylistIndex(startIndex);

    if (songs.length > 0 && startIndex >= 0 && startIndex < songs.length) {
      playSong(songs[startIndex]);
    }
  };

  return (
    <MusicContext.Provider
      value={{
        currentSong,
        isPlaying,
        trendingSongs,
        playbackQueue,
        currentPlaylist,
        currentPlaylistIndex,
        isShuffled,
        isLoading,
        error,
        audioRef,
        playSong,
        togglePlayPause,
        playNextSong,
        playPreviousSong,
        toggleShuffle,
        setCurrentPlaylist: setPlaylist,
        getLimitedTrendingSongs,
      }}
    >
      {children}
      <audio
        ref={audioRef}
        style={{ display: 'none' }}
        onEnded={() => setIsPlaying(false)}
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
      />
    </MusicContext.Provider>
  );
};

export const useMusic = () => {
  const context = useContext(MusicContext);
  if (!context) throw new Error('useMusic must be used within a MusicProvider');
  return context;
};
