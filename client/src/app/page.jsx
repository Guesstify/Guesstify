"use client";

// This is the home page
import Marquee from "react-fast-marquee";
import { FaSpotify } from "react-icons/fa";
import React from "react";
import style from "../../styles/home.module.scss";
export default function Home() {
  const handleClick = () => {
    window.location.href = "http://localhost:8000/login";
  };
  const messages = [
    "Test Your Taste!",
    "Test your friends!",
    "Test your family!",
    "Test your coworkers!",
    "Test your enemies!",
    "Test your pets!",
    "Test your siblings!",
    "Test your parents!",
    // Repeat the messages as many times as needed for the marquee effect
  ];
  return (
    <>
      <header>
        <title>Guesstify</title>
      </header>
      <div className={style.container}>
        <div className={style.title}>
          <span>G</span>
          <span>u</span>
          <span>e</span>
          <span>s</span>
          <span>s</span>
          <span>t</span>
          <span>i</span>
          <span>f</span>
          <span>y</span>
        </div>
        <p className={style.description}>
          Guesstify is a game where you choose between two songs, guessing which
          one you've listened to more. Correct guesses increase your score!
        </p>
        <button className={style.spotify_login_button} onClick={handleClick}>
          <FaSpotify className={style.spotify_logo} />
          Login with Spotify
        </button>
        <div className={style.marquee}>
          <Marquee>
            {messages.map((message, index) => (
              <p key={index} className={style.scrolling_text}>
                {message}
              </p>
            ))}
          </Marquee>
        </div>
      </div>
    </>
  );
}
