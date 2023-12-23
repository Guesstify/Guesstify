"use client";
import React, { useState, useEffect, useRef } from "react";
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

        const data = await response.json();
        setTracks(data);
        setGameInfo((prevGameInfo) => {
          return {
            ...prevGameInfo,
            tracks: data,
          };
        });
        setReady("ready");
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
    // Additional actions after response.json() resolves
    getTrack(setLeftTrack, "none");
    getTrack(setRightTrack, "none");
  }, [ready]);

  // code to keep track of streak counters
  useEffect(() => {
    console.log("left streak: ", leftStreak);
    console.log("right streak: ", rightStreak);
    if (leftStreak % 3 === 0) {
      console.log("entering left streak");
      getTrack(setLeftTrack, "none");
    }
    if (rightStreak % 3 === 0) {
      console.log("entering right streak");
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
    if (trackSide === "left") {
      if (leftTrack.rank < rightTrack.rank) {
        setScore(score + 1);
        setLeftStreak((prevStreak) => prevStreak + 1);
        setRightStreak(0);
      } else {
        console.log(
          "left track name: ",
          leftTrack.track_name,
          "right track name: ",
          rightTrack.track_name
        );
        console.log(
          "left track rank: ",
          leftTrack.rank,
          "right track rank: ",
          rightTrack.rank
        );
        console.log("entry1: game over");
        setGameOver(true);
      }
    } else if (trackSide === "right") {
      if (rightTrack.rank < leftTrack.rank) {
        setRightStreak((prevStreak) => prevStreak + 1);
        setLeftStreak(0);
        setScore(score + 1);
      } else {
        console.log(
          "left track name: ",
          leftTrack.track_name,
          "right track name: ",
          rightTrack.track_name
        );
        console.log(
          "left track rank: ",
          leftTrack.rank,
          "right track rank: ",
          rightTrack.rank
        );
        console.log("entry2: game over");
        setGameOver(true);
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

  return (
    <>
      <h1 className={style.title}>Hello {userInfo.display_name}</h1>
      {score >= 3 && <p>🔥YOU ARE ON A STREAK🔥</p>}
      <p>Score: {score}</p>
      {gameOver && <p>Game Over!</p>}
      {leftTrack && !gameOver && (
        <div>
          <p>Which song does THE_USER listen to more?</p>
          <div className={style.container}>
            <div className="leftTrack">
              <p>{`Rank ${leftTrack.rank}: ${leftTrack.track_name} by ${leftTrack.artist}`}</p>
              <img
                src={leftTrack.album_cover}
                alt={`Album cover for ${leftTrack.track_name}`}
                onClick={() => getTrack(setRightTrack, "left")}
              />
            </div>
            <div className="rightTrack">
              <p>{`Rank ${rightTrack.rank}: ${rightTrack.track_name} by ${rightTrack.artist}`}</p>
              <img
                src={rightTrack.album_cover}
                alt={`Album cover for ${rightTrack.track_name}`}
                // We set the opposite track side here because the one we pick stay
                onClick={() => getTrack(setLeftTrack, "right")}
              />
            </div>
          </div>
          <AudioPlayer src={newTrack.snippet} />
        </div>
      )}
    </>
  );
};

export default TrackList;
