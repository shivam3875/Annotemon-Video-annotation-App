import React, { useState } from 'react';
import useFileupload from '../hooks/useFileupload';
import { Navigate } from 'react-router-dom';
import { usevideourlContext } from '../Context/videourlContext';
import Navbar from '../Components/Navbar';
import { MdFileUpload } from "react-icons/md";
import { MdOutlineVideoFile } from "react-icons/md";



function FileUpload() {
  const [file, setFile] = useState(null);
  const {uploadfile} = useFileupload();
  const {VIDEO_URL} = usevideourlContext()
  const [msg,setmsg] = useState("Upload")

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file) {
      alert('Please select a file first');
      return;
    }
    setmsg("File Being Uploaded...")
    await uploadfile(file);
  };

  return (

    VIDEO_URL ? <Navigate to="/canvas"/> :

    <div className='h-screen flex items-center flex-col gap-64'>
      <Navbar />
      <form className='bg-[#3498db] inline w-fit py-7 px-14 rounded-2xl' onSubmit={handleSubmit}>
        <label className='text-white text-xl font-bold cursor-pointer' htmlFor="fup">
          {file ? "" :  <div className='flex gap-2' > Choose File <MdOutlineVideoFile size={30} /></div> }
          <input className='hidden' type="file" accept="video/*" id='fup'  onChange={handleFileChange} />
        </label>
        {file ? <button className='text-white text-2xl flex items-center font-bold cursor-pointer' type="submit">{msg}  <MdFileUpload size={40}/></button> : <></>}
      </form>
    </div>
  );
}

export default FileUpload;
