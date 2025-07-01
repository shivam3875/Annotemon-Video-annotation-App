import { useEffect, useState } from "react";
import { usesocketContext } from '../Context/socketContext';


function ProgressBarComponent() {
  const [progress, setProgress] = useState(0);
  const {socket} = usesocketContext();

  useEffect(() => {

    socket.on("render-progress", ({ percent }) => {
      console.log("percent=",percent);
      setProgress(percent);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (

    progress==100 ? <div className="text-blue-300 text font-normal"> Video Being Ready To DownLoad...  </div> :

    <div>
      <div className="border-2 border-blue-300" style={{ width: "100%", height: "30px", marginBottom: "10px" }}>
        <div style={{
          width: `${progress}%`,
          height: "100%",
          background: "linear-gradient(90deg, #3498db, #2ecc71)",
          transition: "width 0.3s"
        }}></div>
      </div>
      <div className="text-blue-300">{progress}% rendered</div>
    </div>
  );
}

export default ProgressBarComponent;