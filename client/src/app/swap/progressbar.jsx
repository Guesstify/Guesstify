import React from 'react'
import style from '../../../styles/swap.module.scss'

const Progressbar = ({progress}) => {
    
  return (
    <div
      className={style.progressBar}
    >
      <div
        className={style.progressFill}
        style={{ width: `${progress}%`}} // Inline styles for dynamic width and color
      >
      </div>
    </div>
  );
}

export default Progressbar;