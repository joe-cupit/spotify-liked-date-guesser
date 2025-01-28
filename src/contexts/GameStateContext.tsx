import { createContext, useContext, useMemo, useState } from 'react'
import { Track } from './SpotifyContext';
import { getDateDifferenceInDays } from '../utils/dateDifference';


type GameState = {
  totalRounds: number,
  roundNumber: number,
  tracks: Track[],
  currentTrack: Track | null,
  scores: number[],
  isGameOver: boolean,
  isFinalRound: boolean,

  initiateGame: Function,
  scoreRound: Function,
  nextRound: Function,
  endGame: Function
}

const GameStateContext = createContext<GameState>({
  totalRounds: 5,
  roundNumber: 1,
  tracks: [],
  currentTrack: null,
  scores: [],
  isGameOver: false,
  isFinalRound: false,

  initiateGame: Function,
  scoreRound: Function,
  nextRound: Function,
  endGame: Function
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


  const value = {
    totalRounds: maxGameRounds,
    roundNumber: roundNumber,
    tracks: trackList,
    currentTrack: currentTrack,
    scores: scoreList,
    isGameOver: gameOver,
    isFinalRound: roundNumber === maxGameRounds,

    initiateGame: initiateGame,
    scoreRound: scoreRound,
    nextRound: nextRound,
    endGame: endGame
  }

  return (
    <GameStateContext.Provider value={value}>
      {children}
    </GameStateContext.Provider>
  )
}
