// Backend(or Server)

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

// socketIO admin.
const {instrument} = require("@socket.io/admin-ui");

const app = express();

// Template engine setting, pug
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Router
app.use('/public', express.static(__dirname + '/public'));
app.get('/', (_, res) => res.render('home'));
app.get('/*', (_, res) => res.redirect('/')); // Redirect to home when accessing to unregistered route.

// Set server
const httpServer = http.createServer(app);
const socketIOserver = new Server(httpServer, {
  cors: {
    origin: ["https://admin.socket.io"],
    credentials: true
  }
});
instrument(socketIOserver, {
  auth: false
});

socketIOserver.on("connection", (socket) => {

  socket.on("enterRoom", (roomName) => {
    // Peer B, or initial Host
    socket.join(roomName);

    // Peer A, participating room members.
    socket.to(roomName).emit("greeting", `Server: Someone joined the room, '${roomName}'.`);
  });

  // Signaling
  socket.on("offer", (offer, roomName) => {
    // Peer A => Peer B
    socket.to(roomName).emit("offer", offer);
  });

  socket.on("answer", (answer, roomName) => {
    // Peer B => Peer A
    socket.to(roomName).emit("answer", answer);
  });

  socket.on("ice", (icecandidate, roomName) => {
    // Peer B <=> Peer A
    socket.to(roomName).emit("ice", icecandidate);
  });
});

// Turn the server on
httpServer.listen(9999, () => {console.log('Activated the WebRTC server.');});