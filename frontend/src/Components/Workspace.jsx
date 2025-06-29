import React from 'react'

const Workspace = () => {
  return (
    <div className='ml-56 p-4 flex flex-col items-center w-screen gap-5 border-2' >
        <div className='relative border-2'>
            <img className='rounded-2xl h-96' width={'full'} height={'200'} src={'https://pixy.org/src/474/4745416.jpg' }/>
            <h1 className=' font-bold absolute bottom-2 left-5 text-white text-6xl font-mono'>Workspace</h1>
        </div>
        <div className='w-full border-2'>
            Foldername
        </div>
    </div>
  )
}

export default Workspace

