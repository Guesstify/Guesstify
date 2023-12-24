"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";
import style from "../../../styles/game.module.scss";
const TrackList = () => {
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const accessToken = getCookie("accessToken");
        const response = await fetch("http://localhost:8000/user_top_tracks", {
          method: "GET",
          credentials: "include",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        fetch("http://localhost:8000/user_top_tracks", {
          method: "GET",
          credentials: "include",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
          .then((response) => response.json())
          .then((data) => {
            setTracks(data);
            setGameInfo((prevGameInfo) => ({
              ...prevGameInfo,
              tracks: data,
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
      try {
        const user_info_url = "http://localhost:8000/user_info";
        const requestOptions = {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include", // For including cookies in the request
        };
        // Missing fetch call added here
        fetch(user_info_url, requestOptions)
          .then((response) => response.json())
          .then((data) => {
            setUserInfo(data);
            setGameInfo((prevGameInfo) => {
              return {
                ...prevGameInfo,
                userName: data.display_name,
              };
            });
          })
          .catch((error) => console.error("Error:", error));
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    console.log("ready")
    // Additional actions after response.json() resolves
    getTrack(setLeftTrack, "none");
    getTrack(setRightTrack, "none");
  }, [ready]);

  // code to keep track of streak counters
  useEffect(() => {
    if (leftStreak === 3) {
      console.log("entering left streak");
      setLeftStreak(0);
      getTrack(setLeftTrack, "none");
    }
    if (rightStreak >= 3 && rightStreak % 3 === 0) {
      console.log("entering right streak");
      setRightStreak(0);
      getTrack(setRightTrack, "none");
    }
  }, [score]); // Dependency array

  // Helper function to get a cookie by name
  const getCookie = (name) => {
    const cookieString = document.cookie;
    const cookies = cookieString.split(";").map((cookie) => cookie.trim());
    const foundCookie = cookies.find((cookie) => cookie.startsWith(`${name}=`));

    return foundCookie ? foundCookie.split("=")[1] : null;
  };

  //Adjust game score when final score changes
  useEffect(() => {
    // This useEffect will run every time 'score' changes
    setGameInfo((prevGameInfo) => ({
      ...prevGameInfo,
      gameScore: score,
    }));
  }, [score]);

  const getTrack = (setter, trackSide) => {
    console.log("getTrack")
    if (trackSide === "left") {
      if (leftTrack.rank < rightTrack.rank) {
        setScore(score + 1);
        setLeftStreak((prevStreak) => prevStreak + 1);
        setRightStreak(0);
      } else {
        setGameOver(true);
      }
    } else if (trackSide === "right") {
      if (rightTrack.rank < leftTrack.rank) {
        setRightStreak((prevStreak) => prevStreak + 1);
        setLeftStreak(0);
        setScore(score + 1);
      } else {
        setGameOver(true);
      }
    }
    console.log(tracks.length);
    setTracks((prevTracks) => {
      if (Array.isArray(prevTracks) && prevTracks.length > 0) {
        const [nextTrack, ...remainingTracks] = prevTracks;
        setter(nextTrack);
        setNewTrack(nextTrack);
        console.log("length:", remainingTracks.length)
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
  const audioPlayer = useMemo(() => <AudioPlayer src={newTrack.snippet} />, [newTrack]);

  return (
    <>
      <div className={style.container}>
        <h1 className={style.title}>Guesstify</h1>
        {score >= 3 ? (
          <p className={style.score}>🔥Score: {score}🔥</p>
        ) : (
          <p className={style.score}>Score: {score}</p>
        )}
        {gameOver && <p className={style.score}>Game Over!</p>}
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
            <div className={style.track_player}>
              {audioPlayer}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default TrackList;
