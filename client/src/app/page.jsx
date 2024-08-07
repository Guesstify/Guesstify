"use client";
import Marquee from "react-fast-marquee";
import React from "react";
import style from "../../styles/home.module.scss";
import Link from "next/link";
export default function Home() {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

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
          <h1>Spotify</h1>
        <div className={style.title}>
          <span>V</span>
          <span>I</span>
          <span>N</span>
          <span>Y</span>
          <span>L</span>
          <span>S</span>
        </div>
        <Link
          className={style.spotify_login_button}
          href={`${backendUrl}/login`}
        >
          Login with Spotify
        </Link>
        {/* <div className={style.marquee}>
          <Marquee>
            {messages.map((message, index) => (
              <p key={index} className={style.scrolling_text}>
                {message}
              </p>
            ))}
          </Marquee>
        </div> */}
      </div>
    </>
  );
}
