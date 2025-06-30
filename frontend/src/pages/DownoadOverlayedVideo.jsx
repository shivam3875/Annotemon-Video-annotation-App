import { useoverlayedvideourlContext } from "../Context/overlayedvideourlContext";
import Navbar from "../Components/Navbar";
import { Navigate } from "react-router-dom";
import { FaArrowAltCircleDown } from "react-icons/fa";
import { usevideourlContext } from "../Context/videourlContext";
import { useEffect } from "react";
import ProgressBarComponent from "../Components/ProgressBarComponent";


function DownloadOverlayedVideo() {

    const {overlayedvideourl,setoverlayedvideourl} = useoverlayedvideourlContext();
    const {setvideourl}=usevideourlContext();

    useEffect(() => {
      setvideourl(null);
    }, []);
    

  const handleDownload = () => {
    // Invisible anchor बनाएं और डाउनलोड ट्रिगर करें
    const a = document.createElement("a");
    a.href = overlayedvideourl;
    a.download = "overlayed_video.mp4"; // डाउनलोड फाइल का नाम
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setoverlayedvideourl(null);
  };

  return (

    overlayedvideourl==null ? <Navigate to="/"/> :

  <>
    <div className='h-screen flex items-center flex-col gap-64'>
      <Navbar />
        <button className={`${overlayedvideourl!=="" ? 'text-white bg-[#3498db] cursor-pointer' : ' bg-white border-2 border-blue-300 cursor-not-allowed'} p-7 rounded-2xl text-xl font-bold`} disabled={overlayedvideourl!=="" ? false : true} onClick={handleDownload}>{overlayedvideourl!=="" ? <>Download <FaArrowAltCircleDown className="inline" size={35} /></> : <><ProgressBarComponent/></>}  </button>
    </div>
 </>

  );
}

export default DownloadOverlayedVideo;
