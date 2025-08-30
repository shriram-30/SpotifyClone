import React, { Suspense, useCallback } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { MusicProvider } from './contexts/MusicContext';
import MusicBar from './Pages/Musicbar/Musicbar';
import './App.css'
import Mainpage from './Pages/Main/Mainpage.jsx'
import HomePage from './Pages/Home/Home.jsx'
import SpecificMusicPage from './Pages/specificMusicPage/specificMusicPage.jsx'
import TrendingSongs from './Pages/TrendingSongs/TrendingSongs.jsx'
import ProtectedRoute from './Components/ProtectedRoute/ProtectedRoute.jsx'


const AuthForm = React.lazy(() => import('./Pages/Login/Login.jsx'))
function App() {

  return (
    <MusicProvider>
      <BrowserRouter>
        <Suspense fallback={<div style={{ padding: 20 }}>Loading...</div>}>
          <div className="app-container">
            
            
            <div className="content-wrap" style={{ paddingBottom: '90px' }}>
              <Routes>
                <Route path="/" element={<Mainpage />} />
                <Route path="/login" element={<AuthForm />} />
                {/* this is used check route is protected only user allowed after successful authentication*/}
                <Route element={<ProtectedRoute />}>
                  <Route path="/home" element={<HomePage />} />
                  <Route path="/trending" element={<TrendingSongs />} />
                  <Route path="/track/:id" element={<SpecificMusicPage />} />
                  
                </Route>
              </Routes>
            </div>
            <div style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 1000
            }}>
              <MusicBar />
            </div>
          </div>
        </Suspense>
      </BrowserRouter>
    </MusicProvider>
  );
}

export default App
