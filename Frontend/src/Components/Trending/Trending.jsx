import React from 'react'
import './trending.css'
import TrendingCard from '../Trendingcard/TrendingCard.jsx'
import { useNavigate } from 'react-router-dom'
const Trending = ({setcurrentpage,setcurrentEle}) => {
  const navigate=useNavigate();//navigation hook

  const handleShowAllclick=()=>{
    navigate(`/track/all`);
  };

  return (
    <div className='TrendingContent'>
      <span className='TrendingTitle'>Trending Songs</span>
      <span className='showAll' onClick={handleShowAllclick}>Show All</span>
      <TrendingCard setcurrentpage={setcurrentpage} setcurrentEle={setcurrentEle}/>
      </div>
  )
}

export default Trending