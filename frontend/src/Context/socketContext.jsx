import React, { createContext, useContext,useState } from "react";

export const SocketContext = createContext();

export const usesocketContext = () => {
    return useContext(SocketContext);
}

export const SocketContextProvider = ({children}) =>{
    const [socket, setSocket] = useState(null);

    return<SocketContext.Provider value={{socket, setSocket}}>{children}</SocketContext.Provider>
}