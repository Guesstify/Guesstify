"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import style from "../../../styles/playlists.module.scss";
import hamster from "../../../styles/hamster.module.scss";
import Cookies from 'js-cookie';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { faCompactDisc } from '@fortawesome/free-solid-svg-icons';
import HeaderComponent from '../header';
import Loader from '../loader';
import '../../../styles/header.module.scss';
const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
const spotifyToken = Cookies.get('spotify_token');


async function fetchPlaylists(offset, limit) {
  const response = await fetch(`${backendUrl}/user_playlists?offset=${offset}&limit=${limit}`, {
    method: "GET",
    credentials: "include",
    headers: {
      'Authorization': `Bearer ${spotifyToken}`,
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const returnVal = await response.json();
  return returnVal;
}

const Playlists = () => {
  const router = useRouter();
  const [userPlaylists, setUserPlaylists] = useState([]);
  const [playlistsReady, setPlaylistsReady] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const searchBoxRef = useRef(null);
  const effectRan = useRef(false);

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
        Cookies.set('username', data["id"]);
        console.log(data);
      })


    // Add event listener for clicks outside the search box
    const handleClickOutside = (event) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(event.target)) {
        setSearchResults([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    if(effectRan.current === false){
      const fetchAllPlaylists = async () => {
        try {
          const results = await Promise.all([
            fetchPlaylists(0, 49),
            fetchPlaylists(50, 50),
            fetchPlaylists(100, 50),
            fetchPlaylists(150, 50),
            fetchPlaylists(200, 50)
          ]);

          const allPlaylists = results.flatMap(data => data ? data.data_list : []);
          setUserPlaylists(allPlaylists);
          setPlaylistsReady(true);
        }
        catch (error) {
          console.error("Failed to fetch playlists data mf:", error);
          router.push("/");
        }
      };

      fetchAllPlaylists();
    }

    

    return () => {
      // Cleanup the event listener on component unmount
      document.removeEventListener("mousedown", handleClickOutside);
      effectRan.current = true;
    };
  }, []);

  const moveToSwap = (playlistID, playlistName, playlistSize) => {
    router.push("/swap?id=" + playlistID + "&name=" + playlistName + "&size=" + playlistSize);
  };

  const handleSearch = (event) => {
    const term = event.target.value;
    setSearchTerm(term);

    if (term.length > 0) {
      const filteredResults = userPlaylists
        .filter(playlist => playlist.playlist_name.toLowerCase().includes(term.toLowerCase()))
        .slice(0, 5);
      setSearchResults(filteredResults);
    } else {
      setSearchResults([]);
    }
  };

  

  return (
    <div className={style.container}>
      <HeaderComponent/>
      <div className={style.header}>
        Choose the playlist that you vibe with the most
      </div>
      
      <h3>(Min. 15 Tracks)</h3>
      {playlistsReady ? (
        <div>
          <div className={style.search_box} ref={searchBoxRef}>
            <div className={style.row}>
              <input
                type="text"
                id="input-box"
                placeholder="Search for your playlist"
                autoComplete="off"
                value={searchTerm}
                onChange={handleSearch}
              />
              <button><FontAwesomeIcon className={style.icon} icon={faMagnifyingGlass} /></button>
            </div>
            {searchResults.length > 0 && (
              <div className={style.result_box}>
                <ul>
                  {searchResults.map(result => (
                    <li key={result.playlist_id} onClick={() => moveToSwap(result.playlist_id, result.playlist_name, result.size)}>
                      {result.playlist_name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div className={style.playlist_grid}>
            {userPlaylists.map((playlist) => (
              <div key={playlist.playlist_id} className={style.playlist_item} onClick={() => moveToSwap(playlist.playlist_id, playlist.playlist_name, playlist.size)}>
                <div className={style.image_section}>
                  <img className={style.playlist_image} src={playlist.playlist_image} alt={playlist.playlist_name} />
                </div>
                <div className={style.text_section}>
                  <p className={style.playlist_name}>{playlist.playlist_name.length > 31 ? `${playlist.playlist_name.substring(0, 28)}...` : playlist.playlist_name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <Loader/>

      )}
    </div>
  );
};

export default Playlists;
