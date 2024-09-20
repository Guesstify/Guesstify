"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";
import style from "../../../styles/game.module.scss";
import Cookies from "js-cookie";

const TrackList = () => {
  const [tracks, setTracks] = useState([]);
  const [leftTrack, setLeftTrack] = useState({});
  const [rightTrack, setRightTrack] = useState({});
  const [newTrack, setNewTrack] = useState({});
  const [ready, setReady] = useState("loading");
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [userInfo, setUserInfo] = useState({});
  const [leftStreak, setLeftStreak] = useState(0);
  const [rightStreak, setRightStreak] = useState(0);
  const [hearts, setHearts] = useState(3);
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const fetchData = async () => {
    const spotifyToken = Cookies.get("spotify_token"); // => 'value'
    const requestOptions = {
      method: "GET",
      credentials: "include", // For including cookies in the request
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${spotifyToken}`, // Assuming the token is used for authorization
      },
    };
    try {

      const spotifyToken = Cookies.get('spotify_token')


      fetch(`${backendUrl}/user_top_tracks`, {
        method: "GET",
        credentials: "include",
        headers: {
          accept: "application/json",
          'Authorization': `Bearer ${spotifyToken}` // Assuming the token is used for authorization
        },
      })
        .then((response) => response.json())
        .then((data) => {
          setTracks(data["data_list"]);
          setGameInfo((prevGameInfo) => ({
            ...prevGameInfo,
            tracks: data["data_list"],
          }));
          setReady("ready");
        })
        .catch((error) => {
          // Handle any errors here
          console.error("Error fetching data:", error);
        });
    } catch (error) {
      console.error("Error fetching game data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // Additional actions after response.json() resolves
    getTrack(setLeftTrack, "none");
    getTrack(setRightTrack, "none");
  }, [ready]);

  // code to keep track of streak counters
  useEffect(() => {
    if (leftStreak === 3) {
      setLeftStreak(0);
      getTrack(setLeftTrack, "none");
    }
    if (rightStreak >= 3 && rightStreak % 3 === 0) {
      setRightStreak(0);
      getTrack(setRightTrack, "none");
    }
  }, [score]); // Dependency array

  //Adjust game score when final score changes
  useEffect(() => {
    // This useEffect will run every time 'score' changes
    setGameInfo((prevGameInfo) => ({
      ...prevGameInfo,
      gameScore: score,
    }));
  }, [score]);

  //End the game when the num of hearts becomes 0
  useEffect(() => {
    if (hearts === 0) {
      setGameOver(true);
    }
  }, [hearts]);

  const getTrack = (setter, trackSide) => {
    if (trackSide === "left") {
      if (leftTrack.rank < rightTrack.rank) {
        // Logic to handle streaks from breaking game
        setScore(score + 1);
        setLeftStreak((prevStreak) => prevStreak + 1);
        setRightStreak(0);
      } else {
        // The Wrong Answer is Picked
        setHearts((prevCount) => prevCount - 1);
      }
    } else if (trackSide === "right") {
      if (rightTrack.rank < leftTrack.rank) {
        // Logic to handle streaks from breaking game
        setRightStreak((prevStreak) => prevStreak + 1);
        setLeftStreak(0);
        setScore(score + 1);
      } else {
        // The Wrong Answer is Picked
        setHearts((prevCount) => prevCount - 1);
      }
    }
    setTracks((prevTracks) => {
      if (Array.isArray(prevTracks) && prevTracks.length > 0) {
        const [nextTrack, ...remainingTracks] = prevTracks;
        setter(nextTrack);
        setNewTrack(nextTrack);
        return remainingTracks;
      }
    });
  };

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
        <h1 className={style.title}>Guesstify</h1>
        <div className="heartsContainer">
          {Array.from({ length: hearts }).map((_, index) => (
            <span className={style.hearts} key={index}>
              ❤️
            </span>
          ))}
          {Array.from({ length: 3 - hearts }).map((_, index) => (
            <span className={style.hearts} key={index}>
              💔
            </span>
          ))}
        </div>

        {score >= 3 ? (
          <p className={style.score}>🔥Score: {score}🔥</p>
        ) : (
          <p className={style.score}>Score: {score}</p>
        )}

        {gameOver && <p className={style.score}>Game Over</p>}
        {newTrack && rightTrack && !gameOver && (
          <div>
            <h2 className={style.title_question}>
              Which song have you listened to more?
            </h2>
            <div className={style.track_selectors}>
              <div className={style.parentOfSong}>
                <img
                  className={style.image}
                  src={leftTrack.album_cover}
                  alt={`Album cover for ${leftTrack.track_name}`}
                  onClick={() => getTrack(setRightTrack, "left")}
                />
                <p
                  className={style.track_names}
                >{`${leftTrack.track_name} by ${leftTrack.artist}`}</p>
              </div>
              <div className={style.parentOfSong}>
                <img
                  className={style.image}
                  src={rightTrack.album_cover}
                  alt={`Album cover for ${rightTrack.track_name}`}
                  // We set the opposite track side here because the one we pick stay
                  onClick={() => {
                    getTrack(setLeftTrack, "right");
                  }}
                />
                <p
                  className={style.track_names}
                >{`${rightTrack.track_name} by ${rightTrack.artist}`}</p>
              </div>
            </div>
            <div className={style.track_player}>{audioPlayer}</div>
          </div>
        )}
      </div>
    </>
  );
};

export default TrackList;
