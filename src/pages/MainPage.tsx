import { useCallback } from "react";
import { useSpotify } from "../contexts/SpotifyContext"
import { generateRandomInt } from "../utils/randomNumber";
import DatePicker from "../components/DatePicker";

export default function MainPage() {

  const SpotifyApi = useSpotify();

  const getRandomLikedSongs = useCallback(async (n : number) => {
    if (SpotifyApi === null) return;

    let randomNumbers = new Set();
    while (randomNumbers.size < n) {
      randomNumbers.add(generateRandomInt(1800));
    }

    let randomTracks = []
    for (let index of randomNumbers) {
      randomTracks.push(await SpotifyApi.getLikedSongAt(index))
    }

    console.log(randomTracks);
  }, []);


  return (
    <main>
      <div className="main play-page">
        <div>
          <h1 className="title">Round 1/5</h1>
        </div>

        <div id="spotify-track" className="spotify-track">
          <img id="spotify-track__album-cover" />
          <div className="spotify-track__name-artist">
            <p id="spotify-track__name" className="spotify-track__name">Track Name</p>
            <p id="spotify-track__artists">Artist</p>
          </div>
        </div>
        <p id="spotify-track__added-date"></p>

        <div className="guess-section">
          <p>When did you save this to your liked songs?</p>

          <DatePicker />

          <button className="primary-button">Make guess</button>
        </div>


        <button className="primary-button" onClick={() => getRandomLikedSongs(5)}
        >
          Get Random Liked Song
        </button>
      </div>
    </main>
  )
}