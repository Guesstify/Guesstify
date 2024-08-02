"use client";
import Marquee from "react-fast-marquee";
import React from "react";
import style from "../../styles/home.module.scss";
import Link from "next/link";
import { Helmet } from "react-helmet";
export default function Home() {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  return (

    
    <>
      <Helmet>
        <title>Guesstify</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link
          href="https://fonts.googleapis.com/css2?family=Nanum+Myeongjo&display=swap"
          rel="stylesheet"
        />
      </Helmet>
      <div className={style.container}>
        <div className={style.main_message}>
          I wanna listen to new music.
        </div>
        
        <h2 className={style.description}>
          Tell us which songs you like on your Spotify playlist. We’ll introduce you to some new tunes.
        </h2>
        <Link
          className={style.spotify_login_button}
          href={`${backendUrl}/login`}
        >
          Generate my new playlist
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
