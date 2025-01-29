import { useState } from "react";
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

  async function getRandomLikedSongs(n : number) {
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
  };


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
    <div className="main play-page">
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
            <div className="play-results">
              <div className="play-results__date-group">
                Actual date added to your liked songs:
                <p className="play-results__big">{gameState.currentTrack?.addedDate.toLocaleDateString()}</p>
              </div>
              <div className="play-results__date-group">
                <p>That's <b>{currentDaysOut}</b> days difference from your guess of <b>{currentDate.toLocaleDateString()}</b></p>
              </div>
              <p>Scoring <span className="play-results__big">{currentScore.toLocaleString()}</span>/5,000 pts.</p>
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
      <div className="game-end__score">
        <h1>Final score:</h1>
        <p><span className="title">{gameState.scores.reduce((a, b) => a + b, 0).toLocaleString()}</span>/{(gameState.totalRounds * 5000).toLocaleString()}</p>
      </div>

      <div className="game-end__overview">
        <div className="game-end__overview-heading">
          <p>Track</p>
          <p></p>
          <p className="game-end__overview-center">Date</p>
          <p className="game-end__overview-right">Days out</p>
          <b className="game-end__overview-right">Score</b>
        </div>
        {gameState.tracks.map((track: Track, index: number) => {
          return (
            <div key={index} className="game-end__track">
              <img className="game-end__track-image" src={track.albumCover} alt={track.name + " album cover"} />
              <div>
                <p className="game-end__track-name">{track.name}</p>
                <p className="game-end__track-artists">{track.artists.join(", ")}</p>
              </div>
              <div className="game-end__overview-center">
                <p>{gameState.guesses[index]?.date.toLocaleDateString()}</p>
                <b>{track.addedDate.toLocaleDateString()}</b>
              </div>
              <p className="game-end__overview-right">{gameState.guesses[index]?.daysWrong + " days"}</p>
              <b className="game-end__overview-right">{gameState.scores[index].toLocaleString() + " pts"}</b>
            </div>
          )
        })}
        <div className="game-end__overview-total">
          <p></p>
          <p></p>
          <p></p>
          <p className="game-end__overview-right">Total:</p>
          <b className="game-end__overview-right">{gameState.scores.reduce((a, b) => a + b, 0).toLocaleString()} pts</b>
        </div>
      </div>

      <button className="primary-button" onClick={() => Navigate(0)}>Play again</button>
    </div>
  )
}
