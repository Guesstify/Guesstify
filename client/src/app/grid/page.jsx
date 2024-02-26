"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import style from "../../../styles/grid.module.scss";
import Cookies from 'js-cookie';

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;


const ImageGrid = ({ data }) => {

  return (
      <div className={style.image_grid}>
          {data.map((item, index) => (
              <div key={index} className={style.grid_item}>
                  <img src={item.artist_picture} alt={`Artist: ${item.artist_name}`} onClick={() => ChooseArtist(item.artist_name)} />
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
        setArtists(fetchData);
        setIsLoading(false);
      })
      .catch(error => console.error("Failed to fetch artist data:", error));
    }, []);

    return ( 
      <div className={style.container}>
            <h1>Your Top Artists</h1>
            {isLoading ? (
                <div className={style.spinner}></div> // Display spinner when loading
              ) : (
                <ImageGrid data={artists} />
              )
            }
        </div>
  );

  
};

export default Grid;
