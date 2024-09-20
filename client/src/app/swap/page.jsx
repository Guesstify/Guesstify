"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import { useRouter } from 'next/navigation';
import style from "../../../styles/swap.module.scss";
import { useSearchParams } from 'next/navigation';
import hamster from "../../../styles/hamster.module.scss";
import Cookies from 'js-cookie';
import HeaderComponent from '../header';
import Loader from '../loader';
import '../../../styles/header.module.scss';
const spotifyToken = Cookies.get('spotify_token');
import Progressbar from "./progressbar.jsx"
// import {MongoClient} from 'mongodb';

const Swap = () => {
  const [tracks, setTracks] = useState([]);
  const [leftTrack, setLeftTrack] = useState({});
  const [rightTrack, setRightTrack] = useState({});
  const [newTrack, setNewTrack] = useState({});
  const [ready, setReady] = useState("loading");
  const [leftStreak, setLeftStreak] = useState(0);
  const [rightStreak, setRightStreak] = useState(0);
  const [numSongs, setNumSongs] = useState(0)
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const searchParams = useSearchParams();
  const effectRan = useRef(false);
  const router = useRouter();
  const [volume, setVolume] = useState(0.5);
  const [leftPlaying, setLeftPlaying] = useState(false);
  const [rightPlaying, setRightPlaying] = useState(false);
  const [activePlayer, setActivePlayer] = useState(null);
  const playlist_id = searchParams.get("id");



  const playlistName = searchParams.get("name");
  const playlistSize = searchParams.get("size");




  async function fetchPlaylistItems(offset) {
    
  
    
    const response = await fetch(`${backendUrl}/playlist_items?id=${playlist_id}&offset=${offset}`, {
      method: "GET",
      credentials: "include",
      headers: {
        'Authorization': `Bearer ${spotifyToken}`,
      }
    });
  
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  
    const returnVal = await response.json();
    return returnVal;
  }

 
  useEffect(() => {

    if(effectRan.current === false){

      const fetchAllItems = async () => {
        console.log("fetching all Items");
        
        const allPromises = [];
  
        try {
          const maxItems = 300
          for (let offset = 0; offset < playlistSize && offset < maxItems; offset += 100) {
            allPromises.push(fetchPlaylistItems(offset));
          }
    
          const results = await Promise.all(allPromises);

  
          let allTracks = results.flatMap(data => data ? data.data_list : []);
          // Sort allTracks based on the popularity score in descending order
          allTracks.sort((a, b) => b.popularity - a.popularity);
  
          // Append ranking based on the sorting
          allTracks.forEach((track, index) => {
            track.ranking = index + 1;
          });
  
          setTracks(allTracks);
          console.log("tracks length: ")
          console.log(allTracks.length)
          setReady("ready");
        }
        catch (error) {
          console.error("Failed to fetch playlist items", error);
          router.push("/");
        }
        
      };

      fetchAllItems();
    }
    
    return () => {
      console.log("INITIAL EFFECT RETURN")
      effectRan.current = true;
    }


  }, []);


  useEffect(() => {
    console.log("ready and setting tracks");
    console.log(tracks)
    // Additional actions after response.json() resolves
    if(tracks.length > 0){
      initialGetTrack(setLeftTrack, setRightTrack);
    }
    
  }, [ready]);

  // code to keep track of streak counters
  useEffect(() => {
    if (leftStreak === 3) {
      console.log("entering left streak");
      setLeftStreak(0);
      getTrack(setLeftTrack, "none", leftTrack, rightTrack, 0);
    }
    if (rightStreak === 3) {
      console.log("entering right streak");
      setRightStreak(0);
      getTrack(setRightTrack, "none", leftTrack, rightTrack, 0);
    }
  }, [leftStreak, rightStreak]); // Dependency array

  const initialGetTrack = (leftSetter, rightSetter) => {

    const newTracks = [...tracks]
    const leftTrack = newTracks.shift();
    const rightTrack = newTracks.shift();

    leftTrack.priority = leftTrack.priority + 2 + Math.floor(Math.random() * 15)
    rightTrack.priority = rightTrack.priority + 2 + Math.floor(Math.random() * 15)

    const leftIndex = newTracks.findIndex(item => item.priority > leftTrack.priority);
    if (leftIndex === -1) {
        newTracks.push(leftTrack); // If no such index is found, obj should go at the end
    } else {
        newTracks.splice(leftIndex, 0, leftTrack);
    }

    const rightIndex = newTracks.findIndex(item => item.priority > rightTrack.priority);
    if (rightIndex === -1) {
        newTracks.push(rightTrack); // If no such index is found, obj should go at the end
    } else {
        newTracks.splice(rightIndex, 0, rightTrack);
    }
    
    setTracks(newTracks)
    console.log(tracks)
    leftSetter(leftTrack);
    rightSetter(rightTrack);
  }


  const getTrack = (setter, trackSide, leftTrack, rightTrack, startVal) => {
    setNumSongs(numSongs + 1)
    if (trackSide === "left") {
        setLeftStreak((prevStreak) => prevStreak + 1);
        setRightStreak(0);
        console.log("im on left")
        if (leftTrack.ranking >= rightTrack.ranking) {
          const tempRanking = leftTrack.ranking;
          leftTrack.ranking = rightTrack.ranking;
          rightTrack.ranking = tempRanking;
          console.log("left ranking: ", leftTrack.ranking);
        }
        else{
          rightTrack.ranking -= 2
        }
    } else if (trackSide === "right") {
        console.log("im on right")
        setRightStreak((prevStreak) => prevStreak + 1);
        setLeftStreak(0);
        if (rightTrack.ranking >= leftTrack.ranking) {
          const tempRanking = rightTrack.ranking;
          rightTrack.ranking = leftTrack.ranking;
          leftTrack.ranking = tempRanking;
          console.log("right ranking: ", rightTrack.ranking);
        }
        else{
          leftTrack.ranking -= 2
        }
    }

    const newTracks = [...tracks];
    const nextTrack = newTracks.shift()

    nextTrack.priority = nextTrack.priority + 2 + Math.floor(Math.random() * 15)
    const index = newTracks.findIndex(item => item.priority > nextTrack.priority);
    if (index === -1) {
        newTracks.push(nextTrack); // If no such index is found, obj should go at the end
    } else {
        newTracks.splice(index, 0, nextTrack);
    }

    setTracks(newTracks)
    console.log(tracks)
    
    setter(nextTrack);
  }

  const handleTogglePlay = (playerId) => {
    setActivePlayer((prevPlayerId) => (prevPlayerId === playerId ? null : playerId));
  };

  const AudioPlayer = ({ src, isPlaying, onTogglePlay, playerId }) => {
    const audioRef = useRef(null);

    useEffect(() => {
      // Access the audio elements by class name
      const audioElements = document.getElementsByClassName("volume");
      if (audioElements.length > 0) {
        // Set the default volume for each audio element found
        audioElements[0].volume = 0.6; // Set to your desired default volume (0.0 to 1.0)
        audioElements[1].volume = 0.6; // Set to your desired default volume (0.0 to 1.0)
      }

      console.log(playerId)

    }, [src]);

    const handleAudioEnd = () => {
      setActivePlayer(null);
    }
  
    useEffect(() => {
      if (audioRef.current) {
        if (isPlaying) {
          audioRef.current.play();
        } else {
          audioRef.current.pause();
        }
      }
    }, [isPlaying]);
  
    return (
      <div onClick={onTogglePlay}>
        <audio ref={audioRef} src={src} onEnded={handleAudioEnd}/>
        {isPlaying ? <PauseButton /> : <PlayButton />}
      </div>
    );
  };

  const PlayButton = () => {
    return(
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={style.pressplaybutton}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 0 1 0 .656l-5.603 3.113a.375.375 0 0 1-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112Z" />
      </svg>

    )
  }

  const PauseButton = () => {
    return(
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={style.pressplaybutton}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 9v6m-4.5 0V9M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    )
  }
  
  const handleCreate = () => {
    if (tracks && tracks.length > 0) {
      // Save tracks to local storage
      tracks.sort((a, b) => b.ranking - a.ranking);
      localStorage.setItem('tracks', JSON.stringify(tracks));
      // Navigate to the new page
      router.push('/create?name=[Vinyls] ' + playlistName);
    }
  };

  const handleParentOfSongClick = (side) => {
    if (side === "left") {
      getTrack(setRightTrack, "left", leftTrack, rightTrack, 0);
      setActivePlayer("player2"); // Play the right track
    } else if (side === "right") {
      getTrack(setLeftTrack, "right", leftTrack, rightTrack, 1);
      setActivePlayer("player1"); // Play the left track
    }
  };

  return (
    <>
      <div className={style.container}>
        <HeaderComponent/>
        <h1 className={style.title}>Which song fits the vibe of "{playlistName.length > 31 ? `${playlistName.substring(0, 28)}...` : playlistName}" more?</h1>
        {ready === "ready" ? (
          leftTrack && rightTrack && (
            <div className={style.content}>
              <Progressbar
                progress={numSongs/20*100}
              />
              <div className={style.create_button}>
                {numSongs >= 20 && (
                  <button onClick={handleCreate} className={style.create_playlist}>Create playlist!</button>
                )}
              </div>
              
              <div className={style.track_selectors}>
                <div className={style.cardbox}>
                  <div className={style.parentOfSong} onClick={() => handleParentOfSongClick("left")}>
                      <img
                        className={style.image}
                        src={leftTrack.track_image}
                        alt={`Album cover for ${leftTrack.track_name}`}
                        // onMouseOver={() => {setNewTrack(leftTrack)}}
                      />
                    <p className={style.track_names}>
                      <span className={style.text}>
                        <span className={style.track_name}>
                          {leftTrack.track_name && leftTrack.track_name.length > 31
                            ? `${leftTrack.track_name.substring(0, 28)}...`
                            : leftTrack.track_name}
                        </span>
                        <span className={style.track_artist}>
                          {leftTrack.track_artist && leftTrack.track_artist.length > 31
                            ? `${leftTrack.track_artist.substring(0, 28)}...`
                            : leftTrack.track_artist}
                        </span>
                      </span>
                      <a href={leftTrack.track_uri}>
                        <img className={style.logo} src="/logo.png"/>
                      </a>
                    </p>
                  </div>
                  <AudioPlayer
                    src={leftTrack.snippet}
                    isPlaying={activePlayer === 'player1'}
                    onTogglePlay={() => handleTogglePlay('player1')}
                    className={style.track_player}
                    playerId='player1'
                  />
                </div>
                
                
                <div className={style.or_separator}><p>Or</p></div>

                <div className={style.cardbox}>
                  <div className={style.parentOfSong} onClick={() => handleParentOfSongClick("right")}>
                      <img
                        className={style.image}
                        src={rightTrack.track_image}
                        alt={`Album cover for ${rightTrack.track_name}`}
                        // onMouseOver={() => {setNewTrack(rightTrack)}}
                      />
                    <p className={style.track_names}>
                      <span className={style.text}>
                        <span className={style.track_name}>
                          {rightTrack.track_name && rightTrack.track_name.length > 31
                            ? `${rightTrack.track_name.substring(0, 28)}...`
                            : rightTrack.track_name}
                        </span>
                        <span className={style.track_artist}>
                          {rightTrack.track_artist && rightTrack.track_artist.length > 31
                            ? `${rightTrack.track_artist.substring(0, 28)}...`
                            : rightTrack.track_artist}
                        </span>
                      </span>
                      <a href={rightTrack.track_uri}>
                        <img className={style.logo} src="/logo.png"/>
                      </a>
                    </p>
                  </div>
                  <AudioPlayer
                    src={rightTrack.snippet}
                    isPlaying={activePlayer === 'player2'}
                    onTogglePlay={() => handleTogglePlay('player2')}
                    className={style.track_player}
                    playerId='player2'
                  />
                </div>
                
              </div>
            </div>
          )
        ) : (
          <Loader/>
        )}
      </div>
    </>
  );
};

export default Swap;
