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
  socketIOserver.sockets.emit("roomUpdate", showPublicRooms());

  // Add an event listener that is invoked in the front end.
  socket.on("createRoom", (payload, done) => {
    const isRoomExist = findRoom(payload.room_name);
    if (isRoomExist) {
      socket.emit("roomExist", payload.room_name);
      return;
    }
    socket["nickname"] = payload.nickname;
    // Server has a private room ready for server and a client as default, id.
    // The room names after the id is other rooms that the client is currently participating.
    socket.join(payload.room_name); // Join a room the client has entered in the form.

    // console.log(socket.rooms); // Check the participating rooms.
    done();
    
    // Notify all sockets that a new room has been created.
    socketIOserver.sockets.emit("roomUpdate", showPublicRooms());
  });
 
  // Join a room
  socket.on("joinRoom", (payload, done) => {
    const isRoomExist = findRoom(payload.room_name);
    if (!isRoomExist) {
      socket.emit("roomNotFound", payload.room_name);
      return;
    }
    socket["nickname"] = payload.nickname;
    socket.join(payload.room_name);
    done();
    // Tell the people in the room that this new client has joined the room.
    const sendingPayload = {nickname: socket.nickname, message: `【SYSTEM】 ${payload.nickname} joined the room, ${payload.room_name}.`}
    socket.to(payload.room_name).emit("welcome", sendingPayload, countParticipants(payload.room_name));
  });

  // Send message to the room.
  socket.on("addMessage", (payload, roomName, done) => {
    socket["nickname"] = payload.nickname;
    const sendingPayload = {nickname: socket.nickname, message: payload.message};
    socket.to(roomName).emit("addMessage", sendingPayload);
    done(showPublicRooms());
  });

  // Leave the room
  socket.on("leave", (roomName, nickname) => {
    socket["nickname"] = nickname;
    console.log(socket.id, 'left the room,',roomName);
    socket.leave(roomName);
    socketIOserver.sockets.emit("roomUpdate", showPublicRooms());
  });

  // Tell the rooms, where this client is participating at, that the client has been disconnected.
  socket.on("disconnecting", () => {
    const sendingPayload = {nickname: socket.nickname, message: `【SYSTEM】 ${socket.nickname} left the chat.`};
    socket.rooms.forEach((roomID) => {
      socket.to(roomID).emit("farewell", sendingPayload, countParticipants(roomID) - 1);
    });
  });

  socket.on("disconnect", () => {
    // Notify all sockets that the public room has been destroyed, done by socketIO.
    socketIOserver.sockets.emit("roomUpdate", showPublicRooms());
  });
});


// Custom functions
function showPublicRooms() {
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
  return socketIOserver.sockets.adapter.rooms.get(roomName)?.size;
}
function findRoom(roomName) {
  const {
    sockets: {
      adapter: {rooms},
    },
  } = socketIOserver;

  const isRoomExist = rooms.get(roomName) !== undefined;
  return isRoomExist
} 

// Turn the server on
httpServer.listen(9999, () => {console.log('Activated the Server server.');});
