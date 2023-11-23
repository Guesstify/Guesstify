'use client'

import React from 'react'
import Link from 'next/link'
export default function Home() {

  const handleClick = () => {
    window.location.href = 'http://localhost:8000/login';
  };

  return (
    <>
      <header>
        <title>Guesstify</title>
      </header>
      <div>
        <h1>
          Hello World
        </h1>
        <h2>
          Welcome to Guesstify
        </h2>
        <button onClick = {handleClick}>
          Login
        </button>
      </div>
    </>
  )
}
