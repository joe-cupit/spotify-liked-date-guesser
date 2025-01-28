import { useSpotify } from "../contexts/SpotifyContext"
import { Link } from "react-router-dom";

export default function MainPage() {

  const SpotifyApi = useSpotify();


  return (
    <main>
      <div className="main">
        <div>
          <h1 className="title">Liked Song Guesser</h1>
          <p>How well do you know your music listening history?</p>
        </div>

        <div>
          <p>You've been adding to your liked songs since {SpotifyApi?.currentUser?.earliestLikedSong && SpotifyApi?.currentUser?.earliestLikedSong?.toLocaleDateString()}!</p>
          <p>Time to guess when that was:</p>

        </div>
        <Link to="/play" className="primary-button">Begin</Link>
      </div>
    </main>
  )
}