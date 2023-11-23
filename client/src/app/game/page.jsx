'use client'

import React, { useEffect, useState } from 'react';
const Callback = () => {
  const [tokenAuth, setTokenAuth] = useState(null);

  async function setSpotifyCookie(accessToken) {
    fetch('http://localhost:8000/set-cookie', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      credentials: 'include', // Don't forget to specify this if you need cookies
      body: JSON.stringify({
        token: accessToken
      })
    })
    .then(response => {
      if (response.ok) {
        return response.json(); // or response.text() if the response is not in JSON format
      } else {
        throw new Error('Network response was not ok.');
      }
    })
    .catch(error => console.error('There has been a problem with your fetch operation:', error));
    
  }
    
  
  useEffect(() => {
    // Use URLSearchParams to parse query parameters
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    // Set the authData state to the paramsData object

    // Extracts the token
    setTokenAuth(token.slice(13));
    setSpotifyCookie(token.slice(13));
  }, []);


  return (
    <div>
      {tokenAuth ? (
        <div>
          {/* Display or use the auth data */}
          <p>Authenticated</p>
          {/* Displaying the JSON data in a preformatted text for clarity */}
          <pre>{JSON.stringify(tokenAuth, null, 2)}</pre>
        </div>
      ) : (
        <p>Waiting for authentication...</p>
      )}
    </div>
  );
};

export default Callback;
