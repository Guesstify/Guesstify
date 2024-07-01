"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import style from "../../../styles/intro.module.scss";
import Cookies from 'js-cookie';
import HeaderComponent from '../header';
import '../../../styles/header.module.scss';

const About = () => {
  const [userInfo, setUserInfo] = useState(null);
  const router = useRouter();
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const spotifyToken = Cookies.get('spotify_token') // => 'value'

  useEffect(() => {
    if (!spotifyToken) {

        router.push("/")
    }
  }, [spotifyToken]);

  useEffect(() => {
    
    const requestOptions = {
      method: "GET",
      credentials: "include", // For including cookies in the request
      headers: {
        accept: "application/json",
        'Authorization': `Bearer ${spotifyToken}` // Assuming the token is used for authorization
      },
    };
    fetch(`${backendUrl}/user_info`, requestOptions)
      .then((response) => {
        console.log("user_info")
        if (!response.ok) {
          console.log(response.details);
          console.log(response.status);
          console.log(response.statusText);
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        setUserInfo(data);
        Cookies.set('username', data["id"]);
        console.log(data);
      })
      .catch((error) => console.error("Error:", error));
  }, []);

  const handleArtists = () => {
    router.push("/grid/");
  };

  const handlePlaylists = () => {
    router.push("/playlists/");
  };

  const handleTracks = () => {
    router.push("/songs/");
  };

  return (
    <div className={style.container}>
      <HeaderComponent />
      <p className={style.summary}>
        Hey {userInfo ? userInfo.display_name : "Guest"}!!! <br></br>
        Lets explore your music library!
      </p>
      <div>
        <button className={style.game_button} onClick={handleTracks}>
          Top Tracks
        </button>
        <button className={style.game_button} onClick={handleArtists}>
          Top Artists
        </button>
        <button className={style.game_button} onClick={handlePlaylists}>
          Order Playlists
        </button>
      </div>
    </div>
  );
};

export default About;
