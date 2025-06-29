import React, { createContext, useContext } from "react";

export const ImageurlContext = createContext();

export const useimageurlContext = () => {
    return useContext(ImageurlContext);
}

export const ImageurlContextProvider = ({children}) =>{
    const [IMAGE_URL,setImageurl] = React.useState(null)

    return<ImageurlContext.Provider value={{IMAGE_URL,setImageurl}}>{children}</ImageurlContext.Provider>
}