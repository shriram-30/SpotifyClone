import React from 'react'
import './sidebar.css'
import Cards from './Cards.jsx'
const SideBar = () => {
  return (
    <div className='sidebarContent'>
    <div className="SidebarTopSection">
        <h2>Your Library</h2>
        <p>+</p>
    </div>
    <div className="SidebarMainSection">
      <Cards headingtext="Create Your Playlist " subheadingtext=" It's easy, we'll help you" buttontext="Create Playlist" />
      <Cards headingtext="Let's find some podcast to follow" subheadingtext=" we will keep you updated on new episodes" buttontext="Browse podcasts "/>
    </div>
    <div className="SidebarBottomSection">
      <div className="BottomSectionTopContent">
        <p>legal safety&privacycenter</p>
        <p>Privacy Policy Cookies Aboutus</p>
        <p>Accessibility</p>
      </div>
      <div className="BottomSectionBottomContent">
            <p>Cookies</p>
      </div>
      <div className="BottomSectionBottomContent">
            <button id="button">🌐 English</button>
      </div>

    </div>
    </div>
  )
}

export default SideBar