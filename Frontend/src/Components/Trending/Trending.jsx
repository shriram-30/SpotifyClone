import React from 'react'
import './trending.css'
import TrendingCard from '../Trendingcard/TrendingCard.jsx'
import { useNavigate } from 'react-router-dom'

const Trending = ({ setcurrentpage, setcurrentEle }) => {
  const navigate = useNavigate();
  
  const handleShowAll = () => {
    navigate('/trending-songs');
  };

  return (
    <div className='TrendingContent'>
      <span>Trending Songs</span>
      <span className='showAll' onClick={handleShowAll}>Show All</span>
      <TrendingCard setcurrentpage={setcurrentpage} setcurrentEle={setcurrentEle} />
    </div>
  )
}

export default Trending