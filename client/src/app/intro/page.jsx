"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import style from "../../../styles/intro.module.scss";

const About = () => {
  const [userInfo, setUserInfo] = useState(null);
  const router = useRouter();
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  // fetch user
  useEffect(() => {
    const spotifyToken = getCookie('spotify_token'); // Retrieve the Spotify token

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
        console.log(data);
      })
      .catch((error) => console.error("Error:", error));
  }, []);

  // Handling function for clicking the "Start Game" button
  const handleGlobal = () => {
    // Perform actions when the "Start Game" button is clicked
    // console.log("Entering Game");
    router.push("/game/");
  };

  return (
    <div className={style.container}>
      <h1 className={style.title}>Guesstify</h1>
      <p className={style.summary}>
        Hey {userInfo ? userInfo.display_name : "Guest"}!!! <br></br>
        Lets see how well you know your music!
        {backendUrl}
      </p>
      <div>
        <button className={style.game_button} onClick={handleGlobal}>
          Play
        </button>
        {/* This is the second mode to implement */}
        {/* <button onClick={handleShared}>Shared Mode</button> */}
      </div>
    </div>
  );
};

export default About;
