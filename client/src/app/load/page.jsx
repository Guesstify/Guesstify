"use client";

import { useRouter } from "next/navigation";

const Load = () => {
    const router = useRouter();
    
    // Function to extract a parameter from the URL
    if (typeof window !== "undefined") {
        // Place your client-side code here
      
        // Function to extract a parameter from the URL
        const getQueryParam = (name) => {
          const urlParams = new URLSearchParams(window.location.search);
          return urlParams.get(name);
        };
      
        // Function to set a cookie
        const setCookie = (name, value, days) => {
          const expires = new Date();
          expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
          document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
        };
      
        // Extract access_token from the URL
        const accessToken = extracAccessToken(getQueryParam("token"));
      
        // Function to extract the value after access_token=
        const extractAccessToken = (url) => {
            const tokenParam = "access_token=";
            const tokenStartIndex = url.indexOf(tokenParam);
            
            if (tokenStartIndex !== -1) {
            const accessToken = url.substring(tokenStartIndex + tokenParam.length).split("&")[0];
            return accessToken;
            }
            
            return null; // Access token not found
        };
        
        // Check if access_token is present
        if (accessToken) {

          // Set the access_token as a cookie (adjust the expiration time as needed)
          setCookie("spotify_token", accessToken, 7); // Expires in 7 days
        }
      
        // Optional: Redirect to a different URL without the token parameters
        router.push("/intro/");
      }
};

export default Load;