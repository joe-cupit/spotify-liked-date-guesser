import { useNavigate, useSearchParams } from "react-router-dom";

import { useSpotify } from "../contexts/SpotifyContext"
import { useEffect } from "react";


export default function RedirectPage() {
  const [searchParams] = useSearchParams();
  const SpotifyApi = useSpotify();

  useEffect(() => {
    const code = searchParams.get("code");
    if (code !== null && localStorage.getItem("spotify_access_token") === null) {
      console.log(code)
      SpotifyApi?.getAccessToken(code);
    }
    else {
      useNavigate()("/");
    }
  }, [])


  return (
    <main className="main">
      redirecting you shortly...
    </main>
  )
}
