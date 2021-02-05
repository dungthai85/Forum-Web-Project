const express = require('express');
const app = express();

// Routes to add, edit, and delete topics
app.use('/', require('./routes/topics'));

// Routes to add, edit, and delete comments
app.use('/', require('./routes/comments'));

// Opens server to listen to port 3000
app.listen(3000, function () {

});

// Setting the view for ejs
app.set('view engine', 'ejs');

// Making the css folder static to be accessable by ejs page
app.use('/css', express.static('css'));

// connection.end((err) => {
//     console.log("Connection ended");
//   });
