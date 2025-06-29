import React from 'react'
import Navbar from '../Components/Navbar.jsx'
import Sidebar from '../Components/Sidebar.jsx'
import Workspace from '../Components/Workspace.jsx'

const Home = () => {
  return (
    <div>
      <Navbar />
      <div className="flex">
        <Sidebar />
        <Workspace />
      </div>
      
    </div>
  )
}

export default Home

