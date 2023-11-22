'use client'

import React, { useEffect, useState } from 'react';

const Callback = () => {
  const [authData, setAuthData] = useState(null);

  useEffect(() => {
    // Create an empty object to store the parameters
    const paramsData = {};

    // Use URLSearchParams to parse query parameters
    const params = new URLSearchParams(window.location.search);
    
    // Iterate over all the parameters and add them to the paramsData object
    for (const [key, value] of params) {
      paramsData[key] = value;
    }

    // Set the authData state to the paramsData object
    setAuthData(paramsData);
  }, []);

  return (
    <div>
      {authData ? (
        <div>
          {/* Display or use the auth data */}
          <p>Authenticated</p>
          {/* Displaying the JSON data in a preformatted text for clarity */}
          <pre>{JSON.stringify(authData, null, 2)}</pre>
        </div>
      ) : (
        <p>Waiting for authentication...</p>
      )}
    </div>
  );
};

export default Callback;
