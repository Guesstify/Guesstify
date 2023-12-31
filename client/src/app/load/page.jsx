"use client";

import { useRouter } from "next/navigation";

const Load = () => {
    const router = useRouter();
    
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
    const accessToken = getQueryParam("token");
    
    // Check if access_token is present
    if (accessToken) {
        // Set the access_token as a cookie (adjust the expiration time as needed)
        setCookie("access_token", accessToken, 7); // Expires in 7 days
    }
    
    // Optional: Redirect to a different URL without the token parameters
    router.push("/intro/");
};

export default Load;