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
          console.error("Failed to fetch playlists data:", error);
          if (error.response && error.response.status === 401) {
            router.push("/");
          }
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

  const moveToSwap = (playlistID, playlistName) => {
    router.push("/swap?id=" + playlistID + "&name=" + playlistName);
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
      <h1>User Playlists</h1>
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
                    <li key={result.playlist_id} onClick={() => moveToSwap(result.playlist_id, result.playlist_name)}>
                      {result.playlist_name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div className={style.playlist_grid}>
            {userPlaylists.map((playlist) => (
              <div key={playlist.playlist_id} className={style.playlist_item} onClick={() => moveToSwap(playlist.playlist_id, playlist.playlist_name)}>
                <img className={style.playlist_image} src={playlist.playlist_image} alt={playlist.playlist_name} />
                <p>{playlist.playlist_name.length > 31 ? `${playlist.playlist_name.substring(0, 28)}...` : playlist.playlist_name}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className={hamster.loader}>
          <div aria-label="Orange and tan hamster running in a metal wheel" role="img" className={hamster.wheel_and_hamster}>
            <div className={hamster.wheel}></div>
            <div className={hamster.hamster}>
              <div className={hamster.hamster__body}>
                <div className={hamster.hamster__head}>
                  <div className={hamster.hamster__ear}></div>
                  <div className={hamster.hamster__eye}></div>
                  <div className={hamster.hamster__nose}></div>
                </div>
                <div className={hamster.hamster__limb}>
                  <div className={hamster.fr}></div>
                  <div className={hamster.fl}></div>
                  <div className={hamster.br}></div>
                  <div className={hamster.bl}></div>
                </div>
                <div className={hamster.hamster__tail}></div>
              </div>
            </div>
            <div className={hamster.spoke}></div>
          </div>
        </div>

      )}
    </div>
  );
};

export default Playlists;
