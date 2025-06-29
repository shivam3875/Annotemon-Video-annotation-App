import React from 'react'
import Navbar from '../Components/Navbar.jsx'
import Sidebar from '../Components/Sidebar.jsx'
import Canva from '../Components/Canva.jsx'

const Canvas = () => {
  return (
    <div className="h-screen w-screen flex flex-col">
      <Navbar />
      <div className="flex flex-row flex-1 overflow-hidden">
        <Sidebar />
        {/* Sidebar fixed hai, isliye Canva ke parent ko margin-left do */}
        <div className="ml-56 flex-1 h-full">
          <Canva />
        </div>
      </div>
    </div>
  )
}

export default Canvas

