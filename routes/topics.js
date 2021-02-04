
const express = require('express');
var router = express.Router();
const db = require('../utlities/mysqlconn');

const bodyParser = require('body-parser');

// urlencoded to help extract data from form
router.use(bodyParser.urlencoded({ extended: true }));

// Add endpoint to insert into list of topics
router.post('/addpost', function (req, res) {

    var fakeuserid = 14;
    //Query to add post
    var query = `INSERT INTO TOPICS (userid, topicname, topicdetails, points, posted, comments) VALUES ( ${fakeuserid} , '${req.body.title}' , '${req.body.desc}' , 0, NOW(), '{"name" : "HELLO"}')`;

    db.query(query, (err, results) => {
        if (err) throw err;
    });

    res.redirect('/');

});

// edit endpoint to edit topic
router.post('/editpost', function (req, res) {

    //Query to edit the post
    var query = `UPDATE TOPICS SET topicname = '${req.body.title}', topicdetails = '${req.body.desc}' WHERE topicid = ${req.body.tid} `;

    db.query(query, (err, results) => {
        if (err) throw err;
    });

    res.redirect('/');

});

// delete endpoint to delte topic
router.post('/deletepost', function (req, res) {
    if (req.body.tid !== "No") {

        //Query to delete post
        var query = `DELETE FROM TOPICS WHERE topicid = ${req.body.tid} `;

        db.query(query, (err, results) => {
            if (err) throw err;
        });
    }

    res.redirect('/');

});


module.exports = router;