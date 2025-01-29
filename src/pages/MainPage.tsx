import { useSpotify } from "../contexts/SpotifyContext"
import PlayPage from "./PlayPage";

import SpotifyLogo from "../assets/spotify-logo-black.svg"


export default function MainPage() {

  const SpotifyApi = useSpotify();

  return (
    <main>
      {SpotifyApi?.currentUser
      ? <PlayPage />
      : <NonLoggedInPage />
      }
    </main>
  )
}


function NonLoggedInPage() {

  const SpotifyApi = useSpotify();

  return (
    <div className="main">
      <div className="flex-column">
        <h1 className="title">Liked Song Guesser</h1>
        <p>How well do you know your music listening history?</p>
      </div>

      <div className="flex-column main__login-section">
        <p>To rediscover your past musical tastes log in with Spotify.</p>
        <button className="primary-button button-with-logo" onClick={() => SpotifyApi?.initiateLogin()}><img src={SpotifyLogo} alt="" /> Log in with Spotify</button>
      </div>
    </div>
  )
}