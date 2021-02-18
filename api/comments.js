const express = require('express');
const router = express.Router();
const db = require('../utilities/mysqlconn');
const validateToken = require('../utilities/validateToken');

// Renders the comments page
router.get('/', validateToken, function (req, res) {
    var topicid = req.query.topic;
    if (topicid) {
        var query = `SELECT * FROM TOPICS WHERE topicid = ?; SELECT * FROM COMMENTS WHERE topicid = ?; SELECT * FROM TLIKES; SELECT * FROM CLIKES;`;
        db.query(query, [topicid, topicid]).then((rows, err) => {
            if (err) {
                res.send(err);
            } else {
                var tableTopics = rows[0][0];
                var tableComments = rows[0][1];
                var topicLikes = rows[0][2];
                var commentLikes = rows[0][3];
                var userTLikes = {};
                var userCLikes = {};
                //Calculate the like display, checks users and all their topic likes
                for (const [key, value] of Object.entries(topicLikes)) {
                    if (!userTLikes[topicLikes[key].userid]) {
                        userTLikes[topicLikes[key].userid] = [topicLikes[key].topicid]
                    } else {
                        userTLikes[topicLikes[key].userid].push(topicLikes[key].topicid);
                    }
                }
                //Calculate the like display, checks users and all their comment likes
                for (const [key, value] of Object.entries(commentLikes)) {
                    if (!userCLikes[commentLikes[key].userid]) {
                        userCLikes[commentLikes[key].userid] = [commentLikes[key].commentid]
                    } else {
                        userCLikes[commentLikes[key].userid].push(commentLikes[key].commentid);
                    }
                }
                // Calculation for the pagination
                var totalsize = tableComments.length;
                var pagesize = 10;
                var pagecount = Math.ceil(totalsize / pagesize);
                var currentpage = req.query.page ? parseInt(req.query.page) : 1;
                var start = totalsize - (currentpage * pagesize) + 10;
                var end = start - 10;
                if (end < 0) {
                    end = 0;
                }
                res.render('../views/comment', {
                    post: tableTopics, comments: tableComments, user: req.user, userTLikes: userTLikes, userCLikes: userCLikes, page: {
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
            console.log("Could Not Connect to database :" + err);
            res.sendStatus(403);
        });
    }
});

// Using the middleware to validate token.
router.use(validateToken, (req, res, next) => {
    if (!req.user) {
        res.redirect('/login');
    } else {
        next();
    }
});

// Addcomment endpoint to add coment topic
router.post('/addcomment', function (req, res) {
    // if(req.user){
    var arr = req.body.tid;
    var userid = req.user.id;
    var username = req.user.username;
    var comment = req.body.desc;
    query = `INSERT INTO COMMENTS (topicid, userid, username, commentdetails, posted, points) VALUES (?, ?, ?, ?, NOW(), 0); UPDATE TOPICS SET comments = comments+1 WHERE topicid = ?;`;
    db.query(query, [arr, userid, username, comment, arr]).then(row => {
        res.redirect(`/api/comments/?topic=${arr}`);
    }).catch(err => {
        res.status(503).send({ message: "The server is not ready to handle the request." });
    });
    // }
});

// Renders the edit comment page
router.get('/editcomment', function (req, res) {
    var topicid = req.query.topic;
    var commentid = req.query.comment;
    var page = req.query.page;
    if (commentid && topicid && page) {
        // Query db for the topic to edit
        db.query(`SELECT * FROM COMMENTS WHERE commentid = ?;`, [commentid])
            .then(rows => {
                res.render('../views/editcomment.ejs', { comments: rows[0], user: req.user, page: { currentPage: page }, post: [{ topicid: topicid }] });
            }).catch(err => {
                res.status(503).send({ message: "The server is not ready to handle the request." });
            });
    } else {
        res.sendStatus(500);
    }
});

// Edit comment endpoint to edit coment topic
router.post('/editcomment', function (req, res) {
    var commentdetails = req.body.desc;
    var body = req.body.tid.split(',');
    var topicid = body[0];
    var commentid = body[1];
    var page = body[2];
    if (commentdetails && commentid && topicid && page) {
        // Query to edit the post
        query = `UPDATE COMMENTS SET commentdetails = ? WHERE commentid = ?;`;
        db.query(query, [commentdetails, commentid])
            .then((rows, err) => {
                if (err) {
                    res.send(err);
                } else {
                    res.redirect(`/api/comments/?topic=${topicid}&page=${page}`);
                }
            }).catch(err => {
                res.status(503).send({ message: "The server is not ready to handle the request." });
            });
    } else {
        res.sendStatus(500);
    }
});

// Delete endpoint to delete comment
router.get('/deletecomment', function (req, res) {
    var topicid = req.query.topic;
    var commentid = req.query.comment;
    var page = req.query.page;
    if (commentid && topicid && page) {
        // Query db for the delete post
        var sql = `DELETE FROM COMMENTS WHERE commentid = ?; UPDATE TOPICS SET comments = comments - 1 WHERE topicid = ? ;`;
        db.query(sql, [commentid, topicid]).then((rows, err) => {
            if (err) {
                res.send(err);
            } else {
                res.redirect(`/api/comments/?topic=${topicid}&page=${page}`);
            }
        }).catch(err => {
            res.status(503).send({ message: "The server is not ready to handle the request." });
        });
    }
});

// Increment comment like
router.get('/commentlike', function (req, res) {
    var topicid = req.query.topic;
    var page = req.query.page;
    if (topicid) {
        // Query to get the row
        var query = `UPDATE COMMENTS SET points = points + 1 WHERE commentid = ? ; SELECT * FROM COMMENTS WHERE commentid = ?; INSERT INTO CLIKES (commentid, userid) VALUES ( ? , ?);`;
        db.query(query, [topicid, topicid, topicid, req.user.id])
            .then(rows => {
                res.redirect(`/api/comments/?topic=${rows[0][1][0].topicid}&page=${page}`);
            }).catch(err => {
                res.status(503).send({ message: "The server is not ready to handle the request." });
            });
    }
});

module.exports = router;