import { createContext, useContext, useMemo, useState } from 'react'
import { Track } from './SpotifyContext';
import { getDateDifferenceInDays } from '../utils/dateDifference';


type Guess = {
  date: Date,
  daysWrong: number
} | null

type GameState = {
  totalRounds: number,
  roundNumber: number,
  tracks: Track[],
  currentTrack: Track | null,
  scores: number[],
  guesses: Guess[],
  isGameOver: boolean,
  isFinalRound: boolean,

  initiateGame: Function,
  scoreRound: Function,
  nextRound: Function,
  endGame: Function,
  newGame: Function
}

const GameStateContext = createContext<GameState>({
  totalRounds: 5,
  roundNumber: 1,
  tracks: [],
  currentTrack: null,
  scores: [],
  guesses: [],
  isGameOver: false,
  isFinalRound: false,

  initiateGame: Function,
  scoreRound: Function,
  nextRound: Function,
  endGame: Function,
  newGame: Function
});


export function useGameState() {
  return useContext(GameStateContext);
}


export function GameStateProvider({ children } : {children: JSX.Element} ) {

  const maxGameRounds = 6;
  const daysSinceFirstAdded = Number(localStorage.getItem("user__liked_song_count") ?? 1)

  const [roundNumber, setRoundNumber] = useState(1);
  const [trackList, setTrackList] = useState<Track[]>([]);
  const [scoreList, setScoreList] = useState<number[]>(Array(maxGameRounds).fill(0));
  const [guessList, setGuessList] = useState<Guess[]>(Array(maxGameRounds).fill(null))
  const [gameOver, setGameOver] = useState(false);

  const currentTrack = useMemo(() => {
    return trackList[roundNumber-1]
  }, [trackList, roundNumber])


  function initiateGame(newTrackList: Track[]) {
    setRoundNumber(1);
    setGameOver(false);
    setTrackList(newTrackList);
  }

  function scoreRound(guessDate: Date) {
    let daysWrong = getDateDifferenceInDays(guessDate, currentTrack.addedDate);
    let score = Math.max(Math.floor((1 - Math.log10(30 * (2 * daysWrong / daysSinceFirstAdded) ** 2 + 1) / 2) * 5000), 0);
    setScoreList(prev => {
      prev[roundNumber-1] = score;
      return prev;
    });
    setGuessList(prev => {
      prev[roundNumber-1] = {
        date: guessDate,
        daysWrong: daysWrong
      };
      return prev;
    })
    return [daysWrong, score];
  }

  function nextRound() {
    if (roundNumber + 1 > maxGameRounds) {
      setGameOver(true);
    }
    else {
      setRoundNumber(prev => prev+1);
    }
  }

  function endGame() {
    setGameOver(true);
  }

  function newGame() {
    setTrackList([])
    setScoreList([])
    setGuessList([])
  }


  const value = {
    totalRounds: maxGameRounds,
    roundNumber: roundNumber,
    tracks: trackList,
    currentTrack: currentTrack,
    scores: scoreList,
    guesses: guessList,
    isGameOver: gameOver,
    isFinalRound: roundNumber === maxGameRounds,

    initiateGame: initiateGame,
    scoreRound: scoreRound,
    nextRound: nextRound,
    endGame: endGame,
    newGame: newGame
  }

  return (
    <GameStateContext.Provider value={value}>
      {children}
    </GameStateContext.Provider>
  )
}
