
import { useEffect, useRef, useState } from 'react';
import { Stage, Layer, Image, Text,Line } from 'react-konva';
import Rectangle from '../Components/Rectange';
import EditableLineShape from '../Components/EditableLineShape';
import EditableTextShape from '../Components/EditableTextShape';
import CircleShape from '../Components/CircleShape';
import { usevideourlContext } from '../Context/videourlContext';
import useOverlaywithURL from '../hooks/useOverlaywithURL';
import { Navigate } from 'react-router-dom';
import Navbar from '../Components/Navbar';
import { FaRegCirclePause , FaRegCirclePlay, } from "react-icons/fa6"
import {MdOutlineForward10 , MdOutlineReplay10 } from "react-icons/md"
import UploadImageModal from '../Components/UploadImageModal';
import { useimageurlContext } from '../Context/imageurlContext';
import EditableImageShape from '../Components/EditableImageShape';
import ImageURLModal from '../Components/ImageURLModal';
import { MdOutlineColorLens } from "react-icons/md";
import { MdOutlineLineWeight } from "react-icons/md";
import { MdFormatColorFill } from "react-icons/md";
import { BsTextareaT } from "react-icons/bs";
import { VscTextSize } from "react-icons/vsc";
import { TbLineHeight } from "react-icons/tb";
import { RiFontColor } from "react-icons/ri";
import { LuPenOff } from "react-icons/lu";
import { LuPen } from "react-icons/lu";
import { PiRectangle,PiCircle,PiLineSegmentLight} from "react-icons/pi";
import { CiText } from "react-icons/ci";
import { MdDeselect } from "react-icons/md";
import { AiOutlineDelete } from "react-icons/ai";
import { TfiLayoutMediaOverlayAlt2 } from "react-icons/tfi";
import { useoverlayedvideourlContext } from '../Context/overlayedvideourlContext';
import Tooltip from '../Components/Tooltip';
import { CiExport, CiImport  } from "react-icons/ci";
import { MdOutlineVisibility,MdOutlineVisibilityOff  } from "react-icons/md";












const VideoOnCanvas = () => {

  const {VIDEO_URL}=usevideourlContext();

  const [videoElement] = useState(() => {
    const element = document.createElement('video');
    element.src = VIDEO_URL;
    element.crossOrigin = 'anonymous';
    return element;
  });

  const [videoSize, setVideoSize] = useState({ width: 1000, height: 600 });
  const [status, setStatus] = useState('Loading video...');
  const animationRef = useRef(null);
  const layerRef = useRef(null);
  const [shapes, setShapes] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedType,setSelectedType] = useState(null);
  const [isplay,setisplay]=useState(false);
  const [isstarted,setisstarted]=useState(false);
  const {overlayedvideourl,setoverlayedvideourl} = useoverlayedvideourlContext();


//seek bar
const [progress, setProgress] = useState(0); // 0 to 1
const [duration, setDuration] = useState(0);
useEffect(() => {
  const handleTimeUpdate = () => {
    setProgress(videoElement.currentTime / videoElement.duration);
  };
  const handleLoadedMetadata = () => {
    setDuration(videoElement.duration);
  };
  videoElement.addEventListener('timeupdate', handleTimeUpdate);
  videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);
  return () => {
    videoElement.removeEventListener('timeupdate', handleTimeUpdate);
    videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
  };
}, [videoElement]);


//dynamic current frame
const [hoverFrame, setHoverFrame] = useState(null); // Preview image ka data URL
const [hoverX, setHoverX] = useState(null);         // Mouse position (seek bar par)
const previewVideoRef = useRef();                   // Hidden video element for preview
useEffect(() => {
  // Component mount par hidden video element create karo
  if (!previewVideoRef.current) {
    const vid = document.createElement("video");
    vid.src = VIDEO_URL;
    vid.crossOrigin = "anonymous";
    vid.muted = true;
    previewVideoRef.current = vid;
  }
}, []);
const handleSeekBarMouseMove = async (e) => {
  const rect = e.currentTarget.getBoundingClientRect();
  const x = e.clientX - rect.left;
  setHoverX(x); // Tooltip position update
  const percent = x / rect.width;
  const time = percent * duration;

  // Hidden video ko seek karo
  const vid = previewVideoRef.current;
  if (!vid) return;
  vid.currentTime = time;

  vid.onseeked = () => {
    // Canvas par frame draw karo
    const canvas = document.createElement("canvas");
    // canvas.width = 160;
    // canvas.height = 90;
    canvas.width = videoSize.width/2 // pehle se double
    canvas.height = videoSize.height/2;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(vid, 0, 0, canvas.width, canvas.height);
    setHoverFrame(canvas.toDataURL());
  };
};
const handleSeekBarMouseLeave = () => {
  setHoverFrame(null);
  setHoverX(null);
};

const videoX = 0;
const videoY = 0;


  useEffect(() => {
    const handleMetadata = () => {
      setStatus('PLAY...');
      setVideoSize({
        width: videoElement.videoWidth,
        height: videoElement.videoHeight,
      });
      console.log("width=",videoElement.videoWidth);
      console.log("height=",videoElement.videoHeight);
    };
    videoElement.addEventListener('loadedmetadata', handleMetadata);
    return () => {
      videoElement.removeEventListener('loadedmetadata', handleMetadata);
    };
  }, [videoElement]);


//play pause by space key
// useEffect(() => {
//   const handleKeyDown = (event) => {
//     if (event.code === 'Space') {
//       event.preventDefault();
//       if (videoElement.paused) {
//         // Play video
//         setStatus('');
//         videoElement.play();
//         if (layerRef.current) {
//           const anim = new window.Konva.Animation(() => {}, layerRef.current);
//           animationRef.current = anim;
//           anim.start();
//         }
//       } else {
//         // Pause video
//         videoElement.pause();
//         if (animationRef.current) {
//           animationRef.current.stop();
//         }
//       }
//     }
//   };
//   window.addEventListener('keydown', handleKeyDown);
//   return () => window.removeEventListener('keydown', handleKeyDown);
// }, [videoElement]);


const handlePlay = () => {
  setStatus('');
  videoElement.play();
  if (layerRef.current) {
    const anim = new window.Konva.Animation(() => {}, layerRef.current);
    animationRef.current = anim;
    anim.start();
  }
};

const handlePause = () => {
  videoElement.pause();
  if (animationRef.current) {
    animationRef.current.stop();
  }
};

const handleplaypause = ()=>{
  setisstarted(true);
  if(!isplay || videoElement.currentTime==videoElement.duration){
    setisplay(true);
    handlePlay();
  }
  else{
    setisplay(false);
    handlePause();
  }
};


const addRectangle = () => {
  setShapes([
    ...shapes,
    {
      id: String(shapes.length + 1),
      type: 'rect',
      x: 50,
      y: 50,
      width: 100,
      height: 100,
      rotation:0,
      stroke: '#000000',
      startTime:Math.floor(videoElement.currentTime),
      endTime:Math.floor(videoElement.duration),
      visible:true,
      strokeWidth: 3,
      fill: undefined,
    },
  ]);
};

const addLine = () => {
  setShapes([
    ...shapes,
    {
      id: String(shapes.length + 1),
      type: "line",
      points: [100, 100, 300, 100], // [x1, y1, x2, y2]
      stroke: "#00000",
      strokeWidth: 10,
      visible:true,
      startTime:Math.floor(videoElement.currentTime),
      endTime:Math.floor(videoElement.duration),
    },
  ]);
};

const addText = () => {
  setShapes([
    ...shapes,
    {
      id: String(shapes.length + 1),
      type: "text",
      x: 100,
      y: 100,
      text: "Add Text",
      textDecoration : "",
      fontSize: 24,
      lineHeight:1.5,
      fontStyle:"",
      fill: "#000000",
      fontFamily: "Arial",
      rotation:0,
      visible:true,
      startTime:Math.floor(videoElement.currentTime),
      endTime:Math.floor(videoElement.duration),
    },
  ]);
};

const addCircle = () => {
  setShapes([
    ...shapes,
    {
      id: String(shapes.length + 1),
      type: 'circle',
      x: 150,
      y: 150,
      radius: 60,
      stroke: '#000000',
      strokeWidth: 3,
      fill: undefined,
      visible:true,
      startTime:Math.floor(videoElement.currentTime),
      endTime:Math.floor(videoElement.duration),
    },
  ]);
};

const handleShapeChange = (index, newAttrs) => {
  const updatedShapes = shapes.slice();
  updatedShapes[index] = newAttrs;
  setShapes(updatedShapes);
};

const handleDelete = () => {
  if (selectedId !== null) {
    setShapes(shapes.filter(shape => shape.id !== selectedId));
    setSelectedId(null);
    setSelectedType(null);
  }
};

// Get selected shape object
const selectedShape = shapes.find(s => s.id === selectedId);

const handleStrokeColorChange = e => {
  if (selectedId !== null) {
    setShapes(shapes.map(shape =>
      shape.id === selectedId ? { ...shape, stroke: e.target.value } : shape
    ));
  }
};

const handleStrokeWidthChange = e => {
  if (selectedId !== null) {
    setShapes(shapes.map(shape =>
      shape.id === selectedId ? { ...shape, strokeWidth: Number(e.target.value) } : shape
    ));
  }
};


const handleStartimeChange = e => {
  if (selectedId !== null) {
    setShapes(shapes.map(shape =>
      shape.id === selectedId ? { ...shape, startTime: shape.endTime>=e.target.value ? Number(e.target.value) : shape.endTime} : shape
    ));
  }
};

const handleEndtimeChange = e => {
  if (selectedId !== null) {
    setShapes(shapes.map(shape =>
      shape.id === selectedId ? { ...shape, endTime: shape.startTime<=e.target.value ? Number(e.target.value) : shape.startTime} : shape
    ));
  }
};

const handleDurationtimeChange = e => {
  if (selectedId !== null) {
    setShapes(shapes.map(shape =>
      shape.id === selectedId ? { ...shape, endTime: shape.startTime+Number(e.target.value)<=videoElement.duration ? shape.startTime+Number(e.target.value) : Math.floor(videoElement.duration)} : shape
    ));
  }
}

const handleTextChange = e => {
  if (selectedId !== null) {
    setShapes(shapes.map(shape =>
      shape.id === selectedId ? { ...shape, text:e.target.value } : shape
    ));
  }
};

const handleFillToggle = e => {
  if (selectedId !== null) {
    setShapes(shapes.map(shape =>
      shape.id === selectedId
        ? { ...shape, fill: e.target.checked ? '#ffffff' : undefined }
        : shape
    ));
  }
};

const handleVisibilityToggle = e => {
  if (selectedId !== null) {
    setShapes(shapes.map(shape =>
      shape.id === selectedId
        ? { ...shape, visible: e.target.checked }
        : shape
    ));
  }
};

const exportShapesAsVideoRelativeJSON = () => {
  const relShapes = shapes.map(shape => {
    if (shape.type === 'rect') {
      return {
        type: 'rect',
        left: (shape.x - videoX),
        top: (shape.y - videoY),
        width: shape.width,
        height: shape.height,
        stroke: shape.stroke,
        strokeWidth: shape.strokeWidth,
        rotation:shape.rotation,
        fill: shape.fill,
        visible:shape.visible,
        startTime:shape.startTime,
        endTime:shape.endTime,
      };
    }
    if (shape.type === 'circle') {
      return {
        type: 'circle',
        left: (shape.x - videoX),
        top: (shape.y - videoY),
        radius:shape.radius,
        stroke: shape.stroke,
        strokeWidth: shape.strokeWidth,
        fill: shape.fill,
        startTime:shape.startTime,
        endTime:shape.endTime,
      };
    }
    if (shape.type === 'line') {
      return {
        type: 'line',         
        points:[shape.points[0]-videoX,shape.points[1]-videoY,shape.points[2]-videoX,shape.points[3]-videoY],
        stroke: shape.stroke,
        strokeWidth: shape.strokeWidth,
        startTime:shape.startTime,
        endTime:shape.endTime,
      };
    }
    if (shape.type === 'text') {
      return {
        type: 'text',
        left: (shape.x - videoX),
        top: (shape.y - videoY),
        text:shape.text,
        textDecoration:shape.textDecoration,
        fontSize:shape.fontSize,
        fontStyle:shape.fontStyle,
        fontColor:shape.fill,
        lineHeight:shape.lineHeight,
        fontFamily:shape.fontFamily,
        rotation:shape.rotation,
        startTime:shape.startTime,
        endTime:shape.endTime,
      };
    }
    if (shape.type === 'freedraw') {
      return {
        type: 'freedraw',
        points: shape.points,
        stroke: shape.stroke,
        strokeWidth: shape.strokeWidth,
        startTime:shape.startTime,
        endTime:shape.endTime,
      };
    }
    if (shape.type === 'image') {
      return {
        type: 'image',
        left: (shape.x - videoX),
        top: (shape.y - videoY),
        width: shape.width,
        height: shape.height,
        rotation: shape.rotation,
        src: shape.src,
        startTime:shape.startTime,
        endTime:shape.endTime,
      };
    }
    return null;
  });

  // Download as JSON file
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(relShapes, null, 2));
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", "shapes_video_relative.json");
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
};

const ShapesAsVideoRelativeJSON = () => {
  const relShapes = shapes.map(shape => {
    if (shape.type === 'rect') {
      return {
        type: 'rect',
        left: (shape.x - videoX),
        top: (shape.y - videoY),
        width: shape.width,
        height: shape.height,
        stroke: shape.stroke,
        rotation:shape.rotation,
        strokeWidth: shape.strokeWidth,
        fill: shape.fill,
        startTime:shape.startTime,
        endTime:shape.endTime,
      };
    }
    if (shape.type === 'circle') {
      return {
        type: 'circle',
        left: (shape.x - videoX),
        top: (shape.y - videoY),
        radius:shape.radius,
        stroke: shape.stroke,
        strokeWidth: shape.strokeWidth,
        fill: shape.fill,
        startTime:shape.startTime,
        endTime:shape.endTime,
      };
    }
    if (shape.type === 'line') {
      return {
        type: 'line',         
        points:[shape.points[0]-videoX,shape.points[1]-videoY,shape.points[2]-videoX,shape.points[3]-videoY],
        stroke: shape.stroke,
        strokeWidth: shape.strokeWidth,
        startTime:shape.startTime,
        endTime:shape.endTime,
      };
    }
    if (shape.type === 'text') {
      return {
        type: 'text',
        left: (shape.x - videoX),
        top: (shape.y - videoY),
        text:shape.text,
        textDecoration:shape.textDecoration,
        fontSize:shape.fontSize,
        fontStyle:shape.fontStyle,
        fontColor:shape.fill,
        lineHeight:shape.lineHeight,
        fontFamily:shape.fontFamily,
        rotation:shape.rotation,
        startTime:shape.startTime,
        endTime:shape.endTime,
      };
    }
    if (shape.type === 'freedraw') {
      return {
        type: 'freedraw',
        points: shape.points,
        stroke: shape.stroke,
        strokeWidth: shape.strokeWidth,
        startTime:shape.startTime,
        endTime:shape.endTime,
        mode:shape.mode,
      };
    }
    if (shape.type === 'image') {
      return {
        type: 'image',
        left: (shape.x - videoX),
        top: (shape.y - videoY),
        width: shape.width,
        height: shape.height,
        rotation: shape.rotation,
        src: shape.src,
        startTime:shape.startTime,
        endTime:shape.endTime,
      };
    }
    return null;
  });

  return relShapes;
  
};

const {overlaywithURL}=useOverlaywithURL();

const postrequest = async ()=>{

  const relShapes=ShapesAsVideoRelativeJSON();

  if(!relShapes){
    return;
  }
  setoverlayedvideourl("");  
  await overlaywithURL(VIDEO_URL,relShapes);

}

const handleFillColorChange = e => {
  if (selectedId !== null) {
    setShapes(shapes.map(shape =>
      shape.id === selectedId ? { ...shape, fill: e.target.value } : shape
    ));
  }
};

const handleFontSizeChange = e => {
  if (selectedId !== null) {
    setShapes(shapes.map(shape =>
      shape.id === selectedId ? { ...shape, fontSize: Number(e.target.value) } : shape
    ));
  }
};

const handleLineHeightChange = e => {
  if (selectedId !== null) {
    setShapes(shapes.map(shape =>
      shape.id === selectedId ? { ...shape, lineHeight: Number(e.target.value) } : shape
    ));
  }
}

const underLineText = () => {
    if (selectedId !== null) {
      setShapes(shapes.map(shape =>
        shape.id === selectedId ? { ...shape,textDecoration: shape.textDecoration==="" ? "underline" : "" } : shape
      ));
    }
};

const boldText = () => {
    if (selectedId !== null) {
      setShapes(shapes.map(shape =>
        shape.id === selectedId ? { ...shape,fontStyle: shape.fontStyle==="" ? "bold" :  shape.fontStyle==="bold" ? "" : shape.fontStyle==="italic" ? "italic bold" : "italic" } : shape
      ));
    }
};

const handleDeselect=()=>{
  setSelectedId(null)
  setSelectedType(null)
}

const italicText = () => {
    if (selectedId !== null) {
      setShapes(shapes.map(shape =>
        shape.id === selectedId ? { ...shape,fontStyle: shape.fontStyle==="" ? "italic" :  shape.fontStyle==="bold" ? "italic bold" : shape.fontStyle==="italic" ? "" : "bold" } : shape
      ));
    }
};

//free drawing 
const [drawingMode, setDrawingMode] = useState(false); // true when free drawing tool is active
const isDrawing = useRef(false); // true while user is dragging to draw
const [pencolor,setpencolor]=useState("#000000");
const [penwidth,setpenwidth]=useState(5);
const [fredrawduration,setfredrawduration]=useState(10);

const handleStageMouseDown = (e) => {
  if (!drawingMode) return;
  isDrawing.current = true;
  const pos = e.target.getStage().getPointerPosition();
  setShapes([
    ...shapes,
    {
      id: String(shapes.length + 1),
      type: 'freedraw',
      points: [pos.x, pos.y],
      stroke: pencolor,
      strokeWidth: penwidth,
      lineCap: 'round',
      lineJoin: 'round',
      tension: 0.5,
      visible:false,
      startTime:Math.floor(videoElement.currentTime),
      endTime:Math.min((fredrawduration+Math.floor(videoElement.currentTime)),Math.floor(videoElement.duration)),
    },
  ]);
};

const handleStageMouseMove = (e) => {
  if (!drawingMode || !isDrawing.current) return;
  const stage = e.target.getStage();
  const point = stage.getPointerPosition();
  setShapes(prevShapes => {
    const shapesCopy = prevShapes.slice();
    const last = shapesCopy[shapesCopy.length - 1];
    if (last && last.type === 'freedraw') {
      last.points = last.points.concat([point.x, point.y]);
      shapesCopy[shapesCopy.length - 1] = { ...last };
    }
    return shapesCopy;
  });
};

const handleStageMouseUp = () => {
  if (!drawingMode) return;
  isDrawing.current = false;
};

//image upload
const {IMAGE_URL,setImageurl}=useimageurlContext();
useEffect(() => {
  if(IMAGE_URL){
    setShapes([
      ...shapes,
      {
        id: String(shapes.length + 1),
        type: "image",
        x: 150,
        y: 150,
        rotation:0,
        visible:true,
        width:120,
        height:150,
        src:IMAGE_URL,
        startTime:Math.floor(videoElement.currentTime),
        endTime:Math.floor(videoElement.duration),
      },
    ]);
  }
  setImageurl(null);
  
}, [IMAGE_URL]);

//render imported jason
const handleJsonFile = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const json = JSON.parse(event.target.result);
      if (Array.isArray(json)) {
        setShapes(prev => {
          // Purani shapes ko unki id ke sath hi rakho
          const prevWithIds = prev.map((shape, idx) => ({
            ...shape,
            id: shape.id !== undefined ? shape.id : String(idx + 1)
          }));

          // Nayi shapes me unique id assign karo (prevWithIds.length se start)
          const newWithIds = json.map((shape, idx) => ({
            ...shape,
            id: String(prevWithIds.length + idx + 1)
          }));

          return [...prevWithIds, ...newWithIds];
        });
      } else {
        alert("Invalid JSON format: Root should be an array.");
      }
    } catch (err) {
      alert("Invalid JSON file!");
    }
  };
  reader.readAsText(file);
};



  return (

    !VIDEO_URL ? <Navigate to="/"/> : 

    overlayedvideourl=="" ? <Navigate to="/download" /> :

    <div className="w-screen h-screen flex flex-col bg-white">

      <div className="w-full">
        <Navbar />
      </div>
     
      <div className=" overflow-auto">
        <div className={`${!isstarted ? 'hidden' : 'flex'}  h-full gap-20 py-9 pl-8  items-center overflow-x-auto custom-scrollbar bg-blue-300 p-5`}>

          
          <UploadImageModal/>
          <ImageURLModal/>
          <Tooltip text={drawingMode ? "Disable Draw" : "Enable Draw"} className='flex items-center gap-2 relative group cursor-pointer' >
            {!drawingMode ? <LuPen onClick={() => setDrawingMode(!drawingMode)} color='white' size={30} /> : <LuPenOff onClick={() => setDrawingMode(!drawingMode)} color='white' size={30}/>}
          </Tooltip>
          <label
            className={`${
              !drawingMode
                ? 'hidden'
                : 'flex items-center gap-2 relative group cursor-pointer'
            }`}
          >
            <MdOutlineColorLens color='white' size={30}/>
            <span className="
              absolute left-1/2 -translate-x-1/2 bottom-full mb-2
              opacity-0 group-hover:opacity-100
              bg-white text-blue-300 text-xs rounded px-2 py-1
              transition-opacity duration-200 whitespace-nowrap
              pointer-events-none z-10
            ">
              Stroke Color
            </span>
            <input
              type="color"
              value={pencolor}
              onChange={(e)=>(setpencolor(e.target.value))}
              style={{ marginLeft: 4, width: 32, height: 32, border: 'none', background: 'none', cursor: 'pointer' }}
            />
          </label>
          <label
            className={`${
              !drawingMode
                ? 'hidden'
                : 'flex items-center gap-2 relative group cursor-pointer'
            }`}
          >
            <MdOutlineLineWeight color='white' size={30}/>
            <span className="
              absolute left-1/2 -translate-x-1/2 bottom-full mb-2
              opacity-0 group-hover:opacity-100
              bg-white text-blue-300 text-xs rounded px-2 py-1
              transition-opacity duration-200 whitespace-nowrap
              pointer-events-none z-10
            ">
              Stroke Width
            </span>
            <input
              type="number"
              min={1}
              max={100}
              value={penwidth}
              onChange={(e)=>(setpenwidth(e.target.value))}
              style={{
                width: 70,
                marginLeft: 4,
                padding: '2px 8px',
                border: '1px solid #ccc',
                borderRadius: 4,
                outline: 'none',
                fontSize: 16,
                background:'#fff',
                cursor:'pointer',
              }}
            />
          </label>
          <label
            className={`${!drawingMode ? 'hidden' : 'flex items-center gap-2 relative group cursor-pointer'} text-xl text-white font-bold font-sans`}
          >
            Duration
            <span className="
                absolute left-1/2 -translate-x-1/2 bottom-full mb-2
                opacity-0 group-hover:opacity-100
                bg-white text-blue-300 text-xs font-normal rounded px-2 py-1
                transition-opacity duration-200 whitespace-nowrap
                pointer-events-none z-10
              ">
                Set Overlay Duration From Start-Time
            </span>
            <input
              type="number"
              min={0}
              max={Math.floor(videoElement.duration)-Math.floor(videoElement.currentTime)}
              value={fredrawduration}
              onChange={(e)=>{setfredrawduration(Number(e.target.value))}}
              style={{
                width: 70,
                marginLeft: 4,
                padding: '2px 8px',
                border: '1px solid #ccc',
                borderRadius: 4,
                outline: 'none',
                fontSize: 16,
                background:'#fff',
                cursor:'pointer',
                color: '#000',
                fontWeight: 'normal'
              }}
            />
          </label>
          <Tooltip text="Add Rectangle" className='flex items-center gap-2 relative group cursor-pointer' >
            <PiRectangle onClick={addRectangle} color='white' size={30}/>
          </Tooltip>
          <Tooltip text="Add Circle" className='flex items-center gap-2 relative group cursor-pointer' >
            <PiCircle onClick={addCircle} color='white' size={30}/>
          </Tooltip>
          <Tooltip text="Add Line" className='flex items-center gap-2 relative group cursor-pointer' >
            <PiLineSegmentLight onClick={addLine} color='white' size={30}/>
          </Tooltip>
          <Tooltip text="Add Text Box" className='flex items-center gap-2 relative group cursor-pointer' >
            <CiText onClick={addText} color='white' size={30}/>
          </Tooltip>
          <Tooltip text="Export Annotaions As JSON" className='flex items-center gap-2 relative group cursor-pointer' >
            <CiExport onClick={exportShapesAsVideoRelativeJSON} color='white' size={30}/>
          </Tooltip>
          <label
            className='flex items-center gap-2 relative group cursor-pointer'
          >
            <CiImport color='white' size={31}/>
            <span className="
              absolute left-1/2 -translate-x-1/2 bottom-full mb-2
              opacity-0 group-hover:opacity-100
              bg-white text-blue-300 text-xs rounded px-2 py-1
              transition-opacity duration-200 whitespace-nowrap
              pointer-events-none z-10
            ">
              Import Annotations As JSON
            </span>
            <input
              id="json-upload"
              type="file"
              accept="application/json"
              onChange={handleJsonFile}
              style={{ display: "none" }}
            />
          </label>
          <Tooltip text="Overlay" className='flex items-center gap-2 relative group cursor-pointer' >
            <TfiLayoutMediaOverlayAlt2 onClick={postrequest} color='white' size={30}/>
          </Tooltip>
          <Tooltip text="DeSelect" className='flex items-center gap-2 relative group cursor-pointer' >
            <MdDeselect className={`${selectedId === null ? 'hidden' : 'inline'} `} onClick={handleDeselect} color='white' size={30}/>
          </Tooltip>
          <Tooltip text="Delete" className='flex items-center gap-2 relative group cursor-pointer' >
            <AiOutlineDelete className={`${selectedId === null ? 'hidden' : 'inline'} `} onClick={handleDelete} color='white' size={30}/>
          </Tooltip>
          <label
            className={`${
              selectedId === null
                ? 'hidden'
                : 'flex items-center gap-2 relative group cursor-pointer'
            } text-xl text-white font-bold`}
          >
            {!!selectedShape?.visible ? <MdOutlineVisibilityOff onClick={handleVisibilityToggle} size={30} /> : <MdOutlineVisibility onClick={handleVisibilityToggle} size={30} />}
            <span className="
              absolute left-1/2 -translate-x-1/2 bottom-full mb-2
              opacity-0 group-hover:opacity-100
              bg-white text-blue-300 font-normal text-xs rounded px-2 py-1
              transition-opacity duration-200 whitespace-nowrap
              pointer-events-none z-10
            ">
              {!!selectedShape?.visible ? "Disable Full Time Visibility" : "Enable Full Time Visibility "}
            </span>
            <input
              type="checkbox"
              disabled={selectedId === null}
              checked={selectedShape?.visible}
              onChange={handleVisibilityToggle}
              style={{
                marginLeft: 4,
                width: 18,
                height: 18,
                accentColor: '#3498db', // modern browsers support it
                cursor: selectedId === null ? 'not-allowed' : 'pointer',
                display:"none"
              }}
            />
          </label>
          <label
            className={`${
              selectedId === null || selectedType === 'text' || selectedType === 'image'
                ? 'hidden'
                : 'flex items-center gap-2 relative group cursor-pointer'
            }`}
          >
            <MdOutlineColorLens color='white' size={30}/>
            <span className="
              absolute left-1/2 -translate-x-1/2 bottom-full mb-2
              opacity-0 group-hover:opacity-100
              bg-white text-blue-300 text-xs rounded px-2 py-1
              transition-opacity duration-200 whitespace-nowrap
              pointer-events-none z-10
            ">
              Stroke Color
            </span>
            <input
              type="color"
              disabled={selectedId === null}
              value={selectedShape?.stroke || '#000000'}
              onChange={handleStrokeColorChange}
              style={{ marginLeft: 4, width: 32, height: 32, border: 'none', background: 'none', cursor: 'pointer' }}
            />
          </label>
          <label
            className={`${
              selectedId === null || selectedType === 'text' || selectedType === 'image'
                ? 'hidden'
                : 'flex items-center gap-2 relative group cursor-pointer'
            }`}
          >
            <MdOutlineLineWeight color='white' size={30}/>
            <span className="
              absolute left-1/2 -translate-x-1/2 bottom-full mb-2
              opacity-0 group-hover:opacity-100
              bg-white text-blue-300 text-xs rounded px-2 py-1
              transition-opacity duration-200 whitespace-nowrap
              pointer-events-none z-10
            ">
              Stroke Width
            </span>
            <input
              type="number"
              min={1}
              max={100}
              disabled={selectedId === null}
              value={selectedShape?.strokeWidth || 1}
              onChange={handleStrokeWidthChange}
              style={{
                width: 70,
                marginLeft: 4,
                padding: '2px 8px',
                border: '1px solid #ccc',
                borderRadius: 4,
                outline: 'none',
                fontSize: 16,
                background: selectedId === null ? '#f0f0f0' : '#fff',
                cursor: selectedId === null ? 'not-allowed' : 'pointer',
              }}
            />
          </label>
          <label
            className={`${
              selectedId === null ||
              selectedType === 'line' ||
              selectedType === 'text' ||
              selectedType === 'freedraw' ||
              selectedType === 'image'
                ? 'hidden'
                : 'flex items-center gap-2 relative group cursor-pointer'
            } text-xl text-white font-bold`}
          >
            Fill
            <span className="
              absolute left-1/2 -translate-x-1/2 bottom-full mb-2
              opacity-0 group-hover:opacity-100
              bg-white text-blue-300 text-xs rounded px-2 py-1
              transition-opacity duration-200 whitespace-nowrap
              pointer-events-none z-10
            ">
              {!!selectedShape?.fill ? "Disable Fill" : "Enable Fill"}
            </span>
            <input
              type="checkbox"
              disabled={selectedId === null}
              checked={!!selectedShape?.fill}
              onChange={handleFillToggle}
              style={{
                marginLeft: 4,
                width: 18,
                height: 18,
                accentColor: '#3498db', // modern browsers support it
                cursor: selectedId === null ? 'not-allowed' : 'pointer'
              }}
            />
          </label>
          <label
            className={`${
              selectedId === null ||
              selectedType === 'line' ||
              selectedType === 'text' ||
              selectedType === 'freedraw' ||
              selectedType === 'image' ||
              !selectedShape?.fill
                ? 'hidden'
                : 'flex items-center gap-2 relative group cursor-pointer'
            }`}
          >
            <MdFormatColorFill color='white' size={30}/>
            <span className="
              absolute left-1/2 -translate-x-1/2 bottom-full mb-2
              opacity-0 group-hover:opacity-100
              bg-white text-blue-300 text-xs rounded px-2 py-1
              transition-opacity duration-200 whitespace-nowrap
              pointer-events-none z-10
            ">
              Fill Color
            </span>
            <input
              type="color"
              disabled={selectedId === null || !selectedShape?.fill}
              value={selectedShape?.fill || '#ffffff'}
              onChange={handleFillColorChange}
              style={{
                marginLeft: 4,
                width: 32,
                height: 32,
                border: 'none',
                background: 'none',
                cursor: 'pointer'
              }}
            />
          </label>
          <label
            className={`${selectedType === 'text' ? 'flex items-center gap-2' : 'hidden'} justify-center relative group cursor-pointer`}
            // style={{ alignItems: 'flex-start' }} // So textarea aligns at the top with label
          >
            <BsTextareaT color='white' size={30}/>
            <span className="
              absolute left-1/2 -translate-x-1/2 bottom-full mb-2
              opacity-0 group-hover:opacity-100
              bg-white text-blue-300 text-xs rounded px-2 py-1
              transition-opacity duration-200 whitespace-nowrap
              pointer-events-none z-10
            ">
              Edit Text
            </span>
            <textarea
              disabled={selectedId === null}
              value={selectedShape?.text || ''}
              onChange={handleTextChange}
              style={{
                width: 120,
                height: 60,
                marginLeft: 8,
                resize: 'vertical',
                padding: 8,
                border: '1px solid #ccc',
                borderRadius: 4,
                fontSize: 15,
                outline: 'none',
                background: selectedId === null ? '#f0f0f0' : '#fff',
                cursor: selectedId === null ? 'not-allowed' : 'text',
                fontFamily: 'inherit'
              }}
              rows={3}
              placeholder="Type and press Enter for new line"
            />
          </label>
          <label
            className={`${
              selectedType === 'text' ? 'flex items-center gap-2 relative group cursor-pointer' : 'hidden'
            }`}
          >
            <VscTextSize color='white'size={30}/>
            <span className="
              absolute left-1/2 -translate-x-1/2 bottom-full mb-2
              opacity-0 group-hover:opacity-100
              bg-white text-blue-300 text-xs rounded px-2 py-1
              transition-opacity duration-200 whitespace-nowrap
              pointer-events-none z-10
            ">
              Font Size
            </span>
            <input
              type="number"
              min={1}
              max={200}
              disabled={selectedId === null}
              value={selectedShape?.fontSize || 1}
              onChange={handleFontSizeChange}
              style={{
                width: 70,
                marginLeft: 4,
                padding: '2px 8px',
                border: '1px solid #ccc',
                borderRadius: 4,
                outline: 'none',
                fontSize: 16,
                background: selectedId === null ? '#f0f0f0' : '#fff',
                cursor: selectedId === null ? 'not-allowed' : 'pointer',
              }}
            />
          </label>
          <label
            className={`${
              selectedType === 'text' ? 'flex items-center gap-2 relative group cursor-pointer' : 'hidden'
            }`}
          >
            <TbLineHeight color='white' size={30}/>
            <span className="
              absolute left-1/2 -translate-x-1/2 bottom-full mb-2
              opacity-0 group-hover:opacity-100
              bg-white text-blue-300 text-xs rounded px-2 py-1
              transition-opacity duration-200 whitespace-nowrap
              pointer-events-none z-10
            ">
              Line Height
            </span>
            <input
              type="number"
              min={0}
              max={5}
              step={0.1}
              disabled={selectedId === null}
              value={selectedShape?.lineHeight}
              onChange={handleLineHeightChange}
              style={{
                width: 55,
                marginLeft: 4,
                padding: '2px 8px',
                border: '1px solid #ccc',
                borderRadius: 4,
                outline: 'none',
                fontSize: 16,
                background: selectedId === null ? '#f0f0f0' : '#fff',
                cursor: selectedId === null ? 'not-allowed' : 'pointer',
              }}
            />
          </label>
          <label className={`${selectedType === 'text' ? 'flex items-center gap-2 relative group cursor-pointer' : 'hidden'}`}>
            <RiFontColor color='white' size={27}/>
            <span className="
              absolute left-1/2 -translate-x-1/2 bottom-full mb-2
              opacity-0 group-hover:opacity-100
              bg-white text-blue-300 text-xs rounded px-2 py-1
              transition-opacity duration-200 whitespace-nowrap
              pointer-events-none z-10
            ">
              Font Color
            </span>
            <input
              type="color"
              disabled={selectedId === null}
              value={selectedShape?.fill || '#000000'}
              onChange={handleFillColorChange}
              className="ml-2 w-8 h-8 border-none bg-transparent disabled:cursor-not-allowed"
            />
          </label> 
          <div className={`${selectedType !== "text" ? 'hidden' : 'flex'} flex-row gap-8 justify-between`}>
            <button className='border-2 w-7 h-7 rounded-[5px] text-white relative group cursor-pointer' onClick={boldText}> <b>B</b>
              <span className="
                absolute left-1/2 -translate-x-1/2 bottom-full mb-2
                opacity-0 group-hover:opacity-100
                bg-white text-blue-300 text-xs rounded px-2 py-1
                transition-opacity duration-200 whitespace-nowrap
                pointer-events-none z-10
              ">
                Bold
              </span>
            </button>
            <button className='border-2 w-7 h-7 rounded-[5px] text-white relative group cursor-pointer' onClick={italicText}> <i>I</i>
              <span className="
                absolute left-1/2 -translate-x-1/2 bottom-full mb-2
                opacity-0 group-hover:opacity-100
                bg-white text-blue-300 text-xs rounded px-2 py-1
                transition-opacity duration-200 whitespace-nowrap
                pointer-events-none z-10
              ">
                Italic
              </span>
            </button>
            <button className='border-2 w-7 h-7 rounded-[5px] text-white relative group cursor-pointer' onClick={underLineText}> <u>U</u>
              <span className="
                absolute left-1/2 -translate-x-1/2 bottom-full mb-2
                opacity-0 group-hover:opacity-100
                bg-white text-blue-300 text-xs rounded px-2 py-1
                transition-opacity duration-200 whitespace-nowrap
                pointer-events-none z-10
              ">
                Underline
              </span>
            </button>        
          </div>
          <label
            className={`${selectedId === null ? 'hidden' : 'flex items-center gap-2 relative group cursor-pointer'} text-xl text-white font-bold font-sans`}
          >
            From
            <span className="
                absolute left-1/2 -translate-x-1/2 bottom-full mb-2
                opacity-0 group-hover:opacity-100
                bg-white text-blue-300 font-normal text-xs rounded px-2 py-1
                transition-opacity duration-200 whitespace-nowrap
                pointer-events-none z-10
              ">
                Overlay Start-Time
              </span>
            <input
              type="number"
              min={0}
              max={Math.floor(videoElement.duration)}
              disabled={selectedId === null}
              value={selectedShape?.startTime}
              onChange={handleStartimeChange}
              style={{
                width: 70, // Thoda zyada rakhein, taaki bade time bhi aa sakein
                marginLeft: 4,
                padding: '2px 8px',
                border: '1px solid #ccc',
                borderRadius: 4,
                outline: 'none',
                fontSize: 16,
                background: selectedId === null ? '#f0f0f0' : '#fff',
                cursor: selectedId === null ? 'not-allowed' : 'pointer',
                color: '#000',
                fontWeight: 'normal'
              }}
            />
          </label>
          <label
            className={`${selectedId === null ? 'hidden' : 'flex items-center gap-2 relative group cursor-pointer'} text-xl text-white font-bold font-sans`}
          >
            To
            <span className="
                absolute left-1/2 -translate-x-1/2 bottom-full mb-2
                opacity-0 group-hover:opacity-100
                bg-white text-blue-300 text-xs font-normal rounded px-2 py-1
                transition-opacity duration-200 whitespace-nowrap
                pointer-events-none z-10
              ">
                Overlay End-Time
              </span>
            <input
              type="number"
              min={0}
              max={Math.floor(videoElement.duration)}
              disabled={selectedId === null}
              value={selectedShape?.endTime}
              onChange={handleEndtimeChange}
              style={{
                width: 70,
                marginLeft: 4,
                padding: '2px 8px',
                border: '1px solid #ccc',
                borderRadius: 4,
                outline: 'none',
                fontSize: 16,
                background: selectedId === null ? '#f0f0f0' : '#fff',
                cursor: selectedId === null ? 'not-allowed' : 'pointer',
                color: '#000',
                fontWeight: 'normal'
              }}
            />
          </label>
          <label
            className={`${selectedId === null ? 'hidden' : 'flex items-center gap-2 relative group cursor-pointer'} text-xl text-white font-bold font-sans`}
          >
            Duration
            <span className="
                absolute left-1/2 -translate-x-1/2 bottom-full mb-2
                opacity-0 group-hover:opacity-100
                bg-white text-blue-300 text-xs font-normal rounded px-2 py-1
                transition-opacity duration-200 whitespace-nowrap
                pointer-events-none z-10
              ">
                Set Overlay Duration From Start-Time
            </span>
            <input
              type="number"
              min={0}
              max={Math.floor(videoElement.duration)}
              disabled={selectedId === null}
              onChange={handleDurationtimeChange}
              style={{
                width: 70,
                marginLeft: 4,
                padding: '2px 8px',
                border: '1px solid #ccc',
                borderRadius: 4,
                outline: 'none',
                fontSize: 16,
                background: selectedId === null ? '#f0f0f0' : '#fff',
                cursor: selectedId === null ? 'not-allowed' : 'pointer',
                color: '#000',
                fontWeight: 'normal'
              }}
            />
          </label>

        </div>
      </div>

      <div className="flex-1 custom-scrollbar overflow-auto">
        <Stage
          className='box-border flex items-center justify-center mt-10'
          height={videoSize.height}
          width={videoSize.width}
          onMouseDown={handleStageMouseDown}
          onMousemove={handleStageMouseMove}
          onMouseup={handleStageMouseUp}
          onTouchStart={handleStageMouseDown}
          onTouchMove={handleStageMouseMove}
          onTouchEnd={handleStageMouseUp}
        >
          <Layer ref={layerRef} >
            <Image
              image={videoElement}
              x={0}
              y={0}
              width={videoSize.width}
              height={videoSize.height}
            />
            {shapes.map((shape, i) => {
              if (shape.type === 'rect') {
                return (
                  <Rectangle
                    key={shape.id}
                    shapeProps={shape}
                    isSelected={shape.id === selectedId}
                    onSelect={() => {setSelectedId(shape.id); setSelectedType(shape.type);}}
                    onChange={newAttrs => handleShapeChange(i, newAttrs)}
                    visible={shape.visible || (Math.floor(videoElement.currentTime)>=shape.startTime && Math.floor(videoElement.currentTime)<=shape.endTime)}
                  />
                );
              }
              if (shape.type === 'circle') {
                return (
                  <CircleShape
                    key={shape.id}
                    shapeProps={shape}
                    isSelected={shape.id === selectedId}
                    onSelect={() => {setSelectedId(shape.id); setSelectedType(shape.type);}}
                    onChange={newAttrs => handleShapeChange(i, newAttrs)}
                    visible={shape.visible || (Math.floor(videoElement.currentTime)>=shape.startTime && Math.floor(videoElement.currentTime)<=shape.endTime)}
                  />
                );
              }
              if (shape.type === "line") {
                return (
                  <EditableLineShape
                    key={shape.id}
                    shapeProps={shape}
                    isSelected={shape.id === selectedId}
                    onSelect={() => {setSelectedId(shape.id); setSelectedType(shape.type);}}
                    onChange={newAttrs => handleShapeChange(i, newAttrs)}
                    visible={shape.visible || (Math.floor(videoElement.currentTime)>=shape.startTime && Math.floor(videoElement.currentTime)<=shape.endTime)}
                  />
                );
              }
              if (shape.type === "text") {
                return (
                  <EditableTextShape
                    key={shape.id}
                    shapeProps={shape}
                    isSelected={shape.id === selectedId}
                    onSelect={() => {setSelectedId(shape.id); setSelectedType(shape.type);}}
                    onChange={newAttrs => handleShapeChange(i, newAttrs)}
                    visible={shape.visible || (Math.floor(videoElement.currentTime)>=shape.startTime && Math.floor(videoElement.currentTime)<=shape.endTime)}
                  />
                );
              }
              if (shape.type === 'freedraw') {
                return (
                  <Line
                    key={shape.id}
                    points={shape.points}
                    isSelected={shape.id === selectedId}
                    onClick={() => {setSelectedId(shape.id); setSelectedType(shape.type);}}
                    stroke={shape.stroke}
                    strokeWidth={shape.strokeWidth}
                    lineCap={shape.lineCap}
                    lineJoin={shape.lineJoin}
                    tension={shape.tension}
                    globalCompositeOperation="source-over"
                    visible={shape.visible || (Math.floor(videoElement.currentTime)>=shape.startTime && Math.floor(videoElement.currentTime)<=shape.endTime)}
                  />
                );
              }
              if (shape.type === "image") {
                return (
                  <EditableImageShape
                    key={shape.id}
                    shapeProps={shape}
                    isSelected={shape.id === selectedId}
                    onSelect={() => { setSelectedId(shape.id); setSelectedType(shape.type); }}
                    onChange={newAttrs => handleShapeChange(i, newAttrs)}
                    visible={shape.visible || (Math.floor(videoElement.currentTime)>=shape.startTime && Math.floor(videoElement.currentTime)<=shape.endTime)}
                  />
                );
              }
              return null;
            })}

            {status && (
              <Text
                fontSize={34}
                fill={'#90cdf4'}
                width={ status==="PLAY..." ? 120 : 300}
                height={34}
                text={status}
                x={ status==="PLAY..." ? videoSize.width/2-60 : videoSize.width/2-100}
                y={videoSize.height/2-17}
              />
            )}
          </Layer>
        </Stage>
        <div
      className='bg-blue-200'
      style={{ width: videoSize.width, height: 10, borderRadius: 5, margin: '12px auto', position: 'relative', cursor: 'pointer' }}
      onClick={e => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percent = x / rect.width;
        videoElement.currentTime = percent * duration;
      }}
        onMouseMove={handleSeekBarMouseMove}
        onMouseLeave={handleSeekBarMouseLeave}
      >
        <div
          className='bg-blue-300'
          style={{
            width: `${progress * 100}%`,
            height: "100%",
            borderRadius: 5,
            transition: "width 0.1s linear"
          }}
        />
        {/* Hover preview frame */}
        {hoverFrame && hoverX !== null && (
          <div
            style={{
              position: "absolute",
              left: hoverX - 80, // Center preview
              bottom: 20, // Seek bar ke upar dikhaye
              width:videoSize.width/4,
              height:videoSize.height/4,
              background: "#222",
              border: "2px solid #fff",
              borderRadius: 8,
              pointerEvents: "none",
              zIndex: 10
            }}
          >
            <img
              src={hoverFrame}
              alt="Preview"
              style={{ width: "100%", height: "100%", display: "block" }}
            />
          </div>
        )}
        </div>
        <div className='flex justify-between items-center' style={{ width: videoSize.width, margin: '12px auto', position: 'relative'}}>
          <h3 className='text-blue-300'>
            {String(Math.floor(videoElement.currentTime / 60)).padStart(2, '0') || "00" }:
            {String(Math.floor(videoElement.currentTime % 60)).padStart(2, '0') || "00" }
          </h3>
          <button className='cursor-pointer' onClick={()=>{videoElement.currentTime-=10}}><MdOutlineReplay10 className='text-blue-300' size={40}/></button>
          <button className='cursor-pointer' onClick={handleplaypause}>{isplay && videoElement.currentTime !==videoElement.duration ? <FaRegCirclePause className='text-blue-300' size={40}/> : <FaRegCirclePlay className='text-blue-300' size={40}/>}</button>
          <button className='cursor-pointer' onClick={()=>{videoElement.currentTime+=10}}><MdOutlineForward10 className='text-blue-300' size={40}/></button>
          <h3 className='text-blue-300'>
            {String(Math.floor(videoElement.duration / 60)).padStart(2, '0') || "00" }:
            {String(Math.floor(videoElement.duration % 60)).padStart(2, '0') || "00" }
          </h3>

        </div>
      </div>


    </div>
    
  );
};

export default VideoOnCanvas;