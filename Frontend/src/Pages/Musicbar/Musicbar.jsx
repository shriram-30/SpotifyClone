// src/components/MusicPlayerBar.js
import React, { useState, useEffect, useRef } from "react";
import './Musicbar.css';

// MusicPlayerBar component that will be shown when a song is playing
const MusicPlayerBar = ({ currentSong, onClose, audioRef: parentAudioRef, isPlaying: parentIsPlaying, onPlayPause }) => {
    // State for player controls
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(70);
    const [isMuted, setIsMuted] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const progressBarRef = useRef(null);

    // Effect to handle time updates and duration changes
    useEffect(() => {
        const audio = parentAudioRef.current;
        if (!audio) return;

        const updateTime = () => setCurrentTime(audio.currentTime);
        const updateDuration = () => {
            if (audio.duration) {
                setDuration(audio.duration);
            }
        };
        
        const handleCanPlay = () => {
            setIsLoading(false);
            // Auto-play when enough data is loaded
            if (!parentIsPlaying) {
                audio.play().catch(console.error);
            }
        };
        
        const handleWaiting = () => setIsLoading(true);
        const handlePlaying = () => setIsLoading(false);

        audio.addEventListener('timeupdate', updateTime);
        audio.addEventListener('durationchange', updateDuration);
        audio.addEventListener('canplay', handleCanPlay);
        audio.addEventListener('waiting', handleWaiting);
        audio.addEventListener('playing', handlePlaying);
        audio.addEventListener('ended', () => onPlayPause?.());

        // Initialize values
        updateTime();
        updateDuration();

        return () => {
            audio.removeEventListener('timeupdate', updateTime);
            audio.removeEventListener('durationchange', updateDuration);
            audio.removeEventListener('canplay', handleCanPlay);
            audio.removeEventListener('waiting', handleWaiting);
            audio.removeEventListener('playing', handlePlaying);
            audio.removeEventListener('ended', () => onPlayPause?.());
        };
    }, [parentAudioRef, onPlayPause]);

    // Toggle play/pause
    const togglePlayPause = async () => {
        if (!parentAudioRef.current) return;
        
        try {
            if (onPlayPause) {
                onPlayPause();
            } else if (parentIsPlaying) {
                setIsLoading(false);
                await parentAudioRef.current.pause();
            } else {
                setIsLoading(true);
                await parentAudioRef.current.play();
                setIsLoading(false);
            }
        } catch (error) {
            console.error('Error toggling play/pause:', error);
            setIsLoading(false);
        }
    };

    // Handle volume change
    const handleVolumeChange = (e) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        if (parentAudioRef.current) {
            parentAudioRef.current.volume = newVolume / 100;
            setIsMuted(newVolume === 0);
        }
    };

    // Format time (seconds to MM:SS)
    const formatTime = (time) => {
        if (isNaN(time) || time === null) return "0:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    // If no song is selected, don't render anything
    if (!currentSong) return null;

    return (
        <div className="music-player-bar-container">

            {/* Left Section: Album Art & Info */}
            <div className="player-bar-left">
                <img 
                    src={currentSong.imgsrc} 
                    alt="Album Cover" 
                    className="player-bar-album-cover" 
                />
                <div className="player-bar-song-info">
                    <span className="player-bar-title">
                        {currentSong.songName || currentSong.heading}
                        <span className="player-bar-duration">
                            {formatTime(duration)}
                        </span>
                    </span>
                    <span className="player-bar-artist">{currentSong.subheading}</span>
                </div>
                <button 
                    onClick={onClose}
                    className="close-button"
                    aria-label="Close player"
                >
                    ×
                </button>
            </div>

            {/* Center Section: Controls & Progress Bar */}
            <div className="player-bar-center">
                <div className="player-bar-controls">
                    <button className="control-button">
                        <svg viewBox="0 0 24 24" className="player-bar-icon control-small-icon">
                            <path d="M4 14.5a.5.5 0 01.5-.5h15a.5.5 0 010 1h-15a.5.5 0 01-.5-.5zm0-7a.5.5 0 01.5-.5h15a.5.5 0 010 1h-15a.5.5 0 01-.5-.5z"></path>
                        </svg>
                    </button>
                    
                    <button className="control-button">
                        <svg viewBox="0 0 24 24" className="player-bar-icon control-medium-icon">
                            <path d="M14.07 4.07L12 2 6 8l6 6 2.07-2.07L10.14 8z"></path>
                        </svg>
                    </button>
                    
                    {/* 👇️ இந்த இடத்துல conditional rendering-ஐ மாற்றி அமைக்கவும் */}
                    <button 
                        className="play-pause-button-circle"
                        onClick={togglePlayPause}
                        aria-label={parentIsPlaying ? 'Pause' : 'Play'}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            // Loading spinner
                            <svg className="player-bar-icon play-pause-icon" viewBox="0 0 24 24">
                                <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46A7.93 7.93 0 0020 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74A7.93 7.93 0 004 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"></path>
                            </svg>
                        ) : parentIsPlaying ? (
                            // Pause icon
                            <svg viewBox="0 0 24 24" className="player-bar-icon play-pause-icon">
                                <path d="M6 4.75a.75.75 0 01.75-.75h2.5a.75.75 0 01.75.75v14.5a.75.75 0 01-.75.75h-2.5a.75.75 0 01-.75-.75V4.75zm7.5 0a.75.75 0 01.75-.75h2.5a.75.75 0 01.75.75v14.5a.75.75 0 01-.75.75h-2.5a.75.75 0 01-.75-.75V4.75z"></path>
                            </svg>
                        ) : (
                            // Play icon
                            <svg viewBox="0 0 24 24" className="player-bar-icon play-pause-icon play-icon-actual">
                                <path d="M7.05 3.606l13.49 7.788a.7.7 0 010 1.212L7.05 20.394A.7.7 0 016 19.788V4.212a.7.7 0 011.05-.606z"></path>
                            </svg>
                        )}
                    </button>
                    {/* 👆️ இங்க மாற்றம் முடிந்தது */}

                    <button className="control-button">
                        <svg viewBox="0 0 24 24" className="player-bar-icon control-medium-icon">
                            <path d="M17.07 8.07L15 6 9 12l6 6 2.07-2.07L13.14 12z"></path>
                        </svg>
                    </button>
                    
                    <button className="control-button">
                        <svg viewBox="0 0 24 24" className="player-bar-icon control-small-icon">
                            <path d="M4.5 9.5a.5.5 0 000 1h15a.5.5 0 000-1h-15zm0 4a.5.5 0 000 1h15a.5.5 0 000-1h-15z"></path>
                        </svg>
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="player-bar-progress-section">
                    <span className="player-bar-time">{formatTime(currentTime)}</span>
                    <input
                        type="range"
                        min="0"
                        max={duration || 100}
                        value={currentTime}
                        onChange={(e) => {
                            const newTime = parseFloat(e.target.value);
                            if (parentAudioRef.current) {
                                parentAudioRef.current.currentTime = newTime;
                                setCurrentTime(newTime);
                            }
                        }}
                        className="player-bar-progress-slider"
                        style={{
                            opacity: isLoading ? 0.5 : 1,
                            '--progress': `${(currentTime / (duration || 100)) * 100}%`
                        }}
                    />
                    <span className="player-bar-time">{formatTime(duration)}</span>
                </div>
            </div>

            {/* Right Section: Volume & Fullscreen */}
            <div className="player-bar-right">
                <button className="control-button">
                    <svg viewBox="0 0 24 24" className="player-bar-icon">
                        <path d="M15 8V6a2 2 0 014 0v2h3a1 1 0 011 1v11a1 1 0 01-1 1H7a1 1 0 01-1-1V9a1 1 0 011-1h3zm-1 0H7a1 1 0 01-1-1V6a1 1 0 011-1h2a1 1 0 011 1v1a1 1 0 01-1 1zm4 0h-2a1 1 0 01-1-1V6a1 1 0 011-1h2a1 1 0 011 1v1a1 1 0 01-1 1z"></path>
                    </svg>
                </button>
                
                <div className="volume-control-section">
                    <button 
                        onClick={() => {
                            if (parentAudioRef.current) {
                                if (isMuted) {
                                    parentAudioRef.current.volume = volume / 100;
                                    setIsMuted(false);
                                } else {
                                    parentAudioRef.current.volume = 0;
                                    setIsMuted(true);
                                }
                            }
                        }}
                        aria-label={isMuted ? 'Unmute' : 'Mute'}
                        className="control-button"
                    >
                        {isMuted || volume === 0 ? (
                            <svg viewBox="0 0 24 24" className="player-bar-icon">
                                <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.796 8.796 0 0021 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 4L2.86 5.41 7.03 9.6 3 9.6v4.8h3.03l4.06 4.06c-.65.49-1.38.88-2.18 1.11v2.06a8.99 8.99 0 007.61-4.43l1.99 1.99 1.41-1.41L4.27 4zM12 4l-1.5 1.5 5.74 5.74 1.5-1.5L12 4z"></path>
                            </svg>
                        ) : volume > 50 ? (
                            <svg viewBox="0 0 24 24" className="player-bar-icon">
                                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"></path>
                            </svg>
                        ) : (
                            <svg viewBox="0 0 24 24" className="player-bar-icon">
                                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"></path>
                            </svg>
                        )}
                    </button>
                    <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={isMuted ? 0 : volume} 
                        onChange={(e) => {
                            const newVolume = parseFloat(e.target.value);
                            setVolume(newVolume);
                            if (parentAudioRef.current) {
                                parentAudioRef.current.volume = newVolume / 100;
                                setIsMuted(newVolume === 0);
                            }
                        }}
                        onMouseUp={() => {
                            if (volume === 0) {
                                setIsMuted(true);
                            }
                        }}
                        className="player-bar-volume-slider" 
                    />
                </div>
            </div>
        </div>
    );
};

export default MusicPlayerBar;