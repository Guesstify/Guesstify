"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import style from "../../../styles/grid.module.scss";
import Cookies from 'js-cookie';

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

 const selectOption = () => {
         let dropdown = document.getElementById('dropdown');
         // get the index of the selected option
         let selectedIndex = dropdown.selectedIndex;
         // get a selected option and text value using the text property
         let selectedValue = dropdown.options[selectedIndex].text;
      }

const Recommend = () => {

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
        setIsLoading(false);
      })
      .catch(error => console.error("Failed to fetch artist data:", error));
    }, []);

    return ( 
        <div className={style.container}>
            <h1>Recommend Page</h1>
            <form>
                <h2>Genre Seed</h2>
                <select id = "dropdown" onchange = {selectOption}>
                    <option>Club</option>
                    <option>Dance</option>
                    <option>EDM</option>
                    <option>Hip-Hop</option>
                    <option>Indian</option>
                    <option>Indie</option>
                    <option>Jazz</option>
                    <option>K-Pop</option>
                    <option>Latin</option>
                    <option>Metal</option>
                    <option>Movies</option>
                    <option>Piano</option>
                    <option>Pop</option>

                </select>

                <h2>Energy</h2>
                <input type="range" id="energy" name="energy" min="0" max="1" step="0.01"></input>

                <h2>Danceability</h2>
                <input type="range" id="danceability" name="danceability" min="0" max="1" step="0.01"></input>

                <h2>Popularity</h2>
                <input type="range" id="popularity" name="popularity" min="0" max="100" step="1"></input>
            </form>
        </div>
    );

  
};

export default Recommend;
