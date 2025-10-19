import React, { useState, useRef, useEffect } from 'react';
import './navbar.css';
import { FaSearch, FaHome, FaDownload } from 'react-icons/fa';
import { BsSpotify } from 'react-icons/bs';
import { FiBox } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const Navbar = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ songs: [], albums: [], artists: [] });
  const [open, setOpen] = useState(false);
  const debounceRef = useRef(null);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const onDocClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  useEffect(() => {
    if (!query || query.trim().length === 0) {
      setResults({ songs: [], albums: [], artists: [] });
      return;
    }

    // debounce
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const q = query.trim().toLowerCase();
        const searchTerms = q.split(/\s+/).filter(term => term.length > 0);

        // Only search if we have valid search terms
        if (searchTerms.length === 0) {
          setResults({ songs: [], albums: [], artists: [] });
          return;
        }

        // Call the search API to find matching songs
        const tracksRes = await api.get(`/music/tracks/search?q=${encodeURIComponent(q)}`)
          .catch(() => ({ data: { data: [] } }));
        
        // Get artists and albums for the search results
        const [artistsRes, albumsRes] = await Promise.all([
          api.get(`/artists/search?q=${encodeURIComponent(q)}`)
            .catch(() => ({ data: { artists: [] } })),
          api.get(`/music/albums/search?q=${encodeURIComponent(q)}`)
            .catch(() => api.get('/music/albums'))
            .catch(() => ({ data: { data: [] } }))
        ]);

        // Helper function to calculate match score for a string against search terms
        const calculateScore = (text, terms) => {
          if (!text) return 0;
          const textLower = text.toLowerCase();
          return terms.reduce((score, term) => {
            // Higher score for exact matches at start of word
            if (textLower === term) return score + 100;
            if (textLower.startsWith(term)) return score + 10;
            if (textLower.includes(term)) return score + 1;
            return score;
          }, 0);
        };

        // Process and score tracks from search results
        const allSongs = (tracksRes.data?.data || []).map(song => {
          const title = song.title || song.songName || song.heading || '';
          const artist = song.artists?.[0]?.name || song.artist || '';
          const albumName = song.album?.name || song.albumName || '';
          
          return {
            ...song,
            _score: calculateScore(title, searchTerms) * 1.5 +
                   calculateScore(artist, searchTerms) * 0.7 +
                   calculateScore(albumName, searchTerms) * 0.5,
            fromAlbum: song.fromAlbum || false
          };
        });
        
        // Process and score artist songs (fallback if no search results)
        const artistSongs = allSongs.length === 0 ? 
          (await api.get(`/artists/${encodeURIComponent(q)}/songs`)
            .then(res => res.data?.songs || [])
            .catch(() => [])) : [];
            
        const scoredArtistSongs = artistSongs.map(song => ({
          ...song,
          _score: calculateScore(song.title || song.songName || song.heading, searchTerms) * 1.5 +
                 calculateScore(song.artists?.[0]?.name || song.artist, searchTerms) * 0.7
        }));

        // Merge and dedupe songs with scoring
        const seen = new Set();
        const mergedSongs = [];
        
        // Combine all song sources and sort by score
        const combined = [
          ...allSongs,
          ...scoredArtistSongs
        ].sort((a, b) => (b._score || 0) - (a._score || 0));
        
        for (const s of combined) {
          const idKey = s._id || `${(s.title || s.songName || s.heading || '').toString()}::${(s.album?.name || s.album?.albumname || '')}`;
          if (!seen.has(idKey)) {
            seen.add(idKey);
            // Only include songs with some matching score
            if ((s._score || 0) > 0) {
              mergedSongs.push(s);
            }
          }
          if (mergedSongs.length >= 20) break; // Limit results for better performance
        }

        // Sort and limit songs
        const songs = mergedSongs
          .sort((a, b) => (b._score || 0) - (a._score || 0))
          .slice(0, 8);

        // Process and score artists
        const artists = (artistsRes.data?.artists || [])
          .map(artist => ({
            ...artist,
            _score: calculateScore(artist.name, searchTerms) * 2 // Higher weight for artist name
          }))
          .filter(a => a._score > 0)
          .sort((a, b) => b._score - a._score)
          .slice(0, 6);

        // Process and score albums
        const albumsRaw = albumsRes.data?.data || [];
        const albums = albumsRaw
          .map(album => ({
            ...album,
            _score: calculateScore(album.albumname || album.name, searchTerms) * 1.5 + // Higher weight for album name
                   calculateScore(album.artist, searchTerms) * 0.5
          }))
          .filter(a => a._score > 0)
          .sort((a, b) => b._score - a._score)
          .slice(0, 6);

        setResults({ songs, albums, artists });
        setOpen(true);
      } catch (e) {
        console.error('Search error', e);
        setResults({ songs: [], albums: [], artists: [] });
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const onSongClick = async (song) => {
    try {
      // Close search results and clear query immediately for better UX
      setOpen(false);
      setQuery('');
      
      // First, try to get album ID from the song object
      const albumId = song.album?._id || song.albumId;
      const albumName = song.album?.name || song.album?.albumname || song.albumName;
      const artistName = song.artists?.[0]?.name || song.artist;

      // If we have album ID, navigate directly
      if (albumId) {
        navigate(`/album/${albumId}`, { 
          state: { startSong: song },
          replace: true
        });
        return;
      }

      // If we have album name, try to find the album
      if (albumName) {
        try {
          // First try exact match with album name and artist
          let searchUrl = `/music/albums?name=${encodeURIComponent(albumName)}`;
          if (artistName) {
            searchUrl += `&artist=${encodeURIComponent(artistName)}`;
          }
          
          const albumsRes = await api.get(searchUrl);
          
          // If no results, try a broader search
          const albums = albumsRes.data?.data || [];
          let matchedAlbum = albums[0];
          
          // If we have multiple albums, try to find the best match
          if (albums.length > 1 && artistName) {
            matchedAlbum = albums.find(a => 
              (a.artist || '').toLowerCase() === artistName.toLowerCase()
            ) || albums[0];
          }

          if (matchedAlbum) {
            navigate(`/album/${matchedAlbum._id}`, { 
              state: { startSong: song },
              replace: true
            });
            return;
          }
        } catch (e) {
          console.error('Error finding album:', e);
        }
      }

      // If we have a song ID but couldn't find the album, go to track page
      if (song._id) {
        navigate(`/track/${song._id}`, { 
          state: { track: song },
          replace: true 
        });
      } else {
        // Last resort: search for the song
        const searchTerm = [
          song.title || song.songName || song.heading,
          artistName
        ].filter(Boolean).join(' ');
        
        if (searchTerm) {
          navigate(`/search?q=${encodeURIComponent(searchTerm)}`, { 
            replace: true 
          });
        } else {
          navigate('/', { replace: true });
        }
      }
    } catch (e) {
      console.error('Navigation error:', e);
      navigate('/', { replace: true });
    }
  };

  const onAlbumClick = (album) => {
    setOpen(false);
    setQuery('');
    if (album?._id) {
      navigate(`/album/${album._id}`, { 
        replace: true,
        state: { startSong: album.songs?.[0] } // Include first song if available
      });
    } else {
      // Fallback to search if album ID is missing
      const searchTerm = album.albumname || album.name || '';
      if (searchTerm) {
        navigate(`/search?q=${encodeURIComponent(searchTerm)}`, { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    }
  };

  const onArtistClick = (artist) => {
    setOpen(false);
    setQuery('');
    if (artist?._id) {
      navigate(`/artist/${artist._id}`, { state: { artist } });
    } else {
      // Fallback to search if artist ID is missing
      const searchTerm = artist.name || '';
      if (searchTerm) {
        navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
      } else {
        navigate('/');
      }
    }
  };

  return (
    <div className="navbar" ref={containerRef}>
      <div className="nav-left">
        <BsSpotify className="logo" />
        <div className="icon-circle" style={{cursor:'pointer'}}><FaHome onClick={()=>navigate('/home')} /></div>
        <div className="search-bar">
          <FaSearch />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => { if (query) setOpen(true); }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && query.trim()) {
                navigate(`/search?q=${encodeURIComponent(query.trim())}`);
                setOpen(false);
              }
            }}
            type="text"
            placeholder="What do you want to play?"
            aria-label="Search"
          />
          <FiBox />

          {open && (results.songs.length || results.albums.length || results.artists.length) > 0 && (
            <div className="search-results">
              {results.songs.length > 0 && (
                <div className="search-section">
                  <div className="search-section-title">Songs</div>
                  {results.songs.map((s) => {
                    // Get the best available image source, preferring album image if available
                    const imageSource = s.album?.imageUrl || s.albumImage || s.imgsrc || s.image || s.imageUrl || 'https://via.placeholder.com/56';
                    const title = s.songName || s.heading || s.title || 'Unknown Track';
                    const artist = s.subheading || s.artist || 
                                 (s.artists ? 
                                   (Array.isArray(s.artists) ? 
                                     s.artists.map(a => a.name || a).join(', ') : 
                                     (typeof s.artists === 'string' ? s.artists : '')
                                   ) : ''
                                 );
                    
                    return (
                      <div key={s._id} className="search-item" onClick={() => onSongClick(s)}>
                        <img 
                          src={imageSource} 
                          alt={title} 
                          onError={(e) => {
                            e.target.onerror = null; // Prevent infinite loop if placeholder fails
                            e.target.src = 'https://via.placeholder.com/56';
                          }} 
                        />
                        <div className="search-item-text">
                          <div className="search-item-title">{title}</div>
                          <div className="search-item-sub">{artist}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

                <div className="search-more" style={{ padding: '6px 8px' }}>
                  <button 
                    className="see-all-btn" 
                    onClick={(e) => { 
                      e.stopPropagation();
                      const searchTerm = query.trim();
                      if (searchTerm) {
                        navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
                        setOpen(false);
                        setQuery('');
                      }
                    }}
                  >
                    See all results for "{query}"
                  </button>
                </div>

              {results.albums.length > 0 && (
                <div className="search-section">
                  <div className="search-section-title">Albums</div>
                  {results.albums.map((a) => (
                    <div key={a._id} className="search-item" onClick={() => onAlbumClick(a)}>
                      <img src={a.imageUrl || a.image || 'https://via.placeholder.com/56'} alt={a.albumname || a.name} />
                      <div className="search-item-text">
                        <div className="search-item-title">{a.albumname || a.name}</div>
                        <div className="search-item-sub">{a.artist}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {results.artists.length > 0 && (
                <div className="search-section">
                  <div className="search-section-title">Artists</div>
                  {results.artists.map((ar) => (
                    <div key={ar._id} className="search-item" onClick={() => onArtistClick(ar)}>
                      <img src={ar.coverimg || ar.img || 'https://via.placeholder.com/56'} alt={ar.name} />
                      <div className="search-item-text">
                        <div className="search-item-title">{ar.name}</div>
                        <div className="search-item-sub">{ar.genre || ''}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="nav-right">
        <span>Premium</span>
        <span>Support</span>
        <span>Download</span>
        <div className="divider" />
        <FaDownload className="icon" />
        <span>Install App</span>
      
        <button 
          className="login-btn" 
          onClick={() => {
            // Clear user session
            localStorage.removeItem('token');
            // Redirect to login page
            navigate('/login', { replace: true });
          }}
        >
          Log out
        </button>
      </div>
    </div>
  );
};

export default Navbar;
