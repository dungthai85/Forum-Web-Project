
const express = require('express');
const router = express.Router();
const db = require('../utilities/mysqlconn');
const validateToken = require('../utilities/validateToken');

// Renders the index page
router.get('/', validateToken, function (req, res) {
    // Query db to open all of the posts
    var query = 'SELECT * FROM TOPICS; SELECT * FROM TLIKES;'
    db.query(query)
        .then((rows, err) => {
            if (err) {
                res.send(err);
            } else {
                var tableTopics = rows[0][0];
                var topicLikes = rows[0][1];
                var userLikes = {};
                //Calculate the like display, checks users and all their topic likes
                for (const [key, value] of Object.entries(topicLikes)) {
                    if (!userLikes[topicLikes[key].userid]){
                        userLikes[topicLikes[key].userid] = [topicLikes[key].topicid]
                    } else {
                        userLikes[topicLikes[key].userid].push(topicLikes[key].topicid);
                    }
                }

                // Calculation for the pagination
                var totalsize = tableTopics.length;
                var pagesize = 8;
                var pagecount = Math.ceil(totalsize / pagesize);
                var currentpage = req.query.page ? parseInt(req.query.page) : 1;
                var start = totalsize - (currentpage * pagesize) + 8;
                var end = start - 8;
                if (end < 0) {
                    end = 0;
                }
                res.render('../views/index', {
                    topics: tableTopics, user: req.user, userLikes: userLikes, page: {
                        totalSize: totalsize,
                        pageSize: pagesize,
                        pageCount: pagecount,
                        currentPage: currentpage,
                        countStart: start,
                        countEnd: end
                    }
                });
            }
        }).catch(err => {
            console.log("Could Not Connect to database: " + err);
            res.sendStatus(403);
        });
});

// Using the middleware to validate token.
router.use(validateToken, (req, res, next) => {
    if (!req.user) {
        res.redirect('/login');
    } else {
        next();
    }
});

// Renders the addpost page
router.get('/addpost', function (req, res) {
    res.render('../views/addpost', { uid: req.user.id });
});

// Add endpoint to insert into list of topics
router.post('/addpost', function (req, res) {
    var userid = req.user.id;
    var username = req.user.username;
    var topictitle = req.body.title;
    var topicdesc = req.body.desc;
    if (topictitle && topicdesc) {
        // Query to add post
        var query = `INSERT INTO TOPICS (userid, username, topicname, topicdetails, points, posted, comments) VALUES ( ? , ?, ? , ? , 0, NOW(), 0);`;
        db.query(query, [userid, username, topictitle, topicdesc])
            .then((rows, err) => {
                if (err) {
                    res.send(err);
                } else {
                    res.redirect('/api/topics/');
                }
            }).catch(err => {
                res.status(503).send({ message: "The server is not ready to handle the request." });
            });
    } else {
        res.sendStatus(500);
    }
});

// Renders the editpost page
router.get('/editpost', function (req, res) {
    var topicid = req.query.topic;
    var page = req.query.page;
    if (topicid) {
        // Query db for the topic to edit
        var query = `SELECT * FROM TOPICS WHERE topicid = ?;`;
        db.query(query, [topicid])
            .then(rows => {
                res.render('../views/editpost.ejs', { post: rows[0], user: req.user, page: { currentPage: page } });
            }).catch(err => {
                res.status(503).send({ message: "The server is not ready to handle the request." });
            });
    } else {
        res.sendStatus(500);
    }
});

// Edit endpoint to edit topic
router.post('/editpost', function (req, res) {
    var topictitle = req.body.title;
    var topicdetals = req.body.desc;
    var topicid = req.body.tid;
    if (topictitle && topicdetals && topicid) {
        // Query to edit the post
        var query = `UPDATE TOPICS SET topicname = ?, topicdetails = ? WHERE topicid = ? ;`;
        db.query(query, [topictitle, topicdetals, topicid])
            .then((rows, err) => {
                if (err) {
                    res.send(err);
                } else {
                    res.redirect('/api/topics/');
                }
            }).catch(err => {
                res.status(503).send({ message: "The server is not ready to handle the request." });
            });
    } else {
        res.sendStatus(500);
    }
});

// Renders the delete page
router.get('/deletepost', function (req, res) {
    var topicid = req.query.topic;
    var page = req.query.page;
    if (topicid) {
        // Query db for the delete post
        var query = `SELECT * FROM TOPICS WHERE topicid = ?;`;
        db.query(query, [topicid]).then((rows, err) => {
            if (err) {
                res.send(err);
            } else {
                res.render('../views/deletepost', { post: rows[0], user: req.user, page: { currentPage: page } });
            }
        }).catch(err => {
            res.status(503).send({ message: "The server is not ready to handle the request." });
        });
    }
});

// Delete endpoint to delte topic
router.post('/deletepost', function (req, res) {
    var topicid = req.body.tid;
    if (topicid) {
        // Query db for the delete post
        var query = `DELETE FROM TOPICS WHERE topicid = ? ; DELETE FROM COMMENTS WHERE topicid = ?;`;
        db.query(query, [topicid, topicid]).then((rows, err) => {
            if (err) {
                res.send(err);
            } else {
                res.redirect('/api/topics/');
            }
        }).catch(err => {
            res.status(503).send({ message: "The server is not ready to handle the request." });
        });
    }
});

// Increment like
router.get('/addlike', function (req, res) {
    var topicid = req.query.topic;
    var page = req.query.page;
    var home = req.query.home;
    if (topicid) {
        // Query to get the row
        var query = `UPDATE TOPICS SET points = points + 1 WHERE topicid = ?; INSERT INTO TLIKES (topicid, userid) VALUES ( ? , ?);`;
        db.query(query, [topicid, topicid, req.user.id])
            .then(rows => {
                if (home === "home") {
                    if (page) {
                        res.redirect(`/api/topics/?page=${page}`);
                    } else {
                        res.redirect('/api/topics/');
                    }
                } else {
                    res.redirect(`/api/comments/?topic=${topicid}&page=${page}`);
                }
            }).catch(err => {
                res.status(503).send({ message: "The server is not ready to handle the request." });
            });
    }
});

module.exports = router;