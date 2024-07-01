"use client";
import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import style from "../../../styles/tracks.module.scss";
import Cookies from 'js-cookie';
import Popup from 'reactjs-popup';
import HeaderComponent from '../header';
import '../../../styles/header.module.scss';
import hamster from "../../../styles/hamster.module.scss";


const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
const spotifyToken = Cookies.get('spotify_token')



const TrackGrid = ({ data, tracksReady }) => {

  return (
      <div className={style.image_grid}>
          {data.map((item, index) => (
              <div key={index} className={style.grid_item}>
                <img src={item.track_picture} alt={`track: ${item.track_name}`}/>
                <p>{item.track_name.length > 31 ? `${item.track_name.substring(0, 28)}...` : item.track_name}</p>
              </div>
          ))}
      </div>
  );
};

async function fetchTopTracks(offset) {
    
  const response = await fetch(`${backendUrl}/user_top_tracks?offset=${offset}`, {
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


const Tracks = () => {
   const [tracks, setTracks] = useState([]);
   const [isLoading, setIsLoading] = useState(true);
   const [tracksReady, setTracksReady] = useState(false);
   const router = useRouter()
   const effectRan = useRef(false);

  useEffect(() => {
    if (!spotifyToken) {

        router.push("/")
    }
  }, [spotifyToken]);

  useEffect(() => {

    if(effectRan.current === false){
      const fetchAllTracks = async () => {
        console.log("fetching all Items");
  
        try {
          const results = await Promise.all([
            fetchTopTracks(0),
            // fetchTopTracks(50),
          ]);

          console.log(results[0]["data_list"])
  
          setTracks(results[0]["data_list"]);
          setTracksReady(true);

          setIsLoading(false);
        }
        catch (error) {
          console.error("Failed to fetch top tracks", error);
          if (error.response && error.response.status === 401) {
            router.push("/");
          }
        }
        
      };

      fetchAllTracks();
    }
    
    return () => {
      effectRan.current = true;
    }

  }, []);


  return ( 
    
    <div className={style.container}>
        <HeaderComponent/>
        <h1>Your Top Tracks</h1>
        {isLoading ? (
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
          ) : (
            <TrackGrid data={tracks}/>
            
          )
        }
    </div>
  );

  
};

export default Tracks;
