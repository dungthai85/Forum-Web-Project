const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const path = require('path');

const app = express();

// urlencoded to help extract data from form
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/', require('./routes/topics.js'));

// Opens server to listen to port 3000
app.listen(3000, function () {

});

// Setting the view for ejs
app.set('view engine', 'ejs');

// Making the css folder static to be accessable by ejs page
app.use('/css', express.static('css'));

// Renders the ejs page
app.get('/', function (req, res) {
    res.render('../views/index');
});


// connection.end((err) => {
//     console.log("Connection ended");
//   });
