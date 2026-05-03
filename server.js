const express = require('express');
const app = express();
const http = require('http').createServer(app);

// Initialize Socket.io and allow connections from your frontend URL
const io = require('socket.io')(http, {
  cors: {
    origin: "*", // In production, replace * with your GitHub Pages URL
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3000;

io.on('connection', (socket) => {
  console.log('A user connected: ' + socket.id);

  // Player joins a room
  socket.on('join-room', (roomID) => {
    socket.join(roomID);
    console.log(`User ${socket.id} joined room: ${roomID}`);
  });

  // Relay the move to the other player in the same room
  socket.on('make-move', (data) => {
    // data = { roomID: '...', move: { from: 'e2', to: 'e4' } }
    socket.to(data.roomID).emit('receive-move', data.move);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

http.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});
