"use client";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import style from "../../../styles/about.module.scss";
import HeaderComponent from "../header";

const About = () => {
  return (
    <div className={style.container}>
      <HeaderComponent></HeaderComponent>
      <p className={style.title}>Made by Brian Lee and Dev Kunjadia</p>
      <div className={style.panel_list}>
        <div className={style.panel}>
          <h2>YoonHyuk Brian Lee</h2>
        </div>
        <div className={style.panel}>
          <h2>Dev Kunjadia</h2>
        </div>
        <div className={style.panel}>
          <p>here</p>
        </div>
      </div>
    </div>
  );
};

export default About;
