
import React from 'react';
import style from "../../styles/staticloader.module.scss";


const StaticLoader = () => {
    return (
        /* From Uiverse.io by TheAbieza */ 
        <div class={style.container}>
            <div class={style.plate}>
                <div class={style.black}>
                    <div class={style.border}>
                        <div class={style.white}>
                            <div class={style.center}></div>
                        </div>
                    </div>
                </div>
            </div>

            <div class={style.player}>
                <div class={style.rect}></div>
                <div class={style.circ}></div>
            </div>
        </div>
    );
};

export default StaticLoader;
