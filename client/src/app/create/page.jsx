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


async function getRecs(songs) {
  const response = await fetch(`${backendUrl}/recommend_songs?song1=${songs[0]}&song2=${songs[1]}&song3=${songs[2]}&song4=${songs[3]}&song5=${songs[4]}`, {
    method: "GET",
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


async function addSongs(playlist_id, track_chunk) {

    console.log(track_chunk)
    const response = await fetch(`${backendUrl}/add_songs?playlist_id=${playlist_id}`, {
      method: "POST",
      credentials: "include",
      headers: {
        'Authorization': `Bearer ${spotifyToken}`,
      },
      body: JSON.stringify(track_chunk)
    });
  
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  
    const returnVal = await response.json();
    return returnVal;
}

const Create = () => {
  const [tracks, setTracks] = useState([]);
  const [ready, setReady] = useState(false);
  const [initialCreate, setInitialCreate] = useState(false);
  const [addedSongs, setAddedSongs] = useState(false);
  const router = useRouter();
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const username = Cookies.get('username')
  const effectRan = useRef(false);
  const searchParams = useSearchParams();
  const playlistName = searchParams.get("name");
  const [newPlaylist, setNewPlaylist] = useState({});
  const [recSongs, setRecSongs] = useState({});

//   const [song1, setSong1] = use
 



  useEffect(() => {
    if (!spotifyToken) {

        router.push("/")
    }
  }, [spotifyToken]);


  useEffect(() => {
    if (effectRan.current === false) {
      const storedTracks = localStorage.getItem('tracks');
      if (storedTracks) {
        setTracks(JSON.parse(storedTracks));
      }
      effectRan.current = true;
    }
  }, []);

  useEffect(() => {
    if (tracks.length > 0) {
      const newPlaylist = async () => {
        console.log("fetching all Items");

        try {
          const create = await makePlaylist(username, playlistName);

          const numSongs = tracks.length;
          const numChunks = Math.ceil(numSongs / 100);

          const sortedTracks = [...tracks].sort((a, b) => a.ranking - b.ranking);

          const top5Songs = sortedTracks.slice(0,5);

          // Split the tracks into chunks
          const chunks = [];
          for (let i = 0; i < numSongs; i += 100) {
            chunks.push(sortedTracks.slice(i, i + 100));
          }
          // Send each chunk starting from the highest offset

          // setRecSongs(getRecs(top5Songs))

          for (let i = numChunks - 1; i >= 0; i--) {
            const chunk = chunks[i];
            await addSongs(create, chunk);
          }

          
        } catch (error) {
          console.error("Failed to make and add to playlist", error);
          if (error.response && error.response.status === 401) {
            router.push("/");
          }
        }
      };

      newPlaylist();
    }
  }, [ready]);

  const handleCreate = () => {
    setReady(true);
  };



  return (
    <div className={style.container}>
        <HeaderComponent />
        <button className={style.create_button} onClick={handleCreate}>Create!</button>
    </div>
  );
};

export default Create;
