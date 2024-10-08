"use client";
import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import style from "../../../styles/create.module.scss";
import Cookies from 'js-cookie';
import { useSearchParams } from 'next/navigation';
import HeaderComponent from '../header';
import Loader from '../loader';
import StaticLoader from '../staticloader'
import '../../../styles/header.module.scss';

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
const spotifyToken = Cookies.get('spotify_token');

async function getRecs(songs) {
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
  console.log("meow mid rec: ", returnVal);
  return returnVal.data_list;
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

  const returnVal = response.json();
  return returnVal;
}

async function getPlaylist(playlist_id) {
  const response = await fetch(`${backendUrl}/get_playlist?id=${playlist_id}`, {
    method: "GET",
    credentials: "include",
    headers: {
      'Authorization': `Bearer ${spotifyToken}`,
    },
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const returnVal = response.json();
  return returnVal;
}

async function addSongs(playlist_id, track_chunk) {
  console.log(track_chunk);
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
  const username = Cookies.get('username');
  const effectRan = useRef(false);
  const searchParams = useSearchParams();
  const playlistName = searchParams.get("name");
  const [createButtonClicked, setCreateButtonClicked] = useState(false);
  const [playlistCreated, setPlaylistCreated] = useState(false);
  const [recommendedSongs, setRecommendedSongs] = useState([]);
  const [returnedPlaylist, setReturnedPlaylist] = useState({});

  useEffect(() => {
    if (!spotifyToken) {
      router.push("/");
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
          console.log(create)
          const playlist_id = create.id

          const numSongs = tracks.length;
          const numChunks = Math.ceil(numSongs / 100);

          const sortedTracks = [...tracks].sort((a, b) => a.ranking - b.ranking);

          const top5Songs = sortedTracks.slice(0, 5);

          const recs = await getRecs(top5Songs);
          

          const sortedTracksSongNames = new Set(sortedTracks.map(obj => obj.track_name));

          const filteredRecTracks =  recs.filter(obj => !sortedTracksSongNames.has(obj.song_name));

          const sample = filteredRecTracks.slice(0,6)
          setRecommendedSongs(sample);

          // Split the tracks into chunks
          const recsAndOrigCombined = [...sortedTracks.slice(0,20), ...filteredRecTracks.slice(0,20)]

          // chunks.push(filteredSortedTracks.slice(0,15))

          // for (let i = 0; i < numSongs; i += 100) {
          //   chunks.push(sortedTracks.slice(i, i + 100));
          // }
          // // Send each chunk starting from the highest offset

          await addSongs(playlist_id, recsAndOrigCombined)

          // for (let i = numChunks - 1; i >= 0; i--) {
          //   const chunk = chunks[i];
          //   await addSongs(playlist_id, chunk);
          // }
          setReturnedPlaylist(await getPlaylist(playlist_id))
          console.log(returnedPlaylist)

          setPlaylistCreated(true);
        } catch (error) {
          console.error("Failed to make and add to playlist", error);
          if (error.response && error.response.status === 401) {
            router.push("/");
          }
        }
      };

      newPlaylist();
    }
  }, [createButtonClicked]);

  const handleCreate = () => {
    console.log("setting create button click true");
    setCreateButtonClicked(true);
  };

  return (
    <div className={style.container}>
      <HeaderComponent />

      {createButtonClicked ? (
        (recommendedSongs.length > 0 && playlistCreated) ? (
          <div className={style.content}>
            <div className={style.playlist_side}>
              <h1>Your New Playlist</h1>
              <a href={returnedPlaylist.playlist_uri} className={style.playlist_content}>
                  <img src={returnedPlaylist.image} alt="Playlist Image" />
                  <div className={style.playlist_name}>
                    <p>{returnedPlaylist.name.length > 31 ? `${returnedPlaylist.name.substring(0, 28)}...` : returnedPlaylist.name}</p>
                  </div>
                  <div className={style.playlist_user}>
                    <p>{returnedPlaylist.user.length > 31 ? `${returnedPlaylist.user.substring(0, 28)}...` : returnedPlaylist.user}</p>
                  </div>
                  <img className={style.logo} src="/logo.png" alt="Logo" />
              </a>

            </div>

            <div className={style.rec_side}>
              <h1>Recommended Songs</h1>
              <div className={style.rec_grid}>
              {recommendedSongs.map((song) => (
                <a href={song.track_uri} className={style.rec_item}>
                  <img className={style.rec_image} src={song.album_image} alt={song.song_name} />
                  <div className={style.rec_song_text}>
                    <div className={style.rec_song_name}>
                      {song.song_name.length > 31 ? `${song.song_name.substring(0, 28)}...` : song.song_name}
                    </div>
                    <div className={style.rec_song_artist}>
                      {song.artist_name.length > 31 ? `${song.artist_name.substring(0, 28)}...` : song.artist_name}
                    </div>
                    
                  </div>
                  <img className={style.logo} src="/logo.png" alt="Logo" />
                </a>
              ))}
              </div>
            </div>
          </div>
          
          
        ) : (
          <Loader/>
        )
      ) : (
        <div className={style.not_ready}>
          <StaticLoader/>
          <button className={style.create_button} onClick={handleCreate}>Create!</button>
        </div>
      )}
    </div>
  );
};

export default Create;
