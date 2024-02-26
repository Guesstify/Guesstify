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
         output.innerHTML = "The selected value is " + selectedValue;
      }

const Recommend = () => {

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
                </select>

                <h2>Energy</h2>
                <input type="range" id="energy" name="energy"></input>

                <h2>Danceability</h2>
                <input type="range" id="danceability" name="danceability"></input>
            </form>
        </div>
    );

  
};

export default Recommend;
