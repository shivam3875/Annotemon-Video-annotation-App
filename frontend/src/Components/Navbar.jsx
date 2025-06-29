import React from 'react'

const Navbar = () => {
  return (
    <>
    <div id='navbar' className="navbar shadow-sm ">
        <div className="flex-1">
            <a className="btn btn-ghost text-white text-3xl"><img className='h-72 mt-4' src="/generated-image4.png" alt="" /></a>
        </div>
        <div className="flex-none">
            <button className='text-white bg-[#3498db] p-2 mr-6 rounded-xl  text-xl flex items-center font-bold cursor-not-allowed' type="submit">Log in</button> 
        </div>
    </div>
    </>
  )
}

export default Navbar
