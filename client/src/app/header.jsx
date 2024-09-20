
import React from 'react';
import style from "../../styles/header.module.scss";
import { useRouter } from "next/navigation";
import Cookies from 'js-cookie';


const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

const HeaderComponent = () => {
    const router = useRouter();

    const handleNavClick = (key) => {
        router.push(`/${key}/`);
    };

    const handleLogoutClick = async () => {
        
        const allCookies = Cookies.get(); // Get all cookies as an object
        for (let cookieName in allCookies) {
            console.log("removed", cookieName)
            Cookies.remove(cookieName); // Remove each cookie
        }

        var logoutWindow = window.open('https://accounts.spotify.com/en/logout', '_blank');

        // Close the logout tab after a short delay
        setTimeout(function() {
            logoutWindow.close();
        }, 2000); // Adjust the delay as needed (1000 milliseconds = 1 second)

        router.push("/")
    };

    const handleHelpClick = () => {
        alert('Help button clicked');
    };

    const navItems = [
        ['intro', 'Home'],
        ['about', 'About'],
        ['tracks', 'Tracks'],
        ['grid', 'Artists'],
        ['playlists', 'Playlists'],
        ['profile', 'Profile']
        
    ];

    return (
        <div className={style.header}>
            <title>Vinyls</title>
            <link rel="icon" href="vercel.svg" />

            <a href="/playlists">
                <h1>Polaroid Playlists</h1>
            </a>
            
            
            {/* <div className={style.buttons}>
                {navItems.map(([key, buttonText]) => (
                    <button key={key} onClick={() => handleNavClick(key)}>
                        {buttonText}
                    </button>
                ))}
            </div> */}
            <div className={style.logout}>
                <button onClick={handleHelpClick}>
                    Help
                </button>
                <button onClick={handleLogoutClick}>
                    Log Out
                </button>
            </div>
        </div>
    );
};

export default HeaderComponent;
