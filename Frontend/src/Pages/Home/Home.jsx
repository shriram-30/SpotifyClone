import React from 'react'
import './Home.css'
import Navbar from '../../Components/navbar/Navbar.jsx'
import SideBar from '../../Components/Sidebar/SideBar.jsx'
import MainSection from '../../Components/mainSection/MainSection.jsx'

const Home = () => {
  return (
    <div className="home-layout">
      <Navbar />
      <div className="home-body">
        <aside className="home-sidebar">
          <SideBar />
        </aside>
        <section className="home-main">
          <MainSection />
        </section>
      </div>
    </div>
  )
}

export default Home