"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import style from "../../../styles/intro.module.scss";

const About = () => {
  const [userInfo, setUserInfo] = useState(null);
  const router = useRouter();

  // fetch user info
  useEffect(() => {
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
        Lets see how well
        you know your music!
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
