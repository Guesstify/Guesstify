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
        setReady("ready");
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    // Additional actions after response.json() resolves
    getTrack(setLeftTrack, "none");
    getTrack(setRightTrack, "none");
  }, [ready]);

  // Helper function to get a cookie by name
  const getCookie = (name) => {
    const cookieString = document.cookie;
    const cookies = cookieString.split(";").map((cookie) => cookie.trim());
    const foundCookie = cookies.find((cookie) => cookie.startsWith(`${name}=`));

    return foundCookie ? foundCookie.split("=")[1] : null;
  };

  const endGame = () => {
    setGameOver(true);
  };

  const getTrack = (setter, trackSide) => {
    console.log(trackSide);
    if (trackSide === "left") {
      if (leftTrack.rank < rightTrack.rank) {
        setScore(score + 1);
      } else {
        endGame();
      }
    } else if (trackSide === "right") {
      //trackSide === "right"
      if (rightTrack.rank < leftTrack.rank) {
        setScore(score + 1);
      } else {
        endGame();
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
