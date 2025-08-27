import React,{createContext,useContext,useState,useRef,useEffect, Children} from 'react'

const MusicPlayerContext=createContext();

//custom hook
 
export const useMusicPlayer=()=>{
  return useContext(MusicPlayerContext);
};

export const MusicPlayerBar=({Children})=>{
  //currently playing song state

  const[currentTrack, setCurrentTrack]=useState(null);
  
  //to show whether it is playing or not

  const[isPlaying,setIsPlaying]=useState(false);

  //Music bar show panna state

  const[showMusicbar, setShowMusicBar]=useState(false);

  //to show duration and time

  const[duration,setDuration]=useState(0);
  const[currentTime,setCurrentTime]=useState(0);

  const audioRef=useRef(null);

  //song playing function
  const playTrack=useCallback(async(track)=>{
    if(!track || !track.music){
      console.error("cannot play a track");
      return;
    }

    //already song is playing

    if(currentTrack?.music===track.music){
      togglePlaypause();
      return;
    }

    setCurrentTrack(track);
    setIsPlaying(true);
    setShowMusicBar(true);

    //to stop the previous song
    if(audioRef.current){
      audioRef.current.pause();
      audioRef.current.currentTime=0;
    }
    

    //to create new song

    audioRef.current=new Audio(track.music);
    audioRef.current.preload='metadata';

      // Event listeners-a set pannu
      audioRef.current.addEventListener('loadedmetadata', () => {
        setDuration(audioRef.current.duration);
      });
      audioRef.current.addEventListener('timeupdate', () => {
        setCurrentTime(audioRef.current.currentTime);
      });
      audioRef.current.addEventListener('ended', () => {
        setIsPlaying(false);
        setCurrentTime(0);
      });
      audioRef.current.addEventListener('error', (e) => {
          console.error('Audio playback error:', e);
          setIsPlaying(false);
          setCurrentTime(0);
      });
  
      try {
        // Song-a play pannu
        await audioRef.current.play();
      } catch (error) {
        console.error('Playback failed:', error);
        setIsPlaying(false);
      }

  },[currentTrack]);


   // Play/pause toggle panna function
   const togglePlayPause = useCallback(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(error => {
          console.error('Playback failed on toggle:', error);
        });
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  // Component unmount aagum pothu audio-a clean panna
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Context-la provide panna values
  const value = {
    currentTrack,
    isPlaying,
    showMusicBar,
    duration,
    currentTime,
    playTrack,
    togglePlayPause,
    audioRef
  };

  return (
    <MusicPlayerContext.Provider value={value}>
      {children}
    </MusicPlayerContext.Provider>
  );

};