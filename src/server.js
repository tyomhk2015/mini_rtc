// Backend(or Server)

const express = require('express');
const http = require('http');
const path = require('path');
const WebSocket = require('ws');

const app = express();

// template engine setting, pug
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// router
app.use('/public', express.static(__dirname + '/public'));
app.get('/', (_, res) => res.render('home'));

// Redirect to home when accessing to unregistered route.
app.get('/*', (_, res) => res.redirect('/'));

// Create a WebSocket server on top of the http server.
// The application will be able to handler HTTP and WS protocols.
const server = http.createServer(app);
const webSocketServer = new WebSocket.Server({server});

// Temporary array for storing clients' sockets.
const sockets = [];

// The 2nd argument of the callback:
// this: WebSocket.Server =>
// socket: WebSocket => 
//   A client(browser) that connected to this WebSocket.
//   A mean of sending/receiving messages.
// request: http.IncomingMessage =>
webSocketServer.on("connection", (socket) => {
  // socket: Each client(browser) that is connected to this WebSocket Server.
  console.log("Connected to Browser (WS) ✅");

  sockets.push(socket);

  // When the client leaves the server.
  socket.on("close", () => {
    console.log("The client left the server ❌");
  });
  
  // When the client (browser) sends a message to the server.
  socket.on("message", (message) => {
    console.log("From the client (Browser):", message.toString());
    sockets.forEach((aSocket) => {
      aSocket.send(message.toString());
    });
  })

  // Send a message to the client (browser).
  socket.send("YAGOOのお夢、ホロライブ！");
});

// Turn the server on
server.listen(9999, () => {console.log('Activated the WebSocket server.');});

