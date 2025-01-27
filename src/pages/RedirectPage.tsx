import { useNavigate, useSearchParams } from "react-router-dom";

import { useSpotify } from "../contexts/SpotifyContext"


export default function RedirectPage() {

  const [searchParams] = useSearchParams();
  const code = searchParams.get("code")
  if (code !== null) {
    console.log(code)
    const SpotifyApi = useSpotify();
    SpotifyApi?.getAccessToken(code);
  }
  else {
    useNavigate()("/");
  }


  return (
    <main className="main">
      redirecting you shortly...
    </main>
  )
}
