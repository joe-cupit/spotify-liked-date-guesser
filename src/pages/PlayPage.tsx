import { useState } from "react";

import { GameStateProvider, useGameState } from "../contexts/GameStateContext"
import { useSpotify, Track } from "../contexts/SpotifyContext";

import DatePicker from "../components/DatePicker";
import DisplayTrack from "../components/DisplayTrack";

import { generateRandomInt } from "../utils/randomNumber";


export default function PlayPage() {

  return (
    <GameStateProvider>
      <GameControlPage />
    </GameStateProvider>
  )
}


function GameControlPage() {

  const gameState = useGameState();

  if (gameState.tracks.length > 0) {
    if (gameState.isGameOver) return <GameEndPage />
    else return <RoundPlayPage />
  }
  else {
    return <InitialGamePage />
  }
}


function InitialGamePage() {

  const [loading, setLoading] = useState(false);

  const gameState = useGameState();
  const SpotifyApi = useSpotify();

  async function getRandomLikedSongs(n : number) {
    if (!SpotifyApi?.currentUser?.likedSongCount) return;
    setLoading(true);

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
    gameState.initiateGame(randomTracks);
    setLoading(false);
  };


  if (loading) return (
    <div className="main">
      <p>Preparing <b>six</b> random songs from your <b>{SpotifyApi?.currentUser?.likedSongCount}</b> liked songs...</p>
    </div>
  )
  else return (
    <div className="main">
      <div className="flex-column">
        <h1 className="title">Liked Song Guesser</h1>
        <p>How well do you know your music listening history?</p>
      </div>

      <p>Since <b>{SpotifyApi?.currentUser?.earliestLikedSong?.toLocaleDateString()}</b> you've saved <b>{SpotifyApi?.currentUser?.likedSongCount}</b> to your liked songs!</p>

      <div className="flex-column">
        <p>Time to rediscover your past musical tastes.</p>
        <button className="primary-button" onClick={() => getRandomLikedSongs(gameState.totalRounds)}>Start game</button>
      </div>

      {/*
      <div className="flex-column main__playlist">
        <p>Prefer to listen using playlists?</p>
        <p>Paste the link to one here to use that instead.</p>
        <input type="text" className="main__playlist-input" placeholder="https://open.spotify.com/playlist/{playlist-id}" />
        <button className="primary-button">Use this playlist</button>
      </div>
      */}
    </div>
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

      <button className="primary-button" onClick={() => gameState.newGame()}>Play again</button>
    </div>
  )
}
