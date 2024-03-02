"use client";
import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import style from "../../../styles/recommend.module.scss";
import Cookies from 'js-cookie';

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;


const ChooseArtist = (ArtistName) => {
  console.log(ArtistName, " clicked")
}
 

const RecommendImage = ({ data, currentIndex }) => {
  console.log(currentIndex)
  return(
    <div className={style.recommend_image}>
      <img src={data[currentIndex].album_image} onClick={() => ChooseArtist(data[currentIndex].artist_name)} />
      <p className={style.descriptionSong}>{data[currentIndex].song_name}</p>
      <p className={style.description}>{data[currentIndex].artist_name}</p>
    </div>
  );
};

const Recommend = () => {
    const [myGenre, setMyGenre] = useState("Choose a genre!");
    const [energy, setEnergy] = useState(0.5);
    const [danceability, setDanceability] = useState(0.5);
    const [popularity, setPopularity] = useState(0.5);
    const [songList, setSongList] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);


    const handleSubmit = async (event) => {
      event.preventDefault(); // Prevent default form submission behavior
    
      fetch(`${backendUrl}/recommend_songs?seed_genre=${myGenre}`, {
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
        setSongList(fetchData["data_list"]);
      })
      .catch(error => console.error("Failed to fetch recommended songs:", error));
    };

    const spotifyToken = Cookies.get('spotify_token');

    function changeGenre(){
      let genre = document.getElementById("dropdown").value;
      setMyGenre(genre)
    }


    return ( 
        <div className={style.container}>
            <h1>Recommend Page</h1>

            {
              songList.length > 0 ? <RecommendImage data={songList} currentIndex={currentIndex} /> : <p></p>
            }

            <br></br>

            {currentIndex  > 0 && songList.length > 0 && <button name="prev" onClick={ () => setCurrentIndex(currentIndex-1)}>prev</button>}
            {currentIndex < 17 && songList.length > 0 && <button name="next" onClick={ () => setCurrentIndex(currentIndex+1)}>next</button>}
            
            <form className={style.form} onSubmit={handleSubmit}>
                <h2>Genre Seed</h2>
                <select id="dropdown" className={style.genre} onChange={changeGenre}>
                    <option value="">Choose a genre!</option>
                    <option value="club">Club</option>
                    <option value="dance">Dance</option>
                    <option value="edm">EDM</option>
                    <option value="hip-hop">Hip-Hop</option>
                    <option value="indian">Indian</option>
                    <option value="indie">Indie</option>
                    <option value="jazz">Jazz</option>
                    <option value="k-pop">K-Pop</option>
                    <option value="latin">Latin</option>
                    <option value="metal">Metal</option>
                    <option value="movies">Movies</option>
                    <option value="piano">Piano</option>
                    <option value="pop">Pop</option>

                </select>

                <h2>Energy</h2>
                <input type="range" id="energy" name="energy" min="0" max="1" step="0.01" onChange={(e) => setEnergy(e.target.value)}></input>

                <h2>Danceability</h2>
                <input type="range" id="danceability" name="danceability" min="0" max="1" step="0.01" onChange={(e) => setDanceability(e.target.value)}></input>

                <h2>Popularity</h2>
                <input type="range" id="popularity" name="popularity" min="0" max="100" step="1" onChange={(e) => setPopularity(e.target.value)}></input>
                <br></br>
                <button type="submit">Submit</button>
            </form>
        </div>
    );

  
};

export default Recommend;
