import React, { createContext, useContext } from "react";

export const OverlayedvideourlContext = createContext();

export const useoverlayedvideourlContext = () => {
    return useContext(OverlayedvideourlContext);
}

export const OverlayedvideourlContextProvider = ({children}) =>{
    const [overlayedvideourl,setoverlayedvideourl] = React.useState(null)

    return<OverlayedvideourlContext.Provider value={{overlayedvideourl,setoverlayedvideourl}}>{children}</OverlayedvideourlContext.Provider>
}