import './App.css'

import Nav from './components/Nav';
import Footer from './components/Footer';
import { Route, Routes } from 'react-router-dom';

import MainPage from './pages/MainPage';
import RedirectPage from './pages/RedirectPage';
import { useCallback, useEffect } from 'react';
import { useSpotify } from './contexts/SpotifyContext';
import PlayPage from './pages/PlayPage';


function App() {
  
  const SpotifyApi = useSpotify();
  const checkForCurrentUser = useCallback(() => {
    SpotifyApi?.getUserDetails();
  }, [])


  useEffect(() => {
    checkForCurrentUser();
  }, [])


  return (
    <>
    <Nav />
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/play" element={<PlayPage />} />
        <Route path="/redirect" element={<RedirectPage />} />
      </Routes>
    <Footer />
    </>
  )
}


export default App
