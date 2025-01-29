import { Track } from "../contexts/SpotifyContext";


export default function DisplayTrack({ track } : { track: Track | null }) {

  if (track === null) return <></>
  else return (
    <div className="spotify-track">
      <img src={track?.albumCover} alt={track?.name + " album cover"} />
      <div className="spotify-track__name-artist">
        <p className="spotify-track__name">{track?.name}</p>
        <p>{track?.artists?.join(", ")}</p>
      </div>
    </div>
  )
}