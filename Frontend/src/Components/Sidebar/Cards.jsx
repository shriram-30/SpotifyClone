import React from 'react'
import './sidebar.css'
const Cards = ({headingtext,subheadingtext,buttontext}) => {
  return (
    <div className='SideBarMiddleContent'>
        <h1>{headingtext}</h1>
        <p>{subheadingtext}</p>
        <button> {buttontext} </button>
    </div>
  )
}

export default Cards