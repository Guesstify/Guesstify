"use client";
import Marquee from "react-fast-marquee";
import React from "react";
import style from "../../styles/home.module.scss";
import Link from "next/link";
export default function Home() {
  const backendUrl = process.env.BACKEND_URL;
  console.log(backendUrl);
  const handleClick = () => {
    window.location.href = `${backendUrl}/login`;
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
          <span>U</span>
          <span>E</span>
          <span>S</span>
          <span>S</span>
          <span>T</span>
          <span>I</span>
          <span>F</span>
          <span>Y</span>
        </div>
        <button className={style.spotify_login_button} onClick={handleClick}>
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
