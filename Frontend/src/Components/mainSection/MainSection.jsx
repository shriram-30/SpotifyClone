import React, { useState } from 'react';
import './mainsection.css';
import Trending from '../Trending/Trending.jsx';
import PopularArtist from '../PopularArtist/PopularArtist.jsx';
import SpecificMusicPage from '../../Pages/specificMusicPage/specificMusicPage.jsx'; // <-- fixed import

const MainSection = () => {
  const [currentpage, setcurrentpage] = useState("home");
  const [currentEle, setcurrentEle] = useState(null);

  return (
    <main className='MainSection'>
      {console.log(currentpage, currentEle)}
      {
        currentpage === 'home' ? (
          <>
            <Trending setcurrentEle={setcurrentEle} setcurrentpage={setcurrentpage} />
            <PopularArtist setcurrentpage={setcurrentpage} />
          </>
        ) : currentpage === "musicSpecificpage" ? (
          <SpecificMusicPage currentEle={currentEle} /> 
        ) : currentpage === "artistSpecificpage" ? (
          <>artist</>
        ) : null
      }
    </main>
  );
};

export default MainSection;
