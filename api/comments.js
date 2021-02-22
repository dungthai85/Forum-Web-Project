const express = require('express');
const router = express.Router();
const db = require('../utilities/mysqlconn');
const validateToken = require('../utilities/validateToken');

// Renders the comments page
router.get('/', validateToken, function (req, res) {
    var topicid = req.query.topic;
    if (topicid) {
        //First query to get the count and the topic
        var query1 = `SELECT * FROM TOPICS WHERE topicid = ?; SELECT COUNT(commentid) as commentlength FROM COMMENTS WHERE topicid = ?;`;
        db.query(query1, [topicid, topicid]).then((row, err1) => {
            if (err1) {
                res.send(err1);
            } else {
                // Calculation for the pagination
                var totalsize = row[0][1][0].commentlength;
                var pagesize = 10;
                var pagecount = Math.ceil(totalsize / pagesize);
                var currentpage = req.query.page ? parseInt(req.query.page) : 1;
                var start = (currentpage * pagesize) - 10;
                var end = start + 9;
                var endquery = pagesize;
                if (end > totalsize) {
                    endquery = totalsize - start;
                    end = totalsize - 1;
                }
                // Table for topic
                var tableTopics = row[0][0];
                // Second query to get table for comments
                var query2 = `SELECT * FROM COMMENTS WHERE topicid = ? ORDER BY commentid DESC LIMIT ?, ?;`;
                db.query(query2, [topicid, start, endquery]).then((rows, err2) => {
                    if (err2) {
                        res.send(err2);
                    } else {
                        // Table of comments
                        var tableComments = rows[0];
                        if (!req.user) {
                            res.render('../views/comment', {
                                post: tableTopics, comments: tableComments, user: req.user, userTLikes: {}, userCLikes: {}, page: {
                                    totalSize: totalsize,
                                    pageSize: pagesize,
                                    pageCount: pagecount,
                                    currentPage: currentpage,
                                    countStart: start,
                                    countEnd: endquery
                                }
                            });
                        } else {
                            //Calculate the like display, checks users and all their comment likes
                            var currentCommentNum = [];
                            for (const [key, value] of Object.entries(tableComments)) {
                                currentCommentNum.push(tableComments[key].commentid);
                            }
                            // Final query to get likes from topics and comments from current user
                            var query3 = `SELECT * FROM TLIKES WHERE userid = ? and topicid = ?; SELECT * FROM CLIKES WHERE userid = ? AND commentid IN (${currentCommentNum.length === 0 ? 0 : currentCommentNum.join(',')});`;
                            db.query(query3, [req.user.id, topicid, req.user.id]).then((likes, err3) => {
                                if (err3) {
                                    res.send(err3);
                                } else {
                                    var userTLikes = {};
                                    var userCLikes = {};
                                    var tlikes = likes[0][0];
                                    var clikes = likes[0][1];
                                    //Calculate the like display, checks users and all their topic likes
                                    for (const [key, value] of Object.entries(tlikes)) {
                                        if (!userTLikes[req.user.id]) {
                                            userTLikes[req.user.id] = [tlikes[key].topicid];
                                        } else {
                                            userTLikes[req.user.id].push(tlikes[key].topicid);
                                        }
                                    }
                                    //Calculate the like display, checks users and all their comment likes
                                    for (const [key, value] of Object.entries(clikes)) {
                                        if (!userCLikes[req.user.id]) {
                                            userCLikes[req.user.id] = [clikes[key].commentid];
                                        } else {
                                            userCLikes[req.user.id].push(clikes[key].commentid);
                                        }
                                    }
                                    // console.table(tableComments);
                                    res.render('../views/comment', {
                                        post: tableTopics, comments: tableComments, user: req.user, userTLikes: userTLikes, userCLikes: userCLikes, page: {
                                            totalSize: totalsize,
                                            pageSize: pagesize,
                                            pageCount: pagecount,
                                            currentPage: currentpage,
                                            countStart: start,
                                            countEnd: endquery
                                        }
                                    });
                                }
                            }).catch((error3) => {
                                console.log(error3);
                                res.send(error3);
                            });
                        }
                    }
                }).catch((error2) => {
                    res.send(error2);
                });
            }
        }).catch((error1) => {
            res.send(error1);
        });

    } else {
        res.send("Invalid Comment Selection!");
    }
    // var topicid = req.query.topic;
    // if (topicid) {
    //     var query1 = `SELECT * FROM TOPICS WHERE topicid = ?; SELECT COUNT(commentid) as commentlength FROM COMMENTS WHERE topicid = ?;`
    //     db.query(query1, [topicid, topicid]).then((row, err) => {
    //         if (err) {
    //             res.send(err);
    //         } else {
    //             // Calculation for the pagination
    //             var totalsize = row[0][1][0].commentlength;
    //             var pagesize = 10;
    //             var pagecount = Math.ceil(totalsize / pagesize);
    //             var currentpage = req.query.page ? parseInt(req.query.page) : 1;
    //             var start = totalsize - (currentpage * pagesize) + 10;
    //             var end = start - 10;
    //             var endquery = pagesize;
    //             if (end < 0) {
    //                 endquery = start;
    //                 end = 0;
    //             }
    //             // Table for topic
    //             var tableTopics = row[0][0];
    //             if (!req.user) {
    //                 var query2 = `SELECT * FROM COMMENTS WHERE topicid = ? LIMIT ?, ?;`
    //                 db.query(query2, [topicid, end, endquery]).then((rows, err) => {
    //                     var tableComments = rows[0];
    //                     res.render('../views/comment', {
    //                         post: tableTopics, comments: tableComments, user: req.user, userTLikes: {}, userCLikes: {}, page: {
    //                             totalSize: totalsize,
    //                             pageSize: pagesize,
    //                             pageCount: pagecount,
    //                             currentPage: currentpage,
    //                             countStart: start,
    //                             countEnd: end
    //                         }
    //                     });
    //                 })
    //             } else {
    //                 var query2 = `SELECT * FROM COMMENTS WHERE topicid = ? LIMIT ?, ?; SELECT * FROM TLIKES WHERE userid = ?; SELECT * FROM CLIKES WHERE userid = ?;`
    //                 db.query(query2, [topicid, end, endquery, req.user.id, req.user.id]).then((rows, err) => {
    //                     var tableComments = rows[0][0];
    //                     var userTLikes = rows[0][1];
    //                     var userCLikes = rows[0][2];
    //                     console.log(tableComments.length);
    //                     res.render('../views/comment', {
    //                         post: tableTopics, comments: tableComments, user: req.user, userTLikes: userTLikes, userCLikes: userCLikes, page: {
    //                             totalSize: totalsize,
    //                             pageSize: pagesize,
    //                             pageCount: pagecount,
    //                             currentPage: currentpage,
    //                             countStart: start,
    //                             countEnd: end
    //                         }
    //                     });
    //                 })
    //             }
    //         }
    //     })
    // }
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