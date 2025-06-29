import './App.css'
import {Routes, Route } from "react-router-dom";
import VideoOnCanvas from './pages/VideoOnCanvas';
import FileUpload from './pages/FileUpload';
import DownloadOverlayedVideo from './pages/DownoadOverlayedVideo';

function App() {

  return (
      <Routes>
        <Route path='/' element={<FileUpload/>}/>
        <Route path='/canvas' element={<VideoOnCanvas/>}/>
        <Route path='/download' element={<DownloadOverlayedVideo/>}/>
      </Routes>
  )
}

export default App
