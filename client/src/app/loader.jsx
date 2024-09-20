
import React from 'react';
import style from "../../styles/loader.module.scss";


const Loader = () => {
    return (
        /* From Uiverse.io by TheAbieza */ 
        <div className={style.container}>
            <div className={style.plate}>
                <div className={style.black}>
                    <div className={style.border}>
                        <div className={style.white}>
                            <div className={style.center}></div>
                        </div>
                    </div>
                </div>
            </div>

            <div className={style.player}>
                <div className={style.rect}></div>
                <div className={style.circ}></div>
            </div>
        </div>
    );
};

export default Loader;
