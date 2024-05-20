"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import style from "../../../styles/grid.module.scss";
import Cookies from 'js-cookie';
import Popup from 'reactjs-popup';

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;


const ImageGrid = ({ data, tracksReady }) => {

  return (
      <div className={style.image_grid}>
          {data.map((item, index) => (
              <div key={index} className={style.grid_item}>
                <Popup trigger={<img src={item.artist_picture} alt={`Artist: ${item.artist_name}`}/>} modal nested>
                {
                    close => (
                        <div className={style.modal}>
                            <div className='content'>
                                <div className={style.artistInfo}>
                                  <h1>{item.artist_name}</h1>
                                  <img className={style.card_image} src={item.artist_picture} alt={`Artist: ${item.artist_name}`}/>
                                </div>
                                
                                <div className={style.songList}>
                                {
                                  item.ready ? (
                                    item.artist_top_tracks.map((track, index) => (
                                      <div className={style.trackItem} key={index}> {/* Add a container for each track */}
                                        <img className={style.albumArt} src={track.album_image} alt={`Album cover for ${track.album_name}`} />
                                        <div className={style.trackInfo}>
                                          <p>{index + 1}. {track.track_name.length > 31 ? `${track.track_name.substring(0, 28)}...` : track.track_name}</p>
                                          <p>Album: {track.album_name.length > 31 ? `${track.album_name.substring(0, 28)}...` : track.album_name}</p>
                                          <p>Popularity Score: {track.popularity}</p>
                                        </div>
                                      </div>
                                    ))
                                  ) : <p>loading...</p>
                                }
                                </div>
                                
                            </div>
                            <div>
                                <button className={style.close} onClick={() => close()}>
                                  X
                                </button>
                            </div>
                        </div>
                    )
                }
                </Popup>
                <p>{item.artist_name}</p>
              </div>
          ))}
      </div>
  );
};

const ChooseArtist = (ArtistName) => {
  console.log(ArtistName, " clicked")
}

const Grid = () => {
   const [artists, setArtists] = useState([]);
   const [isLoading, setIsLoading] = useState(true);
   const [artistsReady, setArtistsReady] = useState(false);
   const spotifyToken = Cookies.get('spotify_token')


  useEffect(() => {
    fetch(`${backendUrl}/user_top_artists`, {
      method: "GET",
      credentials: "include",
      headers: {
        'Authorization': `Bearer ${spotifyToken}`
      },
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(fetchData => {
      setArtists(fetchData["data_list"]);
      setArtistsReady(true);

      setIsLoading(false);
    })
    .catch(error => console.error("Failed to fetch artist data:", error))
  }, []);



 useEffect(() => {
  const fetchArtistsTopTracks = async () => {
    if (artists.length > 0) {
      const updatedArtists = await Promise.all(artists.map(async (artist) => {
        try {
          const response = await fetch(`${backendUrl}/artist_top_tracks?artist_id=${artist["id"]}`, {
            method: "GET",
            credentials: "include",
            headers: {
              'Authorization': `Bearer ${spotifyToken}`
            },
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const fetchData = await response.json();
          return {...artist, artist_top_tracks: fetchData["data_list"], ready: true};
        } catch (error) {
          console.error("Failed to fetch artist's track info:", error);
          return artist; // Return the artist unchanged if there was an error.
        }
      }));

      setArtists(updatedArtists); // Update the state with the new array
    }
  };

  fetchArtistsTopTracks();
}, [artistsReady]);

  return ( 
    
    <div className={style.container}>
        <h1>Your Top Artists</h1>
        {isLoading ? (
            <div className={style.spinner}></div> // Display spinner when loading
          ) : (
            <ImageGrid data={artists}/>
          )
        }
    </div>
  );

  
};

export default Grid;
