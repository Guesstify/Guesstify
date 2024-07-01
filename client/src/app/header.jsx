import React from 'react';
import style from "../../styles/header.module.scss";
import { useRouter } from "next/navigation";
import Cookies from 'js-cookie';

const HeaderComponent = () => {
    const router = useRouter();

    const handleNavClick = (key) => {
        router.push(`/${key}/`);
    };

    const handleLogoutClick = () => {
        Cookies.remove('spotify_token');
        alert('Successfully logged out!');
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
        ['playlists', 'Playlists']
        
    ];

    return (
        <div className={style.header}>
            <title>Vinyls</title>
            <link rel="icon" href="vercel.svg" />

            <a href="/intro">
                <h1>Spotify Vinyls</h1>
            </a>
            
            
            <div className={style.buttons}>
                {navItems.map(([key, buttonText]) => (
                    <button key={key} onClick={() => handleNavClick(key)}>
                        {buttonText}
                    </button>
                ))}
            </div>
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
