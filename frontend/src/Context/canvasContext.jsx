import React, { createContext, useContext } from "react";

export const CanvasContext = createContext();

export const usecanvasContext = () => {
    return useContext(CanvasContext);
}

export const CanvasContextProvider = ({children}) =>{
    const [canvas,setcanvas] = React.useState(null)

    return<CanvasContext.Provider value={{canvas,setcanvas}}>{children}</CanvasContext.Provider>
}
