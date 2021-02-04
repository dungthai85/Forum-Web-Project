const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const path = require('path');

const app = express();
const db = require('./utlities/mysqlconn');

// urlencoded to help extract data from form
app.use(bodyParser.urlencoded({ extended: true }));

// Routes to add, edit, and delete topics
app.use('/', require('./routes/topics'));

// Opens server to listen to port 3000
app.listen(3000, function () {

});

// Setting the view for ejs
app.set('view engine', 'ejs');

// Making the css folder static to be accessable by ejs page
app.use('/css', express.static('css'));

// Renders the index page
app.get('/', function (req, res) {
    //Query db to open all of the posts
    db.query('SELECT * FROM TOPICS', (err, results) => {
        if (err) throw err;
        res.render('../views/index', {topics : results});
    });
    
});

// Renders the addpost page
app.get('/addpost', function (req, res) {
    res.render('../views/addpost');
});

// Increment like
app.get('/addlike', function (req, res) {
    //Query to get the row
    var query1 = `SELECT * FROM TOPICS WHERE topicid = ${req.query.topic} `;
    db.query(query1, (err1, results) => {
        if (err1) throw err1;
        var points = results[0].points + 1;
        //Query to update the likes
        var query2 = `UPDATE TOPICS SET points = '${points}' WHERE topicid = ${req.query.topic} `;
        db.query(query2, (err2, res) => {
            if (err2) throw err2;

        });
        res.redirect('/');
    });
    
});

// Renders the editpost page
app.get('/editpost.ejs', function (req, res) {
    //Query db for the topic to edit
    db.query(`SELECT * FROM TOPICS WHERE topicid = ${req.query.topic}`, (err, results) => {
        if (err) throw err;
        // console.log(results);
        res.render('../views/editpost', {post: results});
    });
    
});

// Renders the delete page
app.get('/deletepost.ejs', function (req, res) {
    //Query db for the delete post
    db.query(`SELECT * FROM TOPICS WHERE topicid = ${req.query.topic}`, (err, results) => {
        if (err) throw err;
        // console.log(results);
        res.render('../views/deletepost', {post: results});
    });
    
});

// Renders the comments page
app.get('/comment.ejs', function (req, res) {
        //Query db for the topic comments
        db.query(`SELECT * FROM TOPICS WHERE topicid = ${req.query.topic}`, (err, results) => {
            if (err) throw err;
            // console.log(results);
            res.render('../views/comment', {post: results});
        });
});

// connection.end((err) => {
//     console.log("Connection ended");
//   });
