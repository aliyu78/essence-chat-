const express=require('express');
const path=require('path');
const http=require('http');
const {Server}=require('socket.io');

const app=express();
const server=http.createServer(app);
const io=new Server(server);
const PORT=process.env.PORT||3000;

app.use(express.static(path.join(__dirname,'public')));
app.get('/',(req,res)=>{ res.sendFile(path.join(__dirname,'public/index.html')); });

io.on('connection', socket=>{
  console.log('User connected:',socket.id);
  socket.on('join-room',(roomId,userId)=>{
    socket.join(roomId);
    socket.to(roomId).emit('user-connected',userId);
    socket.on('disconnect',()=>{ socket.to(roomId).emit('user-disconnected',userId); });
    socket.on('offer',(offer,targetId)=>{ socket.to(targetId).emit('offer',offer,socket.id); });
    socket.on('answer',(answer,targetId)=>{ socket.to(targetId).emit('answer',answer,socket.id); });
    socket.on('ice-candidate',(candidate,targetId)=>{ socket.to(targetId).emit('ice-candidate',candidate,socket.id); });
  });
});

server.listen(PORT,()=>console.log(`Essence Chat running on port ${PORT}`));
