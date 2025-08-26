import React from 'react'
import './artistcard.css'
import { ArtistDetails } from '../../Config/config'
const ArtistCard = ({setcurrentpage}) => {
  return (
    <div className='ArtistCardContent'>
      
      {
        ArtistDetails.map((ele)=>{
          return(
            <div onClick={()=>{setcurrentpage("artistSpecificpage"  )}} className="ArtistCarddetail">
              <img src={ele.img} alt=""/>

              <div className="textcontainer">
              <h1>{ele.name}</h1>
              <p>Artist</p>
            </div>
            <span id="playbutton">
              <svg data-encore-id="icon" role="img" aria-hidden="true" className="e-9812-icon e-9812-baseline" viewBox="0 0 24 24"><path d="m7.05 3.606 13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z"></path></svg>
            </span>
            </div>
            
          )
          
        })
      }
      
      
      </div>
  )
}

export default ArtistCard