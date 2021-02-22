const express = require('express');
const router = express.Router();
const db = require('../utilities/mysqlconn');
const validateToken = require('../utilities/validateToken');

// Renders the index page
router.get('/', validateToken, function (req, res) {
    //First Query to get the count for pagination
    var query1 = `SELECT COUNT(topicid) as tablelength FROM TOPICS;`
    db.query(query1).then((count, err) => {
        if (err) {
            res.send(err);
        } else {
            // Calculation for pagination
            var totalsize = count[0][0].tablelength;
            var pagesize = 8;
            var pagecount = Math.ceil(totalsize / pagesize);
            var currentpage = req.query.page ? parseInt(req.query.page) : 1;
            var start = (currentpage * pagesize) - 8;
            var end = start + 7;
            var endquery = pagesize;
            if (end > totalsize) {
                endquery = totalsize - start;
                end = totalsize - 1
            }
            // Query 2 to get the table from start of page to end of page
            var query2 = `SELECT * FROM TOPICS ORDER BY topicid DESC LIMIT ?, ?;`
            db.query(query2, [start, endquery]).then((table, err) => {
                if (err) {
                    res.send(err);
                } else {
                    var tableTopics = table[0];
                    if (!req.user) {
                        res.render('../views/index', {
                            topics: tableTopics, user: req.user, userLikes: {}, page: {
                                totalSize: totalsize,
                                pageSize: pagesize,
                                pageCount: pagecount,
                                currentPage: currentpage,
                                countStart: start,
                                countEnd: endquery
                            }
                        });
                    } else {
                        //Calculate the like display, checks users and all their topic likes
                        var currentTopicNum = [];
                        for (const [key, value] of Object.entries(tableTopics)) {
                            currentTopicNum.push(tableTopics[key].topicid);
                        }
                        //Final query to get likes from table for user
                        var query3 = `SELECT * FROM TLIKES WHERE userid = ? AND topicid IN (${currentTopicNum.join(',')});`
                        db.query(query3, req.user.id).then((tlikes, err) => {
                            if (err) {
                                res.send(err);
                            } else {
                                var tLikes = tlikes[0];
                                var userLikes = {};
                                //Calculate the like display, checks users and all their topic likes
                                for (const [key, value] of Object.entries(tLikes)) {
                                    if (!userLikes[req.user.id]) {
                                        userLikes[req.user.id] = [tLikes[key].topicid]
                                    } else {
                                        userLikes[req.user.id].push(tLikes[key].topicid);
                                    }
                                }
                                res.render('../views/index', {
                                    topics: tableTopics, user: req.user, userLikes: userLikes, page: {
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
    // // Query db to open all of the posts
    // var query1 = `SELECT COUNT(topicid) as tablelength FROM TOPICS;`
    // db.query(query1)
    //     .then((rows, err) => {
    //         if (err) {
    //             res.send(err);
    //         } else {
    //             // Calculation for the pagination
    //             var totalsize = rows[0][0].tablelength;
    //             var pagesize = 8;
    //             var pagecount = Math.ceil(totalsize / pagesize);
    //             var currentpage = req.query.page ? parseInt(req.query.page) : 1;
    //             var start = totalsize - (currentpage * pagesize) + 8;
    //             var end = start - 8;
    //             var endquery = pagesize;
    //             if (end < 0) {
    //                 endquery = start;
    //                 end = 0;
    //             }
    //             if (!req.user) {
    //                 var query2 = `SELECT * FROM TOPICS LIMIT ?, ?;`
    //                 db.query(query2, [end, endquery]).then((rows, err) => {
    //                     var tableTopics = rows[0];
    //                     res.render('../views/index', {
    //                         topics: tableTopics, user: req.user, userLikes: {}, page: {
    //                             totalSize: totalsize,
    //                             pageSize: pagesize,
    //                             pageCount: pagecount,
    //                             currentPage: currentpage,
    //                             countStart: start,
    //                             countEnd: end
    //                         }
    //                     });
    //                 });
    //             } else {
    //                 var userid = req.user.id;
    //                 var query2 = `SELECT * FROM TOPICS LIMIT ?, ?; SELECT * FROM TLIKES WHERE userid = ?;`
    //                 db.query(query2, [end, endquery, userid]).then((rows, err) => {
    //                     var tableTopics = rows[0][0];
    //                     var topicLikes = rows[0][1];
    //                     var userLikes = {};
    //                     //Calculate the like display, checks users and all their topic likes
    //                     for (const [key, value] of Object.entries(topicLikes)) {
    //                         if (!userLikes[req.user.id]) {
    //                             userLikes[req.user.id] = [topicLikes[key].topicid]
    //                         } else {
    //                             userLikes[req.user.id].push(topicLikes[key].topicid);
    //                         }
    //                     }
    //                     res.render('../views/index', {
    //                         topics: tableTopics, user: req.user, userLikes: userLikes, page: {
    //                             totalSize: totalsize,
    //                             pageSize: pagesize,
    //                             pageCount: pagecount,
    //                             currentPage: currentpage,
    //                             countStart: start,
    //                             countEnd: end
    //                         }
    //                     });
    //                 });
    //             }
    //         }
    //     }).catch(err => {
    //         console.log("Could Not Connect to database: " + err);
    //         res.sendStatus(403);
    //     });
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
                res.redirect(`/api/topics`);
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