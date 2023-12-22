// "use client";

// import React from "react";
// import { useEffect } from "react";
// import React, { useState, useEffect } from 'react';
// function page() {
//   return(
//     <div>This is where the game is</div>;
//   ) 
// }

// export default page;

"use client";
import React, { useState, useEffect, useRef  } from 'react';

const TrackList = () => {
  const [tracks, setTracks] = useState([]);
  const [leftTrack, setLeftTrack] = useState({});
  const [rightTrack, setRightTrack] = useState({});
  const [newTrack, setNewTrack] = useState({})
  const [ready, setReady] = useState("loading");
  const audioRef = useRef(null);

  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const accessToken = getCookie('accessToken');
        const response = await fetch('http://localhost:8000/user_top_tracks', {
          method: 'GET',
          credentials: 'include',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
  
        const data = await response.json();
        setTracks(data);
        setReady("ready")
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
  
    fetchData();
  }, []);
  
  useEffect(() => {
    // Additional actions after response.json() resolves
    getTrack(setLeftTrack);
    getTrack(setRightTrack);
  }, [ready]);

  // Helper function to get a cookie by name
  const getCookie = (name) => {
    const cookieString = document.cookie;
    const cookies = cookieString.split(';').map((cookie) => cookie.trim());
    const foundCookie = cookies.find((cookie) => cookie.startsWith(`${name}=`));

    return foundCookie ? foundCookie.split('=')[1] : null;
  };

  const getTrack = (setter) => {
    setTracks((prevTracks) => {
      if (Array.isArray(prevTracks) && prevTracks.length > 0) {
        const [nextTrack, ...remainingTracks] = prevTracks;
        console.log('Setting track:', nextTrack);
        setter(nextTrack);
        setNewTrack(nextTrack);
        return remainingTracks;
      }
    });
  };


  const AudioPlayer = ({ src }) => {

    

    return (
      <audio controls autoPlay>
        <source src={src} type="audio/mp3" />
        Your browser does not support the audio element.
      </audio>
    );
  };


  return (
    <>
    {leftTrack && (
      <div>
        <div className="leftTrack"> 
          <p>{`Rank ${leftTrack.rank}: ${leftTrack.track_name} by ${leftTrack.artist}`}</p>
          <img src={leftTrack.album_cover} alt={`Album cover for ${leftTrack.track_name}` } onClick={() => getTrack(setRightTrack)}/>
        </div>
        <div className="rightTrack" > 
          <p>{`Rank ${rightTrack.rank}: ${rightTrack.track_name} by ${rightTrack.artist}`}</p>
          <img src={rightTrack.album_cover} alt={`Album cover for ${rightTrack.track_name}`} onClick={() => getTrack(setLeftTrack)} />
        </div>
        <AudioPlayer src={newTrack.snippet} />
      </div>
    )}
    </>
  );
};

export default TrackList;