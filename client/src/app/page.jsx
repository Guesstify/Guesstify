"use client";
import Marquee from "react-fast-marquee";
import React from "react";
import style from "../../styles/home.module.scss";
import Link from "next/link";
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
        <p className={style.title}>Guesstify</p>
        <h2>Test your taste :D</h2>
        <button className={style.spotify_login_button} onClick={handleClick}>
          Login With Spotify
        </button>
        <Link href="/about">About</Link>
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
