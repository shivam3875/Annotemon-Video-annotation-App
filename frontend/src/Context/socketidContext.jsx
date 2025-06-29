import React, { createContext, useContext,useState } from "react";

export const SocketidContext = createContext();

export const usesocketidContext = () => {
    return useContext(SocketidContext);
}

export const SocketidContextProvider = ({children}) =>{
    const [socketId, setSocketId] = useState(null);

    return<SocketidContext.Provider value={{socketId, setSocketId}}>{children}</SocketidContext.Provider>
}