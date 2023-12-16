"use client";

import React from "react";
import style from "../../styles/home.module.scss";
import Link from "next/link";
export default function Home() {
  const handleClick = () => {
    window.location.href = "http://localhost:8000/login";
  };

  return (
    <>
      <header>
        <title>Guesstify</title>
      </header>
      <div className={style.container}>
        <Link href="/about">About</Link>
        <p className={style.title}>Guesstify</p>
        <h2>Welcome to Guesstify</h2>
        <button onClick={handleClick}>Login</button>
      </div>
    </>
  );
}
