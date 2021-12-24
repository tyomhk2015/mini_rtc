const express = require('express');
const http = require('http');
const path = require('path');
const webSocket = require('ws');

const app = express();

// template engine setting, pug
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// router
app.use('/public', express.static(__dirname + '/public'));
app.get('/', (_, res) => res.render('home'));

// Redirect to home when accessing to unregistered route.
app.get('/*', (_, res) => res.redirect('/'));

// Create a server using express.js
const server = http.createServer(app);

// Turn the server on
// app.listen(9999, () => {console.log('Activated the WebSocket server.');});

