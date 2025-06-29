import React, { createContext, useContext } from "react";

export const VideourlContext = createContext();

export const usevideourlContext = () => {
    return useContext(VideourlContext);
}

export const VideourlContextProvider = ({children}) =>{
    const [VIDEO_URL,setvideourl] = React.useState(null)

    return<VideourlContext.Provider value={{VIDEO_URL,setvideourl}}>{children}</VideourlContext.Provider>
}