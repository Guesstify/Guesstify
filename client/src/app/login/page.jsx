'use client'

import React from "react";

function index(props) {
  const handleClick = () => {
    console.log("clicked");
  };

  return (
    <>
      <header>
        <title>Login</title>
      </header>
      <body>
        <button onClick={handleClick}>Click me</button>
      </body>
    </>
  );
}

export default index;

index.propTypes = {};
