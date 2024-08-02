"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import { useRouter } from 'next/navigation';
import style from "../../../styles/swap.module.scss";
import { useSearchParams } from 'next/navigation';
import hamster from "../../../styles/hamster.module.scss";
import Cookies from 'js-cookie';
import HeaderComponent from '../header';
import '../../../styles/header.module.scss';
const spotifyToken = Cookies.get('spotify_token');
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
  const audioRef = useRef(null);
  const [volume, setVolume] = useState(0.5);



  const playlistName = searchParams.get("name");
  const playlistSize = searchParams.get("size");




  async function fetchPlaylistItems(offset) {
    
  
    const playlist_id = searchParams.get("id");
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
    if (rightStreak >= 3 && rightStreak % 3 === 0) {
      console.log("entering right streak");
      setRightStreak(0);
      getTrack(setRightTrack, "none", leftTrack, rightTrack, 0);
    }
  }, [leftStreak, rightStreak]); // Dependency array

  const initialGetTrack = (leftSetter, rightSetter) => {

    const newTracks = [...tracks]
    const leftTrack = newTracks.shift();
    const rightTrack = newTracks.shift();

    leftTrack.priorty = leftTrack.priority + 1 + Math.floor(Math.random() * 15)
    rightTrack.priorty = rightTrack.priority + 1 + Math.floor(Math.random() * 15)

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
    setNewTrack(rightTrack);
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

    nextTrack.priorty = nextTrack.priority + 1 + Math.floor(Math.random() * 15)
    const index = newTracks.findIndex(item => item.priority > nextTrack.priority);
    if (index === -1) {
        newTracks.push(nextTrack); // If no such index is found, obj should go at the end
    } else {
        newTracks.splice(index, 0, nextTrack);
    }

    setTracks(newTracks)
    console.log(tracks)
    
    setter(nextTrack);
    setNewTrack(nextTrack);
  }

  const AudioPlayer = ({ src, volume, setVolume }) => {
    const audioRef = useRef(null);
  
    useEffect(() => {
      if (audioRef.current) {
        audioRef.current.volume = volume;
      }
    }, [src]);
  
    useEffect(() => {
      if (audioRef.current) {
        audioRef.current.volume = volume;
      }
    }, [volume]);
  
    const handleVolumeChange = (event) => {
      const newVolume = event.target.volume;
      setVolume(newVolume);
    };
  
    return (
      <audio 
        controls 
        autoPlay 
        ref={audioRef} 
        onVolumeChange={handleVolumeChange}
      >
        <source src={src} type="audio/mp3" />
        Your browser does not support the audio element.
      </audio>
    );
  };


  const handleCreate = () => {
    if (tracks && tracks.length > 0) {
      // Save tracks to local storage
      tracks.sort((a, b) => b.ranking - a.ranking);
      localStorage.setItem('tracks', JSON.stringify(tracks));
      // Navigate to the new page
      router.push('/create?name=[Vinyls] ' + playlistName);
    }
  };

  const audioPlayer = useMemo(
    () => <AudioPlayer src={newTrack.snippet} volume={volume} setVolume={setVolume} />,
    [newTrack]
  );

  return (
    <>
      <div className={style.container}>
        <HeaderComponent/>
        <h1 className={style.title}>Reorder Playlists</h1>
        {ready === "ready" ? (
          newTrack && rightTrack && (
            <div>
              <h2 className={style.title_question}>
                Which song best fits the playlist?
              </h2>
              {numSongs > 20 && (
                <button onClick={handleCreate}>Create playlist!</button>
              )}
              <div className={style.track_selectors}>
                <div className={style.parentOfSong}>
                    <img
                      className={style.image}
                      src={leftTrack.track_image}
                      alt={`Album cover for ${leftTrack.track_name}`}
                      onClick={() => getTrack(setRightTrack, "left", leftTrack, rightTrack, 0)}
                      onMouseOver={() => {setNewTrack(leftTrack)}}
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
                <div className={style.parentOfSong}>
                    <img
                      className={style.image}
                      src={rightTrack.track_image}
                      alt={`Album cover for ${rightTrack.track_name}`}
                      onClick={() => {
                        getTrack(setLeftTrack, "right", leftTrack, rightTrack, 1);
                      }}
                      onMouseOver={() => {setNewTrack(rightTrack)}}
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
              </div>
              <div className={style.track_player}>{audioPlayer}</div>
            </div>
          )
        ) : (
          <div className={hamster.loader}>
            <div aria-label="Orange and tan hamster running in a metal wheel" role="img" className={hamster.wheel_and_hamster}>
              <div className={hamster.wheel}></div>
              <div className={hamster.hamster}>
                <div className={hamster.hamster__body}>
                  <div className={hamster.hamster__head}>
                    <div className={hamster.hamster__ear}></div>
                    <div className={hamster.hamster__eye}></div>
                    <div className={hamster.hamster__nose}></div>
                  </div>
                  <div className={hamster.hamster__limb}>
                    <div className={hamster.fr}></div>
                    <div className={hamster.fl}></div>
                    <div className={hamster.br}></div>
                    <div className={hamster.bl}></div>
                  </div>
                  <div className={hamster.hamster__tail}></div>
                </div>
              </div>
              <div className={hamster.spoke}></div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Swap;
