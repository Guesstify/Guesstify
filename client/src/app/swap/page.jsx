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

  const playlistName = searchParams.get("name");



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
        }
        catch (error) {
          console.error("Failed to fetch playlist items", error);
          if (error.response && error.response.status === 401) {
            router.push("/");
          }
        }
        
      };

      fetchAllItems();
    }
    
    return () => {
      effectRan.current = true;
    }


  }, []);


  useEffect(() => {
    console.log("ready and setting tracks");
    // Additional actions after response.json() resolves
    if(tracks.length > 0){
      getTrack(setLeftTrack, "none", {}, {},0);
      getTrack(setRightTrack, "none", {}, {}, 1);
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


  const getTrack = (setter, trackSide, leftTrack, rightTrack, startVal) => {
    setNumSongs(numSongs + 1)
    console.log(numSongs)
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
    }
    var nextTrack;
    if(!leftTrack || !rightTrack){
      nextTrack = tracks[startVal];
    }
    else{
      // Randomly select a track until it has a different rank than the current track
      do {
          nextTrack = tracks[Math.floor(Math.random() * tracks.length)];
      } while (((nextTrack.ranking === leftTrack.ranking) || (nextTrack.ranking === rightTrack.ranking)) && tracks.length > 1);
    }
    
    setter(nextTrack);
    setNewTrack(nextTrack);
    console.log("new ranking:", nextTrack.ranking);
  }

  const AudioPlayer = ({ src }) => {
    return (
      <audio controls autoPlay>
        <source src={src} type="audio/mp3" />
        Your browser does not support the audio element.
      </audio>
    );
  };

  const handleCreate = () => {
    if (tracks && tracks.length > 0) {
      // Save tracks to local storage
      localStorage.setItem('tracks', JSON.stringify(tracks));
      // Navigate to the new page
      router.push('/create?name=[Vinyl] ' + playlistName);
    }
  };
  
  const audioPlayer = useMemo(
    () => <AudioPlayer src={newTrack.snippet} />,
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
