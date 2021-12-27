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
app.get('/', (_, res) => res.render('home_socketIO'));
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

// Get ready to receive connections.
socketIOserver.on("connection", (socket) => {
  socket["nickname"] = "Anon";

  // Get information about available rooms.
  socketIOserver.sockets.emit("roomUpdate", findPublicRooms());

  // Add an event listener that is invoked in the front end.
  socket.on("enterRoom", (payload, done) => {
    socket["nickname"] = payload.nickname;
    // Server has a private room ready for server and a client as default, id.
    // The room names after the id is other rooms that the client is currently participating.
    socket.join(payload.room_name); // Join a room the client has entered in the form.

    // console.log(socket.rooms); // Check the participating rooms.
    done();

    // Tell the people in the room that this new client has joined the room.
    socket.to(payload.room_name).emit("welcome", `${socket.nickname} JOINED ${payload.room_name}`, countParticipants(payload.room_name));

    // Notify all sockets that a new room has been created.
    socketIOserver.sockets.emit("roomUpdate", findPublicRooms());
  });

  // Send message to the room.
  socket.on("addMessage", (message, roomName, done) => {
    socket.to(roomName).emit("addMessage", `${socket.nickname}: ${message}`);
    done();
  });

  // Tell the rooms, where this client is participating at, that the client has been disconnected.
  socket.on("disconnecting", () => {
    socket.rooms.forEach((roomID) => {
      socket.to(roomID).emit("farewell", `${socket.nickname} left ${roomID}.`, countParticipants(roomID) - 1);
    });
  });

  socket.on("disconnect", () => {
    // Notify all sockets that the public room has been destroyed, done by socketIO.
    socketIOserver.sockets.emit("roomUpdate", findPublicRooms());
  });
});

// Turn the server on
httpServer.listen(9999, () => {console.log('Activated the Server server.');});

// Custom functions
function findPublicRooms() {
  const {
    sockets: {
      adapter: { sids, rooms},
    },
  } = socketIOserver;

  const publicRooms = [];

  rooms.forEach((_, key) => {
    if (sids.get(key) === undefined) {
      publicRooms.push(key);
    }
  })
  return publicRooms;
}

function countParticipants(roomName) {
  console.log(socketIOserver.sockets.adapter.rooms.get(roomName)?.size);
  return socketIOserver.sockets.adapter.rooms.get(roomName)?.size;
}