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
        ['songs', 'Songs'],
        ['grid', 'Artists'],
        ['playlists', 'Playlists']
        
    ];

    return (
        <div className={style.header}>
            <h1>Spotify Vinyls</h1>
            
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
