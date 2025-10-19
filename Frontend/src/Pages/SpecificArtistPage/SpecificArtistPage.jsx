import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaPlay, FaPause, FaArrowLeft, FaInstagram, FaYoutube, FaRandom } from 'react-icons/fa';
import './SpecificArtistPage.css';
import Navbar from '../../Components/Navbar/Navbar';
import SideBar from '../../Components/Sidebar/SideBar';
import { useMusic } from '../../contexts/MusicContext';
import CanvasPlayer from '../../Components/CanvasPlayer/CanvasPlayer';

const SpecificArtistPage = () => {
  const { artistId } = useParams();
  const navigate = useNavigate();
  
  // Get music context first
  const { 
    currentSong, 
    isPlaying, 
    playSong, 
    setCurrentPlaylist,
    togglePlayPause,
    currentPlaylist
  } = useMusic();
  
  const [artist, setArtist] = useState(null);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Show canvas by default for quick inspection; change to false to hide by default
  const [showCanvas, setShowCanvas] = useState(true);
  
  // Effect to handle canvas visibility based on current song
  useEffect(() => {
    console.log('SpecificArtistPage: currentSong changed ->', currentSong);
    // When a song is selected, always show the canvas panel so the player appears.
    // If the song has no canvasUrl, we'll pass a null imageUrl so the CanvasPlayer renders
    // the black fallback background instead of the artist/image.
    if (currentSong) {
      if (currentSong?.canvasUrl) {
        console.log('Current song has canvas URL:', currentSong.canvasUrl);
      } else {
        console.log('Current song has NO canvasUrl - will show black fallback in CanvasPlayer');
      }
      setShowCanvas(true);
      localStorage.setItem('showCanvas', 'true');
    } else {
      console.log('No currentSong - hiding canvas');
      setShowCanvas(false);
      localStorage.setItem('showCanvas', 'false');
    }
  }, [currentSong]);

  // Log showCanvas toggles for debugging
  useEffect(() => {
    console.log('SpecificArtistPage: showCanvas is now ->', showCanvas);
  }, [showCanvas]);

  const formatDuration = (ms) => {
    if (!ms && ms !== 0) return '0:00';
    // If it's already in MM:SS format, return as is
    if (typeof ms === 'string' && ms.includes(':')) return ms;
    
    // Convert string numbers to actual numbers
    const milliseconds = typeof ms === 'string' ? parseInt(ms, 10) : ms;
    if (isNaN(milliseconds)) return '0:00';
    
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = ((milliseconds % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const fetchArtistSongs = async (artistName) => {
    try {
      // Fetch artist's songs
      const songsRes = await fetch(`http://localhost:5000/api/artists/${encodeURIComponent(artistName)}/songs`);
      if (!songsRes.ok) return [];
      
      const songsData = await songsRes.json();
      console.log('songsData is', songsData);
      return (songsData.songs || []).map(song => ({
        ...song,
        duration: song.duration,
        // normalize canvasUrl from possible backend keys
        canvasUrl: song.canvasUrl || song.canvasurl || song.canvas || null,
        source: 'artist_albums'
       
      }));
      
      
      
    } catch (error) {
      console.error('Error fetching artist songs:', error);
      return [];
    }
  };

  const fetchTrendingSongs = async (artistName) => {
    try {
      console.log('Fetching trending songs for artist:', artistName);
      const response = await fetch(`http://localhost:5000/api/music/trending-songs`);
      if (!response.ok) {
        console.error('Failed to fetch trending songs:', response.status);
        return [];
      }
      
      const result = await response.json();
      console.log('Raw trending songs response:', result);
      
      // Handle the response format: { success: true, data: [...] }
      const songs = result.data || [];
      console.log('Trending songs array:', songs);
      
      if (!Array.isArray(songs)) {
        console.error('Unexpected trending songs data format:', result);
        return [];
      }
      
      // Check if artist name appears anywhere in the subheading
      const filteredSongs = songs.filter(song => {
        if (!song || !song.subheading) return false;
        // Check if artist name appears anywhere in the subheading
        const subheadingLower = song.subheading.toLowerCase();
        const artistNameLower = artistName.toLowerCase();
        const matches = subheadingLower.includes(artistNameLower);
        console.log('Song:', song.songName, 'Subheading:', song.subheading, 'matches:', matches);
        return matches;
      });
      
      console.log('Filtered trending songs:', filteredSongs);
      
      return filteredSongs.map(song => {
        // For trending songs, extract duration from the music URL
        // Example: '/music/12345/128' -> 128 seconds
        let duration = '0:00';
        let musicUrl = song.music || song.url || '';
        
        if (musicUrl) {
          // Extract the last number in the URL which represents duration in seconds
          const durationMatch = musicUrl.match(/\/(\d+)(?:\.\w+)?(?:\?.*)?$/);
          if (durationMatch && durationMatch[1]) {
            const seconds = parseInt(durationMatch[1]);
            duration = formatDuration(seconds * 1000); // Convert to milliseconds for formatDuration
          }
        }
        
        // Ensure the music URL is a full URL if it's a path
        if (musicUrl && !musicUrl.startsWith('http') && !musicUrl.startsWith('blob:')) {
          musicUrl = `http://localhost:5000${musicUrl.startsWith('/') ? '' : '/'}${musicUrl}`;
        }
        
        return {
          _id: song._id || Math.random().toString(36).substr(2, 9),
          title: song.songName || song.title || 'Unknown Track',
          artists: song.subheading ? song.subheading.split('•')[0]?.trim() : 'Unknown Artist',
          image: song.imgsrc || song.image || 'https://via.placeholder.com/300',
          music: musicUrl, // Ensure music URL is set
          canvasUrl: song.canvasUrl || song.canvasurl || song.canvas || null, // Add canvas URL from trending songs
          source: 'trending',
duration: duration,
          rawDuration: duration, // Store the formatted duration
          // Store the original music URL for reference
          originalUrl: song.music || song.url
        };
      });
    } catch (error) {
      console.error('Error fetching trending songs:', error);
      return [];
    }
  };

  useEffect(() => {
    const fetchArtist = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch artist details
        const artistResponse = await fetch(`http://localhost:5000/api/artists/${artistId}`);
        if (!artistResponse.ok) throw new Error('Failed to fetch artist');
        const artistData = await artistResponse.json();
        const artistName = artistData.artist.name;
        setArtist(artistData.artist);

        // Fetch both artist's songs and trending songs in parallel
        const [artistSongs, trendingSongs] = await Promise.all([
          fetchArtistSongs(artistName),
          fetchTrendingSongs(artistName)
        ]);

        console.log('Artist songs:', artistSongs);
        console.log('Trending songs:', trendingSongs);

        console.log('Artist songs before combining:', artistSongs);
        console.log('Trending songs before combining:', trendingSongs);
        
        // Helper function to normalize text for comparison
        const normalizeText = (text) => {
          return (text || '').toLowerCase().trim().replace(/\s+/g, ' ');
        };

        // Helper function to create a unique key for each song
        const getSongKey = (song) => {
          if (!song) return '';
          const title = normalizeText(song.title);
          let artists = '';
          
          if (typeof song.artists === 'string') {
            // Handle case where artists is a string (e.g., "Artist1, Artist2")
            artists = song.artists.split(',')
              .map(a => normalizeText(a))
              .filter(a => a) // Remove empty strings
              .sort()
              .join(',');
          } else if (Array.isArray(song.artists)) {
            // Handle case where artists is an array
            artists = [...new Set(song.artists)] // Remove duplicates
              .map(a => normalizeText(a))
              .filter(a => a) // Remove empty strings
              .sort()
              .join(',');
          }
          
          // Create a key that combines title and artists
          return `${title}__${artists}`;
        };

        // Combine all songs
        const allSongs = [...artistSongs];
        
        // Create a map of existing song keys for O(1) lookups
        const existingKeys = new Map();
        artistSongs.forEach(song => {
          const key = getSongKey(song);
          existingKeys.set(key, true);
        });
        
        // Add trending songs if they're not duplicates
        trendingSongs.forEach(song => {
          if (!song || !song.title) return;
          
          const songKey = getSongKey(song);
          console.log('Processing song:', song.title, 'artists:', song.artists, 'key:', songKey);
          
          if (!existingKeys.has(songKey)) {
            allSongs.push(song);
            existingKeys.set(songKey, true);
          } else {
            console.log('Skipping duplicate song:', song.title, 'with artists:', song.artists);
          }
        });

        setSongs(allSongs);
      } catch (err) {
        setError(err.message || 'Failed to load artist.');
      } finally {
        setLoading(false);
      }
    };

    fetchArtist();
  }, [artistId]);

  const handlePlayArtist = useCallback(() => {
    if (!songs.length) return;
    
    // If already playing from this artist, just toggle play/pause
    if (currentSong && songs.some(s => s._id === currentSong._id)) {
      togglePlayPause();
    } else {
      // Prepare the songs with required properties
      const preparedSongs = songs.map(s => ({
        ...s,
        music: s.music || s.url,
        title: s.title || 'Unknown Track',
        artists: s.artists || 'Unknown Artist',
        image: s.image || s.coverImage || 'https://via.placeholder.com/300'
      }));
      
      console.log('Playing artist playlist:', preparedSongs);
  // Hide canvas when starting full artist playback (same behaviour as albums)
  setShowCanvas(false);
  setCurrentPlaylist(preparedSongs, 0);
  playSong(preparedSongs[0]);
    }
  }, [songs, currentSong, playSong, setCurrentPlaylist, togglePlayPause]);

  const handlePlaySong = useCallback((song, index) => {
    console.log('Playing song:', song);
    // If clicking the currently playing song, toggle play/pause
    if (currentSong?._id === song._id) {
      togglePlayPause();
      return;
    }

    // Ensure the song object has all required properties
    const songToPlay = {
      ...song,
      _id: song._id || `song-${Date.now()}`,
      music: song.music || song.url,
      title: song.title || 'Unknown Track',
      artists: song.artists || 'Unknown Artist',
      image: song.image || song.imageUrl || song.coverImage || song.album?.imageUrl || 'https://via.placeholder.com/300',
      canvasUrl: song.canvasUrl || null
    };
    
    console.log('Prepared song to play:', songToPlay);
    
    // Set the playlist first
    const preparedSongs = songs.map(s => ({
      ...s,
      _id: s._id || `song-${Date.now()}`,
      music: s.music || s.url,
      title: s.title || 'Unknown Track',
      artists: s.artists || 'Unknown Artist',
      image: s.image || s.coverImage || 'https://via.placeholder.com/300',
      canvasUrl: s.canvasUrl || null
    }));
    
  setCurrentPlaylist(preparedSongs, index);
  // Show canvas when playing a specific song (match SpecificAlbumPage behavior)
  setShowCanvas(true);
  localStorage.setItem('showCanvas', true);

  // Then play the song - this will trigger the useEffect that shows the canvas
  playSong(songToPlay);
  }, [currentSong, songs, playSong, setCurrentPlaylist, togglePlayPause]);

  if (loading) {
    return (
      <div className="specific-artist-loading">
        <div className="specific-artist-loading-spinner"></div>
        <p>Loading artist...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="specific-artist-error">
        <h2>Error</h2>
        <p>{error}</p>
        <button className="specific-artist-retry-button" onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="specific-artist-not-found">
        <h2>Artist not found</h2>
        <button className="specific-artist-back-button" onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  if (loading) return <div className="loading">Loading artist...</div>;
  if (error) return <div className="error">Error: {error.message}</div>;
  if (!artist) return <div className="error">Artist not found</div>;

  return (
    <div className="specific-artist-page">
      <div className="specific-artist-navbar">
        <Navbar />
      </div>
  <div className={`specific-artist-content-wrapper ${showCanvas ? 'with-canvas' : ''}`}>
        <div className="specific-artist-sidebar">
          <SideBar />
        </div>
        <div className="specific-artist-main">
          {/* Artist Header */}
          <div className="specific-artist-header">
            <div 
              className="specific-artist-bg"
              style={{
                backgroundImage: `url(${artist.coverimg || 'https://via.placeholder.com/1200x400'})`,
              }}
            >
              <div className="specific-artist-overlay">
                <div className="specific-artist-header-content">
                  <div className="specific-artist-info">
                    <span className="specific-artist-type">Artist</span>
                    <h1>{artist.name || 'Artist Name'}</h1>
                    
                    {artist.bio && (
                      <div className="specific-artist-bio">
                        <p>{artist.bio}</p>
                      </div>
                    )}
                    
                    {artist.genres && (
                      <div className="specific-artist-genres">
                        <div className="genre-tags">
                          {artist.genres.split(',').map((genre, index) => (
                            <span key={index} className="genre-tag">{genre.trim()}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {(artist.sociallinks?.instagram || artist.sociallinks?.youtube) && (
                      <div className="specific-artist-social">
                        
                        <div className="social-links">
                          {artist.sociallinks.instagram && (
                            <a 
                              href={artist.sociallinks.instagram} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="social-link"
                              title="Instagram"
                            >
                              <FaInstagram className="social-icon" />
                            </a>
                          )}
                          {artist.sociallinks.youtube && (
                            <a 
                              href={artist.sociallinks.youtube} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="social-link"
                              title="YouTube"
                            >
                              <FaYoutube className="social-icon" />
                            </a>
                          )}
                        </div>
                        <div className="artist-actions">
              <button 
                className="play-button"
                onClick={handlePlayArtist}
              >
                {isPlaying && currentSong?.artistId === artistId ? <FaPause /> : <FaPlay />}
                {isPlaying && currentSong?.artistId === artistId ? ' Pause' : ' Play'}
              </button>
            </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tracks Section */}
          <div className="specific-artist-tracks">
            <div className="tracks-header">
              
              <button
                className={`shuffle-play-button ${currentPlaylist?.id === `artist-${artistId}-shuffled` ? 'active' : ''}`}
                onClick={() => {
                  if (songs.length > 0) {
                    // Create a copy of songs to avoid mutating the original array
                    const shuffledSongs = [...songs];
                    
                    // Fisher-Yates shuffle algorithm
                    for (let i = shuffledSongs.length - 1; i > 0; i--) {
                      const j = Math.floor(Math.random() * (i + 1));
                      [shuffledSongs[i], shuffledSongs[j]] = [shuffledSongs[j], shuffledSongs[i]];
                    }
                    
                    // Map the songs with proper metadata
                    const playlist = shuffledSongs.map(song => ({
                      ...song,
                      artist: artist.name,
                      artistId: artist._id,
                      imageUrl: artist.imageUrl
                    }));
                    
                    // Set the shuffled playlist
                    setCurrentPlaylist(playlist, 0);
                    
                    // Play the first song from the shuffled playlist
                    if (playlist.length > 0) {
                      playSong(playlist[0]);
                    }
                  }
                }}
                title="Shuffle Play"
              >
                <FaRandom className="shuffle-icon" />
                
              </button>
            </div>
           
            <div className="specific-artist-tracks-list">
              {songs.length > 0 ? (
                songs.map((song, index) => {
                  const isCurrent = currentSong?._id === song._id;

                return (
                  <div 
                    key={song._id || index} 
                    className={`specific-artist-track-item ${isCurrent ? 'specific-artist-track-active' : ''}`}
                  >
                    <div className="specific-artist-track-number">
                      <button 
                        className="specific-artist-play-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (currentSong?._id === song._id) {
                            togglePlayPause();
                          } else {
                            handlePlaySong(song, index);
                          }
                        }}
                      >
                        {currentSong?._id === song._id && isPlaying ? (
                          <FaPause size={12} />
                        ) : (
                          <FaPlay size={12} />
                        )}
                      </button>
                      <span className="track-number">{index + 1}</span>
                    </div>
                    <div 
                      className="specific-artist-track-details"
                      onClick={() => handlePlaySong(song, index)}
                    >
                      <h4 className="specific-artist-track-title">
                        {song.title}
                      </h4>
                      <p className="specific-artist-track-artist">
                        {song.artists || 'Unknown Artist'}
                      </p>
                    </div>
                    <div className="specific-artist-track-duration">
                      {song.source === 'trending' 
                        ? formatDuration(song.duration || song.rawDuration || '0:00')
                        : (song.duration || '0:00')
                      }
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="specific-artist-no-tracks">No tracks found for this artist</p>
            )}
           
            
          </div>
        </div>
        <div className={`canvas-panel ${showCanvas ? 'visible' : ''}`}>
          <CanvasPlayer 
            videoUrl={currentSong?.canvasUrl || currentSong?.video || null}
            // Pass album image as imageUrl when available, otherwise fall back to artist cover or song image
            imageUrl={
              currentSong?.album?.imageUrl ||
              currentSong?.Album?.imageUrl ||
              artist?.coverimg ||
              currentSong?.image ||
              currentSong?.imgsrc ||
              null
            }
            trackName={currentSong?.title}
            artistName={artist?.name || (currentSong?.artists ? (typeof currentSong.artists === 'string' ? currentSong.artists : Array.isArray(currentSong.artists) ? currentSong.artists.join(', ') : 'Unknown Artist') : 'No Artist')}
            onClose={() => {
              setShowCanvas(false);
              localStorage.setItem('showCanvas', 'false');
            }}
          />
        </div>
      </div>
    </div>
  </div>
);
};

export default SpecificArtistPage;