import React from 'react'
import './trending.css'
import TrendingCard from '../Trendingcard/TrendingCard.jsx'
const Trending = ({setcurrentpage,setcurrentEle}) => {
  return (
    <div className='TrendingContent'>
      <span>Trending Songs</span>
      <TrendingCard setcurrentpage={setcurrentpage} setcurrentEle={setcurrentEle}/>
      </div>
  )
}

export default Trending