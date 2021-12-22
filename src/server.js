const express = require('express');
const path = require('path');

const app = express();

// template engine setting, pug
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// router
app.use('/public', express.static(__dirname + '/public'));
app.get('/', (req, res) => res.render('home'));

// Redirect to home when accessing to unregistered route.
app.get('/*', (req, res) => res.redirect('/'));

// Turn the server on
app.listen(9999, () => {console.log('Activated the server.');});