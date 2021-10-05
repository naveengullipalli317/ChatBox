const express = require('express');
const http = require('http');
const path = require('path');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', socket => {
    
    socket.emit('message', 'Welcome to ChatBox');

    // Welcome current user
    //  socket.emit('message', formatMessage(botName, 'Welcome to ChatCord!'));

    // Broadcast when a user connects
    socket.broadcast.emit(
            'message','A user has joined the chat');
    //runs when clients disconnects
    socket.on('disconnect', () => {
        io.emit('message', 'A user has left the chat');
    });

});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`server running on port ${PORT}`));