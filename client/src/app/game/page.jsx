"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';

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
    console.log("Default mode clicked");
    router.push("http://localhost:3000/game/global");
  };

  /* [TODO: I am able to send my link to others to play my game :) ] */
  // // Handling function for clicking the "End Game" button
  // const handleShared = () => {
  //   // Perform actions when the "End Game" button is clicked
  //   console.log("Shared mode clicked");
  // };

  return (
    <>
      <h1>Welcome</h1>
      {userInfo && <div>{userInfo.display_name}</div>}
      <div>
        <button onClick={handleGlobal}>Global Mode</button>
        {/* This is the second mode to implement */}
        {/* <button onClick={handleShared}>Shared Mode</button> */}
      </div>
    </>
  );
};

export default About;
