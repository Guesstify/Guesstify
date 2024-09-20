"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";
import style from "../../../styles/final.module.scss";
import Cookies from 'js-cookie';

const Loader = ()=>{
    return(
        <div className={style.loader}>
            <span className={style.load} style={{ '--i': '1px' }}></span>
            <span className={style.load} style={{ '--i': '2px' }}></span>
            <span className={style.load} style={{ '--i': '3px' }}></span>
            <span className={style.load} style={{ '--i': '4px' }}></span>
            <span className={style.load} style={{ '--i': '5px' }}></span>
            <span className={style.load} style={{ '--i': '6px' }}></span>
            <span className={style.load} style={{ '--i': '7px' }}></span>
            <span className={style.load} style={{ '--i': '8px' }}></span>
            <span className={style.load} style={{ '--i': '9px' }}></span>
            <span className={style.load} style={{ '--i': '10px' }}></span>
            <span className={style.load} style={{ '--i': '11px' }}></span>
            <span className={style.load} style={{ '--i': '12px' }}></span>
        </div>
    )
    
}

const Final = () => {
    return(
        <body>
            <div className={style.container}>
                <Loader></Loader>
            </div>
        </body>
        
    )
}




export default Final;