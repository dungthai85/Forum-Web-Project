
const express = require('express');
const router = express.Router();
const db = require('../utilities/mysqlconn');
const validateToken = require('../utilities/validateToken');

// Renders the index page
router.get('/', validateToken, function (req, res) {
    //Query db to open all of the posts
    db.query('SELECT * FROM TOPICS')
        .then((rows, err) => {
            if (err) {
                console.log(err.code);
            }
            res.render('../views/index', { topics: rows[0], user: req.user });
        });
});

// Renders the addpost page
router.get('/addpost', validateToken, function (req, res) {
    if (req.user !== undefined) {
        res.render('../views/addpost', { uid: req.user.id });
    } else {
        res.redirect('/login');
    }
});

// Add endpoint to insert into list of topics
router.post('/addpost', validateToken, function (req, res) {
    if (req.user !== undefined) {
        var userid = req.user.id;
        var username = req.user.username;
        var topictitle = req.body.title;
        var topicdesc = req.body.desc;
        if (topictitle && topicdesc) {
            //Query to add post
            var query = `INSERT INTO TOPICS (userid, username, topicname, topicdetails, points, posted, comments) VALUES ( ? , ?, ? , ? , 0, NOW(), 0)`;
            db.query(query, [userid, username, topictitle, topicdesc])
                .then((rows, err) => {
                    if (err) {
                        console.log(err.code);
                    }
                    res.redirect('/api/topics/');
                });
        } else {
            res.sendStatus(500);
        }
    } else {
        res.redirect('/login');
    }
});

// Renders the editpost page
router.get('/editpost', validateToken, function (req, res) {
    if (req.user) {
        var topicid = req.query.topic;
        if (topicid) {
            //Query db for the topic to edit
            var query = `SELECT * FROM TOPICS WHERE topicid = ?`;
            db.query(query, [topicid])
                .then(rows => {
                    res.render('../views/editpost.ejs', { post: rows[0], user: req.user });
                });
        } else {
            res.sendStatus(500);
        }
    } else {
        res.redirect('/login');
    }
});

// edit endpoint to edit topic
router.post('/editpost', validateToken, function (req, res) {
    if (req.user) {
        var topictitle = req.body.title;
        var topicdetals = req.body.desc;
        var topicid = req.body.tid;
        if (topictitle && topicdetals && topicid) {
            //Query to edit the post
            var query = `UPDATE TOPICS SET topicname = ?, topicdetails = ? WHERE topicid = ? `;
            db.query(query, [topictitle, topicdetals, topicid])
                .then((rows, err) => {
                    if (err) {
                        console.log(err.code);
                    }
                });
            res.redirect('/api/topics/');
        } else {
            res.sendStatus(500);
        }
    } else {
        res.redirect('/login');
    }
});

// Renders the delete page
router.get('/deletepost', validateToken, function (req, res) {
    if (req.user) {
        var topicid = req.query.topic;
        if (topicid) {
            //Query db for the delete post
            var query = `SELECT * FROM TOPICS WHERE topicid = ?`;
            db.query(query, [topicid]).then((rows, err) => {
                if (err) {
                    console.log(err.code);
                }
                // console.log(results);
                res.render('../views/deletepost', { post: rows[0], user: req.user });
            });
        }
    } else {
        res.redirect('/login');
    }
});

// delete endpoint to delte topic
router.post('/deletepost', validateToken, function (req, res) {
    if (req.user) {
        var topicid = req.body.tid;
        if (topicid) {
            //Query db for the delete post
            var query = `DELETE FROM TOPICS WHERE topicid = ? ; DELETE FROM COMMENTS WHERE topicid = ?`;
            db.query(query, [topicid, topicid]).then((rows, err) => {
                if (err) {
                    console.log(err.code);
                }
                res.redirect('/api/topics/');
            });
        }
    } else {
        res.redirect('/login');
    }
});

// Increment like
router.get('/addlike', validateToken, function (req, res) {
    if (req.user) {
        var topicid = req.query.topic;
        if (topicid) {
            //Query to get the row
            var query = `UPDATE TOPICS SET points = points + 1 WHERE topicid = ? `;
            db.query(query, [topicid])
                .then(rows => {
                    if (req.query.page === "home") {
                        res.redirect('/api/topics/');
                    } else {
                        res.redirect(`/api/comments/?topic=${topicid}`);
                    }
                }).catch(err => {
                    console.log(err.code);
                });
        }
    } else {
        res.redirect('/login');
    }
});

module.exports = router;