import { createContext, useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'


export type Track = {
  name: string,
  artists: string[],
  albumCover: string,
  addedDate: Date
}

type SpotifyUser = {
  displayName: string,
  displayImageUrl: string,
  likedSongCount: number | null,
  earliestLikedSong: Date | null
} | null

type SpotifyApi = {
  currentUser: SpotifyUser,
  initiateLogin: Function,
  getAccessToken: Function,
  refreshAccessToken: Function,
  getUserDetails: Function,
  logOut: Function,
  getLikedSongAt: Function
} | null


const SpotifyContext = createContext<SpotifyApi>(null);


export function useSpotify() {
  return useContext(SpotifyContext);
}


export function SpotifyProvider({ children } : JSX.Element | any ) {

  const clientId = "e3320fa9fc474905b90a4fd15a005a44";
  const redirectUri = "http://localhost:5173/redirect"

  const [currentUser, setCurrentUser] = useState<SpotifyUser>(null)
  const Navigate = useNavigate();


  function generateRandomString(length: number) {
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const values = crypto.getRandomValues(new Uint8Array(length));
    return values.reduce((acc, x) => acc + possible[x % possible.length], "");
  }

  async function sha256(plain: string) {
    const encoder = new TextEncoder();
    const data = encoder.encode(plain);
    return window.crypto.subtle.digest("SHA-256", data);
  }

  function base64encode(input: ArrayBuffer) {
    return btoa(String.fromCharCode(...new Uint8Array(input)))
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");
  }


  async function initiateLogin() {
    const codeVerifier  = generateRandomString(64);
    const hashed = await sha256(codeVerifier);
    const codeChallenge = base64encode(hashed);

    localStorage.setItem("spotify_code_verifier", codeVerifier);

    const scope = "user-library-read";

    const authUrl = new URL("https://accounts.spotify.com/authorize")
    const params =  {
      response_type: "code",
      client_id: clientId,
      scope,
      code_challenge_method: "S256",
      code_challenge: codeChallenge,
      redirect_uri: redirectUri,
    }
    authUrl.search = new URLSearchParams(params).toString();
    window.location.href = authUrl.toString();
  }

  function getAccessToken(code: string) {  
    const tokenUrl = "https://accounts.spotify.com/api/token";

    // stored in the previous step
    let codeVerifier = localStorage.getItem("spotify_code_verifier");

    const payload = {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: clientId,
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
        code_verifier: String(codeVerifier),
      }),
    };

    fetch(tokenUrl, payload)
      .then(res => res.json())
      .then(body => {
        console.log(body)
        if (body.access_token) {
          localStorage.setItem("spotify_access_token", body.access_token);
        }
        if (body.refresh_token) {
          localStorage.setItem("spotify_refresh_token", body.refresh_token);
        }

        getUserDetails();
      })
      .finally(() => Navigate("/"));

    localStorage.removeItem("spotify_code_verifier");
  }

  async function refreshAccessToken() {
    console.log("refreshing!")
    const tokenUrl = "https://accounts.spotify.com/api/token";
    const refreshToken = localStorage.getItem("spotify_refresh_token");

    const payload = {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: String(refreshToken),
        client_id: clientId
      }),
    }
    await fetch(tokenUrl, payload)
      .then(res => res.json())
      .then(body => {
        console.log(body);
        if (body.access_token) {
          localStorage.setItem("spotify_access_token", body.access_token);
        }
        if (body.refresh_token) {
          localStorage.setItem("spotify_refresh_token", body.refresh_token);
        }
      })
  }

  function logOut() {
    localStorage.removeItem("spotify_code_verifier");
    localStorage.removeItem("spotify_access_token");
    localStorage.removeItem("spotify_refresh_token");
    localStorage.removeItem("user__display_name");
    localStorage.removeItem("user__display_image_url");
    localStorage.removeItem("user__liked_song_count");
    localStorage.removeItem("user__earliest_liked_song");

    Navigate(0);
  }


  async function getLikedSongDetails() {
    const accessToken = localStorage.getItem("spotify_access_token");
    if (accessToken === null) return;

    const url = new URL("https://api.spotify.com/v1/me/tracks");
    const params =  {
      offset: "1",
      limit: "1"
    }
    url.search = new URLSearchParams(params).toString();

    const payload = {
      method: "GET",
      headers: {
        "Authorization": "Bearer " + accessToken
      }
    };
    const likedSongCount = await fetch(url.toString(), payload)
      .then(res => res.json())
      .then(body => {
        console.log(body);
        return body.total;
      });
    if (likedSongCount === null) return;

    const url2 = new URL("https://api.spotify.com/v1/me/tracks");
    const params2 =  {
      offset: String(likedSongCount - 1),
      limit: "1"
    }
    url2.search = new URLSearchParams(params2).toString();

    const payload2 = {
      method: "GET",
      headers: {
        "Authorization": "Bearer " + accessToken
      }
    };
    const earliestAddDate = await fetch(url2.toString(), payload2)
      .then(res => res.json())
      .then(body => {
        console.log(body);
        return body.items?.[0]?.added_at;
      });
    if (earliestAddDate === null) return;

    return {
      likedSongCount: likedSongCount,
      earliestAddDate: earliestAddDate
    }
  }


  async function getUserDetails() {
    let possibleDisplayName = localStorage.getItem("user__display_name");
    let possibleDisplayImageUrl = localStorage.getItem("user__display_image_url");
    if (possibleDisplayName) {
      let possibleLikedSongCount = localStorage.getItem("user__liked_song_count");
      let possibleEarliestAddDate = localStorage.getItem("user__earliest_liked_song");

      setCurrentUser({
        displayName: possibleDisplayName,
        displayImageUrl: possibleDisplayImageUrl ?? "",
        likedSongCount: Number(possibleLikedSongCount),
        earliestLikedSong: possibleEarliestAddDate ? new Date(possibleEarliestAddDate) : null
      });

      return;
    }

    const accessToken = localStorage.getItem("spotify_access_token");
    if (accessToken === null) return;

    const url = "https://api.spotify.com/v1/me";

    const payload = {
      method: "GET",
      headers: {
        "Authorization": "Bearer " + accessToken
      }
    };
    await fetch(url, payload)
      .then(res => res.json())
      .then(async body => {
        console.log(body);

        if (body.error?.status === 401) {
          await refreshAccessToken();
          getUserDetails();
        }
        else {
          const displayName = body.display_name;
          const displayImageUrl = body.images?.[1]?.url ?? "";

          if (displayName) {
            localStorage.setItem("user__display_name", displayName);
            localStorage.setItem("user__display_image_url", displayImageUrl);

            let possibleLikedSongDetails = await getLikedSongDetails();
            if (possibleLikedSongDetails?.likedSongCount) localStorage.setItem("user__liked_song_count", possibleLikedSongDetails?.likedSongCount)
            if (possibleLikedSongDetails?.earliestAddDate) localStorage.setItem("user__earliest_liked_song", possibleLikedSongDetails?.earliestAddDate)

            setCurrentUser({
              displayName: displayName,
              displayImageUrl: displayImageUrl,
              likedSongCount: possibleLikedSongDetails?.likedSongCount,
              earliestLikedSong: possibleLikedSongDetails?.earliestAddDate ? new Date(possibleLikedSongDetails?.earliestAddDate) : null
            });
          } 

        }
      });
  }

  async function getLikedSongAt(index: number) {
    const accessToken = localStorage.getItem("spotify_access_token");

    const url = new URL("https://api.spotify.com/v1/me/tracks");
    const params =  {
      offset: String(index),
      limit: "1"
    }
    url.search = new URLSearchParams(params).toString();

    const payload = {
      method: "GET",
      headers: {
        "Authorization": "Bearer " + accessToken
      }
    };
    const track = await fetch(url.toString(), payload)
      .then(res => res.json())
      .then(body => {
        console.log(body);

        const tracks = body.items;
        return tracks[0]
      });
    
    return track
  }


  const value = {
    currentUser: currentUser,
    initiateLogin: initiateLogin,
    getAccessToken: getAccessToken,
    refreshAccessToken: refreshAccessToken,
    getUserDetails: getUserDetails,
    logOut: logOut,
    getLikedSongAt: getLikedSongAt
  }

  return (
    <SpotifyContext.Provider value={value}>
      {children}
    </SpotifyContext.Provider>
  )
}
