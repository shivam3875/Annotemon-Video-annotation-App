import React from 'react'
import { CiCirclePlus } from "react-icons/ci";

const Sidebar = () => {


  return (<div className='h-screen w-56 shadow-md fixed p-1 flex flex-col items-center bg-white z-10'>
    <CiCirclePlus size={40} className='cursor-pointer' />
    Add New
    <button className="btn btn-neutral">Neutral</button>
  </div>)
}


export default Sidebar;

