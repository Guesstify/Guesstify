"use client";

import React, { useEffect, useState } from "react";

const About = () => {
  const [userInfo, setUserInfo] = useState(null);

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

  return (
    <>
      <h1>Welcome</h1>
      {userInfo && <div>{userInfo.display_name}</div>}
    </>
  );
};

export default About;
