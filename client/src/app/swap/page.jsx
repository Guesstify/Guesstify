"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import style from "../../../styles/swap.module.scss";
import { useSearchParams } from 'next/navigation';
import hamster from "../../../styles/hamster.module.scss";
import Cookies from 'js-cookie';
const spotifyToken = Cookies.get('spotify_token');

const Swap = () => {
  const [tracks, setTracks] = useState([]);
  const [leftTrack, setLeftTrack] = useState({});
  const [rightTrack, setRightTrack] = useState({});
  const [newTrack, setNewTrack] = useState({});
  const [ready, setReady] = useState("loading");
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [userInfo, setUserInfo] = useState({});
  const [gameInfo, setGameInfo] = useState({});
  const [leftStreak, setLeftStreak] = useState(0);
  const [rightStreak, setRightStreak] = useState(0);
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const searchParams = useSearchParams();
  const effectRan = useRef(false);

  async function fetchPlaylistItems(offset) {
    
  
    const playlist_id = searchParams.get("id");
    console.log("playlist_id using search param: ");
    console.log(playlist_id);
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
  
        try {
          const results = await Promise.all([
            fetchPlaylistItems(0),
            fetchPlaylistItems(100),
          ]);
  
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
          console
        }
        catch (error) {
          console.error("Failed to fetch playlist items", error);
        }
        
      };

      fetchAllItems();
    }
    
    
    return () => {
      effectRan.current = true;
    }


  }, []);


  useEffect(() => {
    console.log("ready");
    // Additional actions after response.json() resolves
    getTrack(setLeftTrack, "none", {}, {},0);
    getTrack(setRightTrack, "none", {}, {}, 1);
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
      getTrack(setRightTrack, "none");
    }
  }, [score]); // Dependency array


  const getTrack = (setter, trackSide, leftTrack, rightTrack, startVal) => {
    if (trackSide === "left") {
        setLeftStreak((prevStreak) => prevStreak + 1);
        setRightStreak(0);
    } else if (trackSide === "right") {
        setRightStreak((prevStreak) => prevStreak + 1);
        setLeftStreak(0);
    }
    setTracks((prevTracks) => {
      if (Array.isArray(prevTracks) && prevTracks.length > 0) {
        var nextTrack;
        if(!leftTrack || !rightTrack){
          nextTrack = prevTracks[startVal];
        }
        else{
          // Randomly select a track until it has a different rank than the current track
          do {
              nextTrack = prevTracks[Math.floor(Math.random() * prevTracks.length)];
          } while (((nextTrack.ranking === leftTrack.ranking) || (nextTrack.ranking === rightTrack.ranking)) && prevTracks.length > 1);
        }
        
        setter(nextTrack);
        setNewTrack(nextTrack);
        console.log("length:", prevTracks.length);
        return prevTracks;
      }
    });
  }

  const AudioPlayer = ({ src }) => {
    return (
      <audio controls autoPlay>
        <source src={src} type="audio/mp3" />
        Your browser does not support the audio element.
      </audio>
    );
  };
  
  const audioPlayer = useMemo(
    () => <AudioPlayer src={newTrack.snippet} />,
    [newTrack]
  );

  return (
    <>
      <div className={style.container}>
        <h1 className={style.title}>Spotify Vinyls</h1>
        {newTrack && rightTrack && !gameOver && (
          <div>
            <h2 className={style.title_question}>
              Which song best fits the playlist?
            </h2>
            <div className={style.track_selectors}>
              <div className={style.parentOfSong}>
                <img
                  className={style.image}
                  src={leftTrack.track_image}
                  alt={`Album cover for ${leftTrack.track_name}`}
                  onClick={() => getTrack(setRightTrack, "left", leftTrack, rightTrack, 0)}
                />
                <p
                  className={style.track_names}
                >{`${leftTrack.track_name} by ${leftTrack.track_artist}`}</p>
              </div>
              <div className={style.parentOfSong}>
                <img
                  className={style.image}
                  src={rightTrack.track_image}
                  alt={`Album cover for ${rightTrack.track_name}`}
                  // We set the opposite track side here because the one we pick stay
                  onClick={() => {
                    getTrack(setLeftTrack, "right", leftTrack, rightTrack, 1);
                  }}
                />
                <p
                  className={style.track_names}
                >{`${rightTrack.track_name} by ${rightTrack.track_artist}`}</p>
              </div>
            </div>
            <div className={style.track_player}>{audioPlayer}</div>
          </div>
        )}
      </div>
    </>
  );
};

export default Swap;
