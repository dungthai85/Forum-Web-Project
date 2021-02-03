
const express = require('express');
var router = express.Router();
const db = require('../utlities/mysqlconn.js');

const bodyParser = require('body-parser');

// urlencoded to help extract data from form
router.use(bodyParser.urlencoded({ extended: true }));

// Add endpoint to insert into list of topics
router.post('/addpost', function (req, res) {
    console.log(req.body);
    var fakeuserid = 102;
    var query = `INSERT INTO TOPICS (userid, topicname, topicdetails, points, posted, comments) VALUES (${fakeuserid}, ${req.body.title}, ${req.body.desc}, 0, NOW(), '{}')`;
    // var query = `INSERT INTO TOPICS (posted, comments) VALUES (NOW(), '{}')`;

    db.query(query, (err, results) => {
        if (err) throw err;
    });

    db.query('SELECT * FROM TOPICS', (err, results) => {
        if (err) throw err;
        console.log(results);
    });
    res.send('ADDED POST');
})

module.exports = router;