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

// Turn the server on
httpServer.listen(9999, () => {console.log('Activated the WebRTC server.');});