

import React, { useRef, useEffect } from 'react';
import { usecanvasContext } from '../Context/canvasContext';
import samplevideo from '/sample.mp4'

const Canva = () => {
  const canvasref = useRef(null);

  return (

    <div className="w-full h-full flex flex-col items-center justify-center overflow-hidden">
      <canvas ref={canvasref} className="w-full h-full border-2" />

      <video
        src={samplevideo}
        width={1000}
        className='absolute'
        controls
        loop

      />
    </div>
  );
};

export default Canva;


