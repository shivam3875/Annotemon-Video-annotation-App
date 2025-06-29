import React from 'react'
import { useoverlayedvideourlContext } from '../Context/overlayedvideourlContext';
import {usesocketidContext} from '../Context/socketidContext';

const useOverlaywithURL = () => {

    const {setoverlayedvideourl}=useoverlayedvideourlContext();
    const {socketId} = usesocketidContext();
    
    const overlaywithURL= async (videoURL, annotations)=>{

    try{
        const res = await fetch("http://localhost:5000/overlay", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                videoPath: videoURL,       // Server-side path
                annotations: annotations,   // Array ya JSON object
                socketId:socketId,
            })
        });

        const data = await res.json();
        console.log("overlay result:", data);
        if(data.error){
            throw new Error(data.error);
        }

        setoverlayedvideourl(data.url);

    } 
    catch(error){
        console.log(error.message)
    }
  }

  return {overlaywithURL}

}

export default useOverlaywithURL

