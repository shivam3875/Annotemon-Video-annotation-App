import { Server } from "socket.io";
import http from "http";
import express from "express";


const app =express();

const server =http.createServer(app);

const io=new Server(server,{
    cors:{
        origin:"*",
        methods:["GET","POST"],
        credentials:true,
    },
})

io.on("connection",(socket)=>{
    console.log("user connected",socket.id);
    socket.emit("socket-id", { socketId: socket.id });

    socket.on("disconnect",()=>{
        console.log("user disconnected",socket.id);
    })
})


export {app,io,server};