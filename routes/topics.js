
const express = require('express');
const router = express.Router();
const db = require('../utlities/mysqlconn');


const bodyParser = require('body-parser');

// urlencoded to help extract data from form
router.use(bodyParser.urlencoded({ extended: true }));

// Renders the index page
router.get('/', function (req, res) {
    //Query db to open all of the posts
    db.query('SELECT * FROM TOPICS')
        .then((rows, err) =>{
            if(err) {
                console.log(err.code);
            }
            console.table(rows[0]);
            res.render('../views/index', {topics : rows[0]});
    });
});

// Renders the addpost page
router.get('/addpost', function (req, res) {
    res.render('../views/addpost');
});

// Add endpoint to insert into list of topics
router.post('/addpost', function (req, res) {
    var fakeuserid = 14;
    var topictitle = req.body.title;
    var topicdesc = req.body.desc;
    if (topictitle && topicdesc) {
        //Query to add post
        query = `INSERT INTO TOPICS (userid, topicname, topicdetails, points, posted, comments) VALUES ( ? , ? , ? , 0, NOW(), 0)`;
        db.query(query, [fakeuserid, topictitle, topicdesc])
            .then((rows, err) => {
                if(err){
                    console.log(err.code);
                }
                res.redirect('/');
        });
    }  else {
        res.sendStatus(500);
    }

});

// Renders the editpost page
router.get('/editpost', function (req, res) {
    var topicid = req.query.topic;
    if (topicid) {
        //Query db for the topic to edit
        db.query(`SELECT * FROM TOPICS WHERE topicid = ?`, [topicid])
            .then(rows => {
                res.render('../views/editpost.ejs', { post: rows[0] });
        });
    } else {
        res.sendStatus(500);
    }

});

// edit endpoint to edit topic
router.post('/editpost', function (req, res) {
    var topictitle = req.body.title;
    var topicdetals = req.body.desc;
    var topicid = req.body.tid;
    if (topictitle && topicdetals && topicid){
        //Query to edit the post
        query = `UPDATE TOPICS SET topicname = ?, topicdetails = ? WHERE topicid = ? `;
        db.query(query, [topictitle, topicdetals, topicid])
            .then((rows, err) => {
                if(err){
                    console.log(err.code);
                }
    });

    res.redirect('/');
    } else {
        res.sendStatus(500);
    }

});

// Renders the delete page
router.get('/deletepost', function (req, res) {
    var topicid = req.query.topic;
    if(topicid){
        //Query db for the delete post
        db.query(`SELECT * FROM TOPICS WHERE topicid = ? `, [topicid]).then((rows, err) => {
            if (err) {
                console.log(err.code);
            }
            // console.log(results);
            res.render('../views/deletepost', {post: rows[0]});
        });
    }
});

// delete endpoint to delte topic
router.post('/deletepost', function (req, res) {
    var topicid = req.body.tid;
    if(topicid){
        //Query db for the delete post
        db.query(`DELETE FROM TOPICS WHERE topicid = ? `, [topicid]).then((rows, err) => {
            if (err) {
                console.log(err.code);
            }
            res.redirect('/');
        });
    }
});

// Increment like
router.get('/addlike', function (req, res) {
    var topicid = req.query.topic;

    if (topicid) {
        //Query to get the row
        var query1 = `SELECT * FROM TOPICS WHERE topicid = ? `;
        db.query(query1, [topicid])
            .then(rows => {
                var points = rows[0][0].points + 1;

                //Second query to update the points
                var query2 = `UPDATE TOPICS SET points = ? WHERE topicid = ? `;
                db.query(query2, [points, topicid]).then(rows => {

                }).catch(err => {
                    console.log(err.code);
                });

                if (req.query.page === "home") {
                    res.redirect('/');
                } else {
                    res.redirect(`comment?topic=${topicid}`);
                }

            }).catch(err => {
                console.log(err.code);
            });
    }
});

module.exports = router;