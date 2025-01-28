import { useCallback, useState } from "react";
import DatePicker from "../components/DatePicker";
import { GameStateProvider, useGameState } from "../contexts/GameStateContext"
import { useSpotify, Track } from "../contexts/SpotifyContext";
import DisplayTrack from "../components/DisplayTrack";
import { generateRandomInt } from "../utils/randomNumber";
import { useNavigate } from "react-router-dom";


export default function PlayPage() {

  return (
    <GameStateProvider>
      <GameControlPage />
    </GameStateProvider>
  )
}


function GameControlPage() {

  const gameState = useGameState();
  const SpotifyApi = useSpotify();

  const getRandomLikedSongs = useCallback(async (n : number) => {
    if (!SpotifyApi?.currentUser?.likedSongCount) return;

    let likedSongCount = SpotifyApi?.currentUser?.likedSongCount;

    let randomNumbers = new Set();
    while (randomNumbers.size < n) {
      randomNumbers.add(generateRandomInt(Number(likedSongCount)));
    }

    let randomTracks = []
    for (let index of randomNumbers) {
      let likedSong = await SpotifyApi.getLikedSongAt(index);
      let trackDetails = likedSong?.track;

      let track : Track = {
        name: trackDetails?.name,
        artists: trackDetails?.artists?.map((a : any) => a.name),
        albumCover: trackDetails?.album?.images?.[0]?.url,
        addedDate: new Date(likedSong?.added_at)
      }

      randomTracks.push(track)
    }

    console.log(randomTracks);
    gameState.initiateGame(randomTracks)
  }, []);


  return (
    <main>
      {gameState.tracks.length > 0
        ? gameState.isGameOver
          ? <GameEndPage />
          : <RoundPlayPage />
        : <div className="main">
            <button className="primary-button" onClick={() => getRandomLikedSongs(gameState.totalRounds)}>Start</button>
          </div>
      }
    </main>
  )
}


function RoundPlayPage() {

  const gameState = useGameState();
  const SpotifyApi = useSpotify();

  const [currentDate, setCurrentDate] = useState<Date>(SpotifyApi?.currentUser?.earliestLikedSong ?? new Date());
  const [currentDaysOut, setCurrentDaysOut] = useState(0);
  const [currentScore, setCurrentScore] = useState(0);

  const [guessing, setGuessing] = useState(true)

  function makeGuess() {
    let [daysOut, roundScore] = gameState.scoreRound(currentDate);
    setCurrentDaysOut(daysOut);
    setCurrentScore(roundScore);
    setGuessing(false);
  }

  function nextRound() {
    gameState.nextRound();
    setGuessing(true);
  }


  return (
    <div className="main">
      <div>
        <h1 className="title">Round {gameState.roundNumber + "/" + gameState.totalRounds}</h1>
      </div>

      <DisplayTrack track={gameState.currentTrack} />

      {
        guessing
        ? <>

            <DatePicker currentDate={currentDate} setCurrentDate={setCurrentDate} />

            <button className="primary-button" onClick={makeGuess}>Submit Guess</button>
          </>
        : <>
            <div>
              <p>Your guess: {currentDate.toLocaleDateString()}</p>
              <p>Real date: {gameState.currentTrack?.addedDate.toLocaleDateString()}</p>
              <p>That's {currentDaysOut} days difference.</p>
              <p>Score: {currentScore}</p>
            </div>

            {
              gameState.isFinalRound
              ? <button className="primary-button" onClick={() => gameState.endGame()}>See Score Overview</button>
              : <button className="primary-button" onClick={nextRound}>Next Round</button>
            }
          </>
      }

    </div>
  )
}


function GameEndPage() {

  const Navigate = useNavigate()
  const gameState = useGameState()

  return (
    <div className="main">
      <div>
        <h1 className="title">Game Over!</h1>

        <p>{gameState.scores.join(", ")}</p>

        <button className="primary-button" onClick={() => Navigate(0)}>Play again</button>
      </div>
    </div>
  )

}
