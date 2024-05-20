"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import style from "../../../styles/grid.module.scss";
import Cookies from 'js-cookie';
import Popup from 'reactjs-popup';
const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
const spotifyToken = Cookies.get('spotify_token');
const username = Cookies.get('username');



const Swap = () => {
    const [userPlaylists, setUserPlaylists] = useState([]);
    
    useEffect(() => {
        fetch(`${backendUrl}/user_playlists?offset=0&limit=50`, {
          method: "GET",
          credentials: "include",
          headers: {
            'Authorization': `Bearer ${spotifyToken}`,
          },
        })
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then(fetchData => {
          console.log(fetchData);
          setUserPlaylists(fetchData["data_list"]);
        })
        .catch(error => console.error("Failed to fetch artist data:", error))
    }, []);
};



export default Swap;