"use client";
import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import style from "../../../styles/create.module.scss";
import Cookies from 'js-cookie';
import { useSearchParams } from 'next/navigation';
import HeaderComponent from '../header';
import '../../../styles/header.module.scss';
const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
const spotifyToken = Cookies.get('spotify_token') // => 'value'



async function makePlaylist(username, playlistName) {
    const response = await fetch(`${backendUrl}/create_playlist?username=${username}&playlist_name=${playlistName}`, {
      method: "POST",
      credentials: "include",
      headers: {
        'Authorization': `Bearer ${spotifyToken}`,
      },

    });
  
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  
    const returnVal = await response.json();
    return returnVal;
}


async function addSongs(offset) {
    const response = await fetch(`${backendUrl}/user_playlists?offset=${offset}&limit=${limit}`, {
      method: "POST",
      credentials: "include",
      headers: {
        'Authorization': `Bearer ${spotifyToken}`,
      },


    });
  
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  
    const returnVal = await response.json();
    return returnVal;
}

const Create = () => {
  const [tracks, setTracks] = useState([]);
  const [initialCreate, setInitialCreate] = useState(false);
  const [addedSongs, setAddedSongs] = useState(false);
  const router = useRouter();
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const username = Cookies.get('username')
  const effectRan = useRef(false);
  const searchParams = useSearchParams();
  const playlistName = searchParams.get("name");
 



  useEffect(() => {
    if (!spotifyToken) {

        router.push("/")
    }
  }, [spotifyToken]);


  useEffect(() => {

    if(effectRan.current === false){
        const newPlaylist = async () => {
            console.log("fetching all Items");

            try {
                const create = await makePlaylist(username, playlistName)
                
                // const results = await Promise.all([
                // fetchPlaylistItems(0),
                // fetchPlaylistItems(100),
                // ]);

                
            }
            catch (error) {
                console.error("Failed to make and add to playlist", error);
                if (error.response && error.response.status === 401) {
                    router.push("/");
                }
            }
        
        };

        newPlaylist();
    }

    return () => {
        effectRan.current = true;
    }
    


  }, []);

  useEffect(() => {
    console.log(tracks)
  }, [tracks]);




  return (
    <div className={style.container}>
      <HeaderComponent />
      <p>hello</p>
    </div>
  );
};

export default Create;
