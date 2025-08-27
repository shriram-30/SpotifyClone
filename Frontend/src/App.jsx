import React, { Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import Mainpage from './Pages/Main/Mainpage.jsx'
import HomePage from './Pages/Home/Home.jsx'
import SpecificMusicPage from './Pages/specificMusicPage/specificMusicPage.jsx'
import ProtectedRoute from './Components/ProtectedRoute/ProtectedRoute.jsx'
const AuthForm = React.lazy(() => import('./Pages/Login/Login.jsx'))

function App() {

  return (
    <BrowserRouter>
      <Suspense fallback={<div style={{ padding: 20 }}>Loading...</div>}>
        <Routes>
          <Route path="/" element={<Mainpage />} />
          <Route path="/login" element={<AuthForm />} />
          {/* this is used check route is protected only user allowed after successful authentication*/}
          <Route element={<ProtectedRoute />}>
            <Route path="/home" element={<HomePage />} />
            <Route path="/track/:id" element={<SpecificMusicPage />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
