import React from 'react'
import Link from 'next/link'
export default function Home() {
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
        <Link href="/login">
          Login
        </Link>
      </div>
    </>
  )
}
