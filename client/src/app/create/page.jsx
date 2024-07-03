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
  print(songs)
  const response = await fetch(`${backendUrl}/recommend_songs?song1=${songs[0].track_id}&song2=${songs[1].track_id}&song3=${songs[2].track_id}&song4=${songs[3].track_id}&song5=${songs[4].track_id}`, {
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
  const router = useRouter();
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const username = Cookies.get('username')
  const effectRan = useRef(false);
  const searchParams = useSearchParams();
  const playlistName = searchParams.get("name");
  const [createButtonClicked, setCreateButtonClicked] = useState(false);
  const [playlistCreated, setPlaylistCreated] = useState(false);
  const [songsAdded, setSongsAdded] = useState(false);
  const [recommendedSongs, setRecommendedSongs] = useState({});

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

          setRecommendedSongs(getRecs(top5Songs))


          for (let i = numChunks - 1; i >= 0; i--) {
            const chunk = chunks[i];
            await addSongs(create, chunk);
          }

          console.log("songs: ", tracks)

          setPlaylistCreated(true)

          
        } catch (error) {
          console.error("Failed to make and add to playlist", error);
          if (error.response && error.response.status === 401) {
            router.push("/");
          }
        }
      };

      newPlaylist();
    }
  }, [tracks]);

  const handleCreate = () => {
    setCreateButtonClicked(true);
  };

  



  return (
    <div className={style.container}>
        <HeaderComponent />

        {createButtonClicked ? (
          playlistCreated ? (
            <p>playlist ready</p>
          ) : (
            <p>playlist not ready</p>
          )
        ) : (
          <button className={style.create_button} onClick={handleCreate}>Create!</button>
        ) /*check if playlist create button has been clicked*/}
        
    </div>
  );
};

export default Create;
