import React from 'react'
import './popularartist.css'
import ArtistCard from '../artistCard/ArtistCard.jsx'
const PopularArtist = ({setcurrentpage}) => {
  return (
    <div className='PopularArtistContent'> 
      <span>Popular artist</span>
      <ArtistCard setcurrentpage={setcurrentpage}/>

    </div>
  )
}

export default PopularArtist