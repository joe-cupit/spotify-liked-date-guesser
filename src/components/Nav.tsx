import { Link } from "react-router-dom"
import { useSpotify } from "../contexts/SpotifyContext"


export default function Nav() {

  const SpotifyApi = useSpotify();

  console.log(SpotifyApi?.currentUser)

  return (
    <nav>
      <div className="navbar">
        <Link to="/">Hello world!</Link>

        <div className="navbar__right">
          {SpotifyApi?.currentUser?.displayName
          ? <>
              <div id="navbar__user" className="navbar__user-profile">
                <img id="navbar__user-image" src={SpotifyApi?.currentUser?.displayImageUrl} alt={SpotifyApi?.currentUser?.displayName + " Spotify display image"} />
                <p id="navbar__user-name">{SpotifyApi?.currentUser?.displayName}</p>
              </div>
              <button id="navbar__login-button"
                className="primary-button"
                onClick={() => SpotifyApi?.logOut()}
              >
                Log out
              </button>
            </>
          : <button id="navbar__login-button"
              className="primary-button"
              onClick={() => SpotifyApi?.initiateLogin()}
            >
              Log in
            </button>
          }
        </div>
      </div>
    </nav>
  )
}
