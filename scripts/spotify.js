const clientId = "d7d1414204354290bfe9edd85a923ff9";


async function getAccessCode() {
  const codeVerifier  = generateRandomString(64);
  const hashed = await sha256(codeVerifier);
  const codeChallenge = base64encode(hashed);

  const redirectUri = "http://localhost/spotify/redirect";

  const scope = "user-library-read";
  const authUrl = new URL("https://accounts.spotify.com/authorize")

  // generated in the previous step
  localStorage.setItem("spotify_code_verifier", codeVerifier);

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


function getToken(code) {

  const redirectUri = "http://localhost/spotify/redirect";

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
      code_verifier: codeVerifier,
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
    })
    .finally(() => window.location.href = "http://localhost/spotify/");
}


function refreshToken() {
  // refresh token that has been previously stored
  const refreshToken = localStorage.getItem("spotify_refresh_token");
  const url = "https://accounts.spotify.com/api/token";

  const payload = {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: clientId
    }),
  }
  fetch(url, payload)
    .then(res => res.json())
    .then(body => {
      console.log(body)
      if (body.access_token) {
        localStorage.setItem("spotify_access_token", body.access_token);
      }
      if (body.refresh_token) {
        localStorage.setItem("spotify_refresh_token", body.refresh_token);
      }
    })
    // .finally(() => window.location.href = "http://localhost/spotify/");
}


function logUserOut() {
  localStorage.removeItem("spotify_code_verifier");
  localStorage.removeItem("spotify_access_token");
  localStorage.removeItem("spotify_refresh_token");

  window.location.href = "http://localhost/spotify/";
}



function getUserDetails() {
  const url = "https://api.spotify.com/v1/me";
  const accessToken = localStorage.getItem("spotify_access_token");

  const payload = {
    method: "GET",
    headers: {
      "Authorization": "Bearer " + accessToken
    }
  };
  fetch(url, payload)
    .then(res => res.json())
    .then(body => {
      console.log(body)

      const displayName = body.display_name;
      const userNameElement = document.getElementById("navbar__user-name");
      userNameElement.innerText = displayName;

      const displayImageUrl = body.images?.[1]?.url;
      const userImageElement = document.getElementById("navbar__user-image");
      userImageElement.src = displayImageUrl;
      userImageElement.alt = displayName + " profile photo";

      const logInOutButton = document.getElementById("navbar__login-button");
      logInOutButton.innerText = "Log out";
      logInOutButton.onclick = logUserOut;

      document.getElementById("navbar__user").style = "";
    });
}

function setUserDetails() {
  const displayName = "joe.";
  const userNameElement = document.getElementById("navbar__user-name");
  userNameElement.innerText = displayName;

  const displayImageUrl = "https://i.scdn.co/image/ab67757000003b82af09aa3ef3f8fa7e54547f61";
  const userImageElement = document.getElementById("navbar__user-image");
  userImageElement.src = displayImageUrl;
  userImageElement.alt = displayName + " profile photo";

  const logInOutButton = document.getElementById("navbar__login-button");
  logInOutButton.innerText = "Log out";
  logInOutButton.onclick = logUserOut;

  document.getElementById("navbar__user").style = "";
}


function getRandomLikedSong() {
  const accessToken = localStorage.getItem("spotify_access_token");

  const url = new URL("https://api.spotify.com/v1/me/tracks");
  const params =  {
    offset: getRandomInt(1800),
    limit: 1
  }
  url.search = new URLSearchParams(params).toString();

  const payload = {
    method: "GET",
    headers: {
      "Authorization": "Bearer " + accessToken
    }
  };
  fetch(url.toString(), payload)
    .then(res => res.json())
    .then(body => {
      console.log(body);

      const totalTrackCount = body.total;
      const tracks = body.items;

      displayTrackDetails(tracks[0])
    });
}


function displayTrackDetails(trackItem) {
  const addedDate = trackItem.added_at;
  const track = trackItem.track;

  const name = track?.name;
  const artists = track?.artists?.map(a => a.name);
  const albumCoverUrl = track?.album?.images?.[0]?.url;
  const uri = track?.uri;

  const previewUrl = track?.preview_url;

  console.log(addedDate, name, artists, albumCoverUrl, uri);
  console.log(previewUrl)

  const albumCoverElement = document.getElementById("spotify-track__album-cover");
  albumCoverElement.src = albumCoverUrl;
  albumCoverElement.alt = name + " album cover";
  document.getElementById("spotify-track__name").innerText = name;
  document.getElementById("spotify-track__artists").innerText = artists.join(", ");
  document.getElementById("spotify-track__added-date").innerText = addedDate;
}
