"use client";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import style from "../../../styles/about.module.scss";
const About = () => {
  return (
    <div>
      <p className={style.title}>Made by Brian Lee and Dev Kunjadia</p>
    </div>
  );
};

export default About;
