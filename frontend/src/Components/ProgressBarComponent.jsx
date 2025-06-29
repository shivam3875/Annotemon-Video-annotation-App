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
    <div>
      <div style={{ width: "100%", border: "1px solid #ccc", height: "30px", marginBottom: "10px" }}>
        <div style={{
          width: `${progress}%`,
          height: "100%",
          background: "linear-gradient(90deg, #3498db, #2ecc71)",
          transition: "width 0.3s"
        }}></div>
      </div>
      <div>{progress}% rendered</div>
    </div>
  );
}

export default ProgressBarComponent;