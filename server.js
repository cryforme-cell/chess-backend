const express = require('express');
const app = express();
const http = require('http').createServer(app);

// Initialize Socket.io and allow connections from your frontend URL
const io = require('socket.io')(http, {
  cors: {
    origin: "*", // Allows any frontend to connect. 
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3000;

// This object stores the current board layout (FEN) for every active room
const rooms = {};

io.on('connection', (socket) => {
  console.log('A user connected: ' + socket.id);

  // 1. Player joins a room
  socket.on('join-room', (roomID) => {
    socket.join(roomID);
    console.log(`User ${socket.id} joined room: ${roomID}`);
    
    // If the room already has a game in progress, instantly send the board to the new player!
    if (rooms[roomID]) {
        socket.emit('receive-move', { fen: rooms[roomID] });
    }
  });

  // 2. Player makes a move
  socket.on('make-move', (data) => {
    // data = { roomID: '...', fen: 'rnbqkbnr/pppppppp/8...' }
    
    // Update the server's memory with the new board layout
    rooms[data.roomID] = data.fen;

    // Broadcast the exact board layout to the OTHER player in the room
    socket.to(data.roomID).emit('receive-move', { fen: data.fen });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected: ' + socket.id);
  });
});

// A simple health check so Railway knows the server is alive
app.get('/', (req, res) => {
  res.send('Chess Socket.io Server is running perfectly!');
});

// Bind to the port assigned by Railway
http.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});
