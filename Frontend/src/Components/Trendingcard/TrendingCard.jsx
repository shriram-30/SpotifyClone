import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import './trendingcard.css';
import { MusicContext } from '../../contexts/MusicContext';

const TrendingCard = ({ setcurrentpage, setcurrentEle }) => {
  const { getLimitedTrendingSongs, isLoading, error } = useContext(MusicContext);
  const items = getLimitedTrendingSongs(9);
  const navigate = useNavigate();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (items.length === 0) return <div>No trending songs found</div>;

  return (
    <div className='TrendingCardContent'>
      {items.map((song) => (
        <div 
          key={song._id} 
          className="CardContent"
          onClick={() => {
            if (setcurrentpage) setcurrentpage('home');
            if (setcurrentEle) setcurrentEle(song);
            navigate(`/track/${song._id}`, { state: { track: song } });
          }}
        >
          <img src={song.imgsrc} alt={song.heading} className="song-cover" />
          <div className="CardContainerText">
            <h3 className="song-title">{song.heading}</h3>
            <p className="song-artist">{song.subheading}</p>
          </div>
          <div className="play-button">
            <svg viewBox="0 0 24 24" className="play-icon" width="24" height="24" fill="white">
              <path d="m7.05 3.606 13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z"></path>
            </svg>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TrendingCard;