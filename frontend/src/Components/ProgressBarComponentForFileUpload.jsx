
function ProgressBarComponentForFileUpload({progress}) {

  return (
    <div>
      <div className="border-2 border-blue-300" style={{ width: "100%", height: "30px", marginBottom: "10px" }}>
        <div style={{
          width: `${progress}%`,
          height: "100%",
          background: "linear-gradient(90deg, #3498db, #2ecc71)",
          transition: "width 0.3s"
        }}></div>
      </div>
      <div className="text-blue-300">{progress}% Uploaded</div>
    </div>
  );
}

export default ProgressBarComponentForFileUpload;