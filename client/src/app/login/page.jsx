'use client'

import React, { useEffect, useState } from "react";

function index(props) {
  const handleClick = () => {
    window.location.href = 'http://localhost:8000/login';
  };

  return (
    <>
      <header>
        <title>Login</title>
      </header>
      <div>
        <button onClick={handleClick}>Click me</button>
      </div>
    </>
  );
}

export default index;

index.propTypes = {};
