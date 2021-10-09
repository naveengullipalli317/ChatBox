const express = require('express');
const http = require('http');
const path = require('path');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(path.join(__dirname, 'public')));

const botName = 'ChatCord Box';
//run when client connects
io.on('connection', socket => {
    socket.on('joinRoom', ({ username, room }) => {
     const user = userJoin(socket.id, username, room);   
     socket.join(user.room); 

     // welcome current user
     socket.emit('message', formatMessage(botName,'Welcome to ChatBox'));

     // Broadcast when a user connects
     socket.broadcast.to(user.room).emit(
             'message',formatMessage(botName, `${user.username} has joined the chat`));  
    
             //send users and room info
           io.to(user.room).emit('roomUsers', {
               room: user.room,
               users: getRoomUsers(user.room)
           });  
    });
    

    //runs when clients disconnects
    socket.on('disconnect', () => {
        const user = userLeave(socket.id);

        if(user) {
            io.to(user.room).emit('message', formatMessage(botName, `${user.username} has left the chat`));

             //send users and room info
           io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });
        }  
    });
    //listen for chatmessage
    socket.on('chatMessage', msg => {
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit('message', formatMessage(user.username, msg));
    });

});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`server running on port ${PORT}`));