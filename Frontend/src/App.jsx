import React, { Suspense, useState, useRef, useEffect } from 'react'
import { unstable_HistoryRouter as HistoryRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { history } from './utils/history'
import './App.css'
import Mainpage from './Pages/Main/Mainpage.jsx'
import HomePage from './Pages/Home/Home.jsx'
import MusicPlayerBar from './Pages/Musicbar/Musicbar'
const AuthForm = React.lazy(() => import('./Pages/Login/Login.jsx'))

function App() {
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(new Audio());

  // Handle cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Function to play a new song
  const playSong = (song) => {
    if (audioRef.current) {
      // If same song is clicked, just toggle play/pause
      if (currentSong && currentSong.id === song.id) {
        togglePlayPause();
        return;
      }
      
      // Stop current audio
      audioRef.current.pause();
      
      // Set new song
      setCurrentSong(song);
      audioRef.current.src = song.audioSrc;
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(error => console.error('Error playing song:', error));
    }
  };

  const togglePlayPause = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(error => console.error('Error playing:', error));
    }
    setIsPlaying(!isPlaying);
  };

  // Close player
  const closePlayer = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setCurrentSong(null);
    setIsPlaying(false);
  };

  // Context value to be passed to child components
  const playerContext = {
    playSong,
    currentSong,
    isPlaying,
    togglePlayPause,
    audioRef
  };

  // Protected route component
  const ProtectedRoute = ({ children }) => {
    const location = useLocation();
    // Add your authentication check here if needed
    // const isAuthenticated = /* your auth check */ true;
    
    // If you want to protect certain routes, uncomment and modify this:
    // if (!isAuthenticated) {
    //   return <Navigate to="/login" state={{ from: location }} replace />;
    // }
    
    return children;
  };

  return (
    <HistoryRouter history={history}>
      <Suspense fallback={<div style={{ padding: 20 }}>Loading...</div>}>
        <div className="app-container">
          <div className="main-content">
            <Routes>
              <Route path="/" element={
                <ProtectedRoute>
                  <Mainpage {...playerContext} />
                </ProtectedRoute>
              } />
              <Route path="/login" element={<AuthForm />} />
              <Route path="/home" element={
                <ProtectedRoute>
                  <HomePage {...playerContext} />
                </ProtectedRoute>
              } />
              {/* Add a catch-all route for 404 or redirect to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
          
          {/* Music Player Bar - Fixed at bottom */}
          {currentSong && (
            <div className="music-player-wrapper">
              <MusicPlayerBar 
                currentSong={currentSong}
                onClose={closePlayer}
                audioRef={audioRef}
                isPlaying={isPlaying}
                onPlayPause={togglePlayPause}
              />
            </div>
          )}
        </div>
      </Suspense>
    </HistoryRouter>
  )
}

export default App
