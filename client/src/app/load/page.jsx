"use client";

import { useRouter } from "next/navigation";
import Cookies from 'js-cookie';

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
      
        // Extract access_token from the URL
        const accessToken = getQueryParam("token");
      
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
          const token = String(extractAccessToken(accessToken));
          Cookies.set('spotify_token', token);
        }
        Cookies.set("test", "works");
        // Optional: Redirect to a different URL without the token parameters
        router.push("/intro/");
      }
};

export default Load;